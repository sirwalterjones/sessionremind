# SessionRemind — project state & handoff

> Maintained by Claude Code sessions. **Update this file when you ship something
> significant or leave work in flight** — it's how the next machine/session picks
> up where the last one left off. Never put secrets in here (they live in Vercel
> env vars). Last updated: **2026-06-10**.

## What this is

Multi-tenant SaaS for photographers (sessionremind.com): syncs their bookings
from UseSession and sends automatic SMS + email session reminders to clients.
Owner: Walter Jones (sirwalterjones). **Not affiliated with Session
Technologies, LLC** — that disclaimer must stay in the footer and emails.

## Stack & infrastructure

- **Next.js 14 (app router)** on **Vercel** (`walter-jones-projects/sessionremind-app`).
  Auto-deploys from `main` (~40s). `vercel ls` / `vercel env ls` work from the repo dir.
- **Vercel KV (Upstash Redis)** is the ONLY datastore. Users are `user:<uuid>`
  hashes + `user:email:<email>` index; messages in one JSON blob via `lib/storage.ts`.
- **Stripe (live mode)**: 4 plans in `lib/plans.ts` (Starter $15/150, Studio $29/500,
  Pro $59/1.5k, Volume $119/4k). Webhook endpoint `we_1TgcWYF41fBQdxiwblkpOEoK`
  → `/api/stripe/webhook` (created 2026-06-10; before that NO endpoint existed for
  this domain — that's what caused historical subscription drift). Webhook secrets
  are only returned at endpoint creation; to rotate, create a new endpoint.
- **Resend**: transactional email from `noreply@sessionremind.com` (domain verified;
  DNS at Namecheap). Shared branded template: `renderBrandedEmail` in `lib/email.ts`.
- **Twilio** (ISV model): per-tenant toll-free numbers + one shared platform number.
- **TextMagic**: legacy shared sender (833-374-6207) — still the LIVE send path until
  a Twilio number passes carrier verification. Send routing in `lib/sms.ts`:
  tenant's own active number → shared Twilio number → TextMagic fallback.
- **Cloudflare Turnstile** on register/login/contact.
- **DNS**: Namecheap (NOT Vercel) for sessionremind.com. Namecheap API `setHosts`
  is a FULL-ZONE REPLACE — always getHosts first and resubmit everything.

## Where things stand (2026-06-10)

### Live and verified
- UseSession sync (5-min cron `/api/cron`): auto-schedules, updates on reschedule,
  cancels on deletion. UseSession API needs `Authorization: Bearer <jwt>`.
- **Overage billing** (see gotchas before touching): texts past quota send and bill
  via Stripe invoice items; monthly UTC quota everywhere; 1×-included cap.
- Support suite: `/contact` → KV tickets → email heads-up to the operator →
  handled at `/admin/support` (replies email the requester via Resend).
- Marketing/docs pages: `/`, `/instructions`, `/faq`, `/help`, `/privacy`,
  `/sms-opt-in`, `/contact` — all copy fact-checked against actual behavior.
- Email verification flow exists; **enforcement OFF** (`REQUIRE_EMAIL_VERIFICATION`
  unset). Flip to `true` in Vercel env when Walter wants it.
- Admin: `/admin` (+ `/admin/support`, `/admin/shared-number`, `/admin/subscriptions`,
  `/admin/spam`), all linked from the admin header.
- **The UseSession page is `/connect`** (renamed from `/automation`, which now
  redirects). Onboarding wizard at `/welcome` runs after first checkout
  (payment-required polls for the webhook-recorded sub, then routes
  not-yet-connected users there). Setup status surfaces: dashboard card +
  Connect page's texting-number card (`components/SetupStatus.tsx`); the
  connector bookmarklet builder is shared in `lib/bookmarklet.ts`.
- **Forgot-password flow** (2026-06-10): `/forgot-password` → Turnstile-gated,
  enumeration-safe `/api/auth/forgot-password` → branded Resend email → 1h
  single-use token (`lib/password-reset.ts`, KV `pwreset:<token>`) →
  `/reset-password?token=` → `/api/auth/forgot-password/confirm` writes the
  hash to `user:<id>:password` (the key login checks). The logged-in change
  route (`/api/auth/reset-password`) was rewritten the same day — it had been
  kv.get/kv.set-ing the hash-stored user record (WRONGTYPE → 500 since the
  hash migration).
- **Auth/marketing visual refresh** (2026-06-10): `/register` and `/login` are
  split editorial layouts (pitch left, panel-card form right); homepage hero
  panel is now `components/HeroDemo.tsx`, a looping animated demo (sync → rows
  → typing → DELIVERED). OG/Twitter cards are build-time-rendered from
  `app/opengraph-image.tsx` using fonts in `assets/fonts/` (satori: every
  multi-child div needs explicit display:flex; no JSX entities — they split
  text into multiple children). Nav order: app pages first, Help/Profile last.
- **Admin master number list**: `/admin/numbers` (API
  `/api/admin/sms-senders`, scans KV `user:*:sms_sender`) shows every tenant
  toll-free request + the platform shared number with provisioning/verification
  status and a per-row "Refresh from Twilio".

### In flight / waiting
1. **Shared Twilio toll-free number (844) 455-1042 is IN_REVIEW** (toll-free
   verification `HHcfdd2049fb97c559ad9d520fd221f29b`, submitted 2026-06-10,
   typically days–3 weeks). The 5-min cron polls it; on approval it auto-activates
   (all sending moves off TextMagic automatically) and emails the business contact.
   State: KV `user:__platform_shared__:sms_sender`; console: `/admin/shared-number`.
2. **After the 844 number activates**: send a live Twilio test text, then build
   Twilio delivery-status reporting into admin (status-callback webhook stamping
   delivered/undelivered per message). Inbound webhook `/api/twilio/inbound`
   already validates X-Twilio-Signature and handles STOP/HELP.
3. **Secret rotation owed**: the Resend API key, Namecheap API key, Turnstile
   secret, and Twilio auth token were pasted in chat sessions. Rotate at the
   provider, then update the matching Vercel env vars.
4. Old local Twilio number +17703366289 has a FAILED 10DLC campaign — unusable
   for A2P; candidates for release if not needed for anything else.

### Security audit (2026-06-10)
A 4-agent audit (API authz, auth/session, injection/XSS, billing/cron) ran and
the confirmed holes were fixed in the same session:
- **Fixed CRITICAL**: `DELETE /api/cancel-message/[id]` had NO auth — anyone
  could delete any tenant's reminder by id. Now session-gated + owner-scoped
  via `deleteScheduledMessage(id, user.id)`.
- **Fixed HIGH**: `/api/cron` and `/api/process-scheduled` trusted a
  `User-Agent: vercel` substring as auth (spoofable). Now gate ONLY on
  `Authorization: Bearer ${CRON_SECRET}` — keep CRON_SECRET set in Vercel or
  the cron 401s (Vercel Cron sends that header automatically).
- **Fixed HIGH**: SSRF in `/api/extract-session` + `/api/extract-usesession`
  (`url.includes('session.com')` was bypassable). Now use
  `lib/url-guard.ts validateExtractUrl` (host allowlist + private/metadata-IP
  block). These ARE live (used by `/new`, SimpleMobile, URLExtractor).
- **Fixed MEDIUM**: deleted dead `/api/test-textmagic` (leaked operator
  TextMagic name+balance, no auth) and `/api/debug-form`. Sessions now revoked
  on password reset/change (`deleteAllUserSessions`, backed by a
  `user:<id>:sessions` set populated in `createSession`). Single-use tokens use
  atomic `kv.getdel`. Password min raised 6→8 everywhere.
- **Known/accepted, NOT yet done** (see audit, lower priority): no rate
  limiting on login / forgot-password / resend-verification (only `/contact`
  has it — consider Upstash ratelimit); register still leaks "email already
  exists" (enumeration); email not normalized/lowercased at register (mixed
  case = distinct accounts — DON'T fix naively, it strands existing accounts
  since login lookup is case-exact too); `send-sms` trusts client `optedIn`
  bool (TCPA gap, not free-SMS — quota still gates); Turnstile fails OPEN if
  `TURNSTILE_SECRET_KEY` unset (matters during the pending secret rotation);
  `CRON_SECRET` doubles as the token-encryption key seed (split once cron auth
  is hardened). middleware referer-bypass is defense-in-depth only today (all
  protected pages are client components that re-auth via API) — becomes a real
  hole if anyone adds a server-component protected page that reads data.

