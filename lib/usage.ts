// Monthly SMS usage + overage accounting and billing.
//
// recordSmsSent() keeps a per-user per-UTC-calendar-month counter. Once a
// month's sends exceed the included quota (sms_limit), the excess accrues as
// billable overage — but ONLY for users with a real Stripe subscription, only
// up to the advertised cap (1x the included quota), and at the plan rate
// frozen AT ACCRUAL TIME (so a mid-month plan change can't rewrite history).
//
// billPendingOverage() (cron) turns accrued-but-unbilled cents into Stripe
// INVOICE ITEMS (swept automatically onto the customer's next subscription
// invoice) using a two-phase billing-intent protocol:
//
//   1. CLAIM:  freeze {base, delta_cents, delta_texts} into the usage hash
//   2. CREATE: stripe.invoiceItems.create built PURELY from the frozen claim,
//              with an idempotency key derived from the claim's base
//   3. SETTLE: advance billed counters to base+delta and clear the claim
//
// A crash at any point retries with byte-identical request params under the
// same idempotency key, so Stripe replays the original item instead of
// erroring or double-charging. New overage accrued during a retry window
// simply becomes the NEXT claim's delta.

import { kv } from '@vercel/kv'
import { stripe } from './stripe'
import { planByKey } from './plans'

const PENDING_SET = 'overage:pending' // members: `${userId}:${YYYY-MM}`
const USAGE_TTL_SECONDS = 60 * 60 * 24 * 120 // keep ~4 months of counters

// Fallback for legacy accounts with no `plan` field (old flat $20/500 plan).
const DEFAULT_OVERAGE_RATE = 0.04

