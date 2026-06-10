// Subscription plan catalog. Stripe price IDs created live on 2026-06-09.
// sms_limit per plan is the included texts. NOTE: texts beyond sms_limit are
// NOT billed — they are skipped (skippedForQuota in lib/sync.ts). The `overage`
// rates below are reserved for a future metered-billing implementation and
// must not be shown as a promise in marketing copy until that exists.

export type PlanKey = 'starter' | 'studio' | 'pro' | 'volume'

export interface Plan {
  key: PlanKey
  name: string
  priceId: string
  price: number // USD / month
  includedTexts: number
  overage: number // USD per text over the included amount (future metered billing — not yet charged)
  blurb: string
  features: string[]
}

export const PLANS: Plan[] = [
  {
    key: 'starter',
    name: 'Starter',
    priceId: 'price_1TgP4EF41fBQdxiwGwf0E8Ul',
    price: 15,
    includedTexts: 150,
    overage: 0.05,
    blurb: 'For a smaller book of sessions.',
    features: ['150 texts/mo included', 'Email reminders included', 'Auto-sync from UseSession', 'Optional dedicated sending number'],
  },
  {
    key: 'studio',
    name: 'Studio',
    priceId: 'price_1TgP4EF41fBQdxiwTk3FZRjc',
    price: 29,
    includedTexts: 500,
    overage: 0.04,
    blurb: 'The everyday plan for a busy studio.',
    features: ['500 texts/mo included', 'Email reminders included', 'Optional dedicated sending number'],
  },
  {
    key: 'pro',
    name: 'Pro',
    priceId: 'price_1TgP4FF41fBQdxiwLubXZhPs',
    price: 59,
    includedTexts: 1500,
    overage: 0.03,
    blurb: 'High-volume shooters and small teams.',
    features: ['1,500 texts/mo included', 'Email reminders included', 'Optional dedicated sending number', 'Priority support'],
  },
  {
    key: 'volume',
    name: 'Volume',
    priceId: 'price_1TgP4FF41fBQdxiwNIzTUCQP',
    price: 119,
    includedTexts: 4000,
    overage: 0.03,
    blurb: 'Studios running at scale.',
    features: ['4,000 texts/mo included', 'Email reminders included', 'Optional dedicated sending number', 'Priority support'],
  },
]

export const DEFAULT_PLAN_KEY: PlanKey = 'studio'

export function planByKey(key?: string | null): Plan | undefined {
  return PLANS.find((p) => p.key === key)
}

export function planByPriceId(priceId?: string | null): Plan | undefined {
  return PLANS.find((p) => p.priceId === priceId)
}