## Gotchas — read before editing

- **NEVER set `ENCRYPTION_KEY`.** Stored UseSession tokens are encrypted with the
  key derived from `CRON_SECRET` (the fallback in `lib/crypto.ts`). Setting
  `ENCRYPTION_KEY` changes the derived key and bricks every stored token.
- **Overage billing protocol** (`lib/usage.ts`): billing uses a two-phase claim
  (freeze intent in KV → create invoice item with idempotency key from the claim
  base → settle). Do NOT simplify to read-compute-create: an adversarial review
  proved single-phase double-charges after a crash (Stripe idempotency only
  protects byte-identical retries, and the delta grows for active users).
- **Quota is monthly (UTC), bucketed by send-month** (`reconcilePlan` in
  `lib/reminders.ts`). It used to count lifetime sends — never regress to that.
  All schedule/send paths gate on the same allowance (`getSendAllowance`).
- **Eligibility standard**: paid features (overage headroom, dedicated number)
  gate on `stripe_subscription_id` — set ONLY by the signature-verified webhook —
  never on `subscription_status`, which defaults to 'active' for every signup.
- **Multiple Claude sessions have collided on this repo.** Always
  `git fetch && git status -sb` before pushing; prefer adopting remote work that
  was live-tested over your parallel copy.
- **Vercel env changes need a redeploy** (`vercel redeploy <latest-prod-url>`).
- **Marketing copy honesty rules** (a 17-agent audit fixed violations once):
  reminders contain session *date and time* (no "location"); we DO store
  name/phone/email/session per reminder (say "only what a reminder needs",
  never "we never store"); dedicated numbers are optional on every paid plan;
  the overage cap must stay mentioned wherever overage is promised.