export function billingMonth(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

const usageKey = (userId: string, month: string) => `usage:${userId}:${month}`

export interface MonthlyUsage {
  sent: number
  overage: number // billable overage texts accrued
  owedCents: number // billable overage cents accrued (rate frozen per text)
  billedTexts: number
  billedCents: number
}

function parseUsage(h: Record<string, number | string> | null): MonthlyUsage {
  return {
    sent: Number(h?.sent) || 0,
    overage: Number(h?.overage) || 0,
    owedCents: Number(h?.owed_cents) || 0,
    billedTexts: Number(h?.billed_texts) || 0,
    billedCents: Number(h?.billed_cents) || 0,
  }
}

// Throwing read — used by the billing sweep so a transient KV failure retries
// the member next pass instead of being mistaken for "nothing owed".
async function readMonthlyUsageRaw(
  userId: string,
  month: string
): Promise<Record<string, number | string> | null> {
  return await kv.hgetall<Record<string, number | string>>(usageKey(userId, month))
}

// Safe read for display purposes.
export async function getMonthlyUsage(userId: string, month?: string): Promise<MonthlyUsage> {
  try {
    return parseUsage(await readMonthlyUsageRaw(userId, month || billingMonth()))
  } catch {
    return { sent: 0, overage: 0, owedCents: 0, billedTexts: 0, billedCents: 0 }
  }
}

// How many more texts this user may send this month: included quota plus, for
// users with a real Stripe subscription, the advertised overage headroom of
// 1x the included quota. Used to gate the manual send/schedule paths.
export async function getSendAllowance(userId: string): Promise<{
  included: number
  cap: number // extra texts allowed beyond included (0 for non-subscribers)
  sent: number
  remaining: number
}> {
  const user = await kv.hgetall<Record<string, any>>(`user:${userId}`)
  const included = Number(user?.sms_limit) || 500
  const cap = user?.stripe_subscription_id ? included : 0
  const { sent } = await getMonthlyUsage(userId)
  return { included, cap, sent, remaining: Math.max(0, included + cap - sent) }
}

// Record one successful SMS send. Maintains the legacy lifetime counter
// (sms_usage, shown in the UI) AND the monthly counter that drives quota +
// overage billing. Never throws — usage tracking must not break sending.
export async function recordSmsSent(userId: string, now: Date = new Date()): Promise<void> {
  try {
    const month = billingMonth(now)
    const key = usageKey(userId, month)
    const sent = await kv.hincrby(key, 'sent', 1)
    if (sent === 1) await kv.expire(key, USAGE_TTL_SECONDS).catch(() => {})

    // Legacy lifetime counter (dashboard display).
    await kv.hincrby(`user:${userId}`, 'sms_usage', 1).catch(() => {})

    const user = await kv.hgetall<Record<string, any>>(`user:${userId}`)
    const included = Number(user?.sms_limit) || 500
    // Billable overage only for users with a real Stripe subscription, and
    // only inside the advertised cap window (1x included). Texts beyond the
    // cap (which the schedulers/gates shouldn't allow anyway) are never
    // billed — the cap is a promise to the customer.
    const eligible = Boolean(user?.stripe_subscription_id)
    const cap = included
    if (eligible && sent > included && sent <= included + cap) {
      const rate = planByKey(user?.plan)?.overage ?? DEFAULT_OVERAGE_RATE
      const rateCents = Math.round(rate * 100)
      // sadd BEFORE the accrual increments: if sadd fails, nothing accrues
      // (benign undercharge); if an increment fails after sadd, the sweep
      // still finds the member and bills what did get recorded. The reverse
      // order could accrue owed money the sweep never discovers.
      await kv.sadd(PENDING_SET, `${userId}:${month}`)
      await kv.hincrby(key, 'overage', 1)
      await kv.hincrby(key, 'owed_cents', rateCents)
    }
  } catch (error) {
    console.error('recordSmsSent error:', error)
  }
}

export interface OverageBillingSummary {
  customersBilled: number
  textsBilled: number
  amountCents: number
  errors: number
}

// Turn accrued-but-unbilled overage into Stripe invoice items. Called from the
// cron; safe to run repeatedly and safe to crash at any point (see the
// billing-intent protocol at the top of this file).
export async function billPendingOverage(now: Date = new Date()): Promise<OverageBillingSummary> {
  const summary: OverageBillingSummary = {
    customersBilled: 0,
    textsBilled: 0,
    amountCents: 0,
    errors: 0,
  }

  let members: string[] = []
  try {
    members = (await kv.smembers<string[]>(PENDING_SET)) || []
  } catch (error) {
    console.error('billPendingOverage smembers error:', error)
    return summary
  }
  const currentMonth = billingMonth(now)

  for (const member of members) {
    try {
      const sep = member.lastIndexOf(':')
      if (sep < 0) {
        await kv.srem(PENDING_SET, member).catch(() => {})
        continue
      }
      const userId = member.slice(0, sep)
      const month = member.slice(sep + 1)
      const key = usageKey(userId, month)

      // Throwing read: a transient KV failure aborts THIS member (caught
      // below, retried next sweep) instead of reading zeros and dropping it.
      const h = await readMonthlyUsageRaw(userId, month)
      const usage = parseUsage(h)

      // Phase 1 — CLAIM. Reuse an existing un-settled claim verbatim (its
      // request bytes must not change across retries); otherwise freeze the
      // current owed-but-unbilled delta.
      let claimBase = Number(h?.intent_base)
      let claimCents = Number(h?.intent_cents)
      let claimTexts = Number(h?.intent_texts)
      const hasClaim =
        Number.isFinite(claimBase) && Number.isFinite(claimCents) && claimCents > 0 &&
        // A claim from a previous protocol state only counts if it still
        // matches the un-advanced billed counter; a settled claim was cleared.
        claimBase === usage.billedCents

      if (!hasClaim) {
        const deltaCents = usage.owedCents - usage.billedCents
        const deltaTexts = usage.overage - usage.billedTexts
        if (deltaCents <= 0) {
          // Nothing to bill. Past months are done; current month stays (more
          // overage may accrue before it rolls over).
          if (month !== currentMonth) await kv.srem(PENDING_SET, member)
          continue
        }
        claimBase = usage.billedCents
        claimCents = deltaCents
        claimTexts = Math.max(1, deltaTexts)
        await kv.hset(key, {
          intent_base: claimBase,
          intent_cents: claimCents,
          intent_texts: claimTexts,
        })
      }

      const user = await kv.hgetall<Record<string, any>>(`user:${userId}`)
      const customerId = user?.stripe_customer_id as string | undefined
      if (!customerId) {
        // Accrual is gated on a Stripe subscription, so this should not
        // happen; keep the member (and the claim) so a restored customer
        // record can still be billed, but drop stale past months eventually.
        console.error(`billPendingOverage: ${userId} owes ${claimCents}c but has no Stripe customer`)
        continue
      }

      // Phase 2 — CREATE, built purely from the frozen claim.
      await stripe.invoiceItems.create(
        {
          customer: customerId,
          currency: 'usd',
          amount: claimCents,
          description: `SMS overage — ${claimTexts} text${claimTexts === 1 ? '' : 's'} (${month})`,
        },
        { idempotencyKey: `sr-overage-${userId}-${month}-${claimBase}` }
      )

      // Phase 3 — SETTLE.
      await kv.hset(key, {
        billed_cents: claimBase + claimCents,
        billed_texts: usage.billedTexts + claimTexts,
      })
      await kv.hdel(key, 'intent_base', 'intent_cents', 'intent_texts').catch(() => {})

      summary.customersBilled++
      summary.textsBilled += claimTexts
      summary.amountCents += claimCents
    } catch (error) {
      summary.errors++
      console.error(`billPendingOverage error for ${member}:`, error)
    }
  }

  return summary
}
