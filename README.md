# SessionRemind

**They book. We remind. You shoot.**

Multi-tenant SaaS for photographers — syncs bookings from [UseSession](https://usesession.com) and automatically sends SMS & email session reminders to clients, so calendars actually show up.

> 🚀 Live at [sessionremind.com](https://sessionremind.com) · *Not affiliated with Session Technologies, LLC*

## How it works

1. **Connect once** — a photographer links their UseSession account with a one-time bookmarklet (no passwords; a read-only access token, encrypted at rest).
2. **Bookings sync automatically** — a cron pulls upcoming sessions every 5 minutes. New bookings schedule reminders; reschedules update them; cancellations cancel them.
3. **Clients get reminded** — by text (and optionally email) 3 days and 1 day before each session, in the studio's own voice via customizable templates. STOP/HELP handled automatically.

## Product surface

| Area | Where |
|---|---|
| Marketing / docs | `/`, `/instructions`, `/faq`, `/help`, `/privacy`, `/sms-opt-in`, `/contact` |
| Onboarding | `/welcome` (post-checkout wizard), `/onboarding` (dedicated texting number) |
| App | `/dashboard`, `/connect` (UseSession + settings), `/reminders`, `/new`, `/profile` |
| Admin | `/admin` + support inbox, shared-number console, subscriptions, spam cleanup |

## Stack

- **Next.js 14 (app router)** on **Vercel**, auto-deployed from `main`
- **Vercel KV** (Upstash Redis) — the only datastore
- **Stripe** — 4 subscription tiers + per-text overage billed as invoice items
- **Twilio** — per-tenant toll-free numbers (ISV model) + one shared platform number; TextMagic as the legacy fallback sender
- **Resend** — branded transactional email from `noreply@sessionremind.com`
- **Cloudflare Turnstile** — bot protection on register/login/contact

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in your own values — never commit secrets
npm run dev
```

Required env vars are documented in `.env.local.example`. Production values live in Vercel env settings.

## Conventions & deeper docs

- **`CLAUDE.md`** is the living engineering handoff: current state, in-flight work, and hard-won gotchas (billing protocol, toll-free verification compliance, encryption-key trap). **Read it before changing anything load-bearing.**
- Design system, money-path rules, and compliance constraints are documented there and enforced in code comments.
- `SAAS_TRANSFORMATION_PLAN.md` is a historical planning document kept for context; it does not describe the current system.

## Deploying

Push to `main` → Vercel builds and deploys (~40s). Env var changes require a redeploy. Always `git fetch` before pushing — multiple machines/sessions work on this repo.