- Send-time floor: nothing sends before 8am ET; default reminders 3-day + 1-day
  at ~10am ET; default template must stay GSM-7 (no em dashes — a single one
  triples SMS cost).

## Key files

| Area | Files |
|---|---|
| Reminder engine | `lib/reminders.ts` (build/reconcile/quota), `lib/sync.ts`, `lib/storage.ts` |
| Usage + overage billing | `lib/usage.ts` (claim protocol), cron step 4 in `app/api/cron/route.ts` |
| SMS routing | `lib/sms.ts` (tenant → shared → TextMagic, opt-out suppression), `lib/twilio.ts` |
| Toll-free provisioning | `lib/provisioning.ts` (`__platform_shared__` pseudo-tenant for the shared number) |
| UseSession API | `lib/usesession.ts` (Bearer + token sanitizing), connect routes under `app/api/usesession/` |
| Billing/plans | `lib/plans.ts`, `app/api/stripe/*`, `lib/subscriptions.ts` |
| Email | `lib/email.ts` (branded template + all senders) |
| Support tickets | `lib/support.ts`, `app/api/contact`, `app/api/admin/support`, `app/admin/support` |
| Auth/middleware | `lib/auth.ts`, `middleware.ts` (protected/public route lists) |

## Conventions

- Design system: white canvas, ink `#141414`, accent `#DD4D24`, hairline `#ECEAE4`,
  muted `#6E6A63`, tint `#FAFAF8`; `eyebrow` + `font-display` classes; rounded-2xl
  hairline cards; pill buttons. Match `/contact` or `/onboarding` for new pages.
- Notifications: `useToast`/`useConfirm` from `components/Notifications.tsx` —
  never native `alert()`/`confirm()`.
- Before shipping money-path or compliance changes: typecheck, `npm run build`,
  scenario-test pure logic, and adversarially review. It has caught critical bugs
  every single time.
