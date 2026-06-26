# Re:Fit — Continue Here (session handoff)

> **New session: read this first, then `docs/BUILD_BRIEF.md`.** This file is the
> single source of "where we are and what's next."

## What this is
**Re:Fit** — a concierge mobile tailoring marketplace. A stylist pins your
garments at home (or you self-pin), vetted tailors do the work, couriers return
them. Three surfaces: **marketing** site, customer **app**, staff **admin** portal.

This repo (`ethangrundleger-maker/refit`) was migrated out of an old `baby-app`
repo. `refit/main` is the canonical home now. Ignore any `baby-app` references in
older commit messages — they're leftover scaffolding labels; the code is all Re:Fit.

## Current state: FRONTEND COMPLETE (mock data, no backend yet)
Everything is built as a clickable Next.js 16 (App Router) prototype with mock
data in `lib/mock/`. It builds clean (`npm run build`) and type-checks
(`npm run typecheck`) with zero errors. ~50 routes across all three surfaces.

### Key directories
- `app/(marketing)/` — public site (home, services, memberships, parties, help, check-area, legal)
- `app/app/` — customer app (dashboard, orders, order detail, book, self-pin, billing, membership, referrals, account, onboarding, feedback)
- `app/admin/` — staff portal (orders kanban + capability-aware assignment, work queue, calendar, leads, clients, deliveries, quotes, invoices, payouts, promotions, catalog, geography, tailors, feedback, reports, users, audit)
- `app/data-model/` — shareable data dictionary; `/data-model/erd` is the visual ERD
- `lib/mock/` — all fixtures (seed.ts, catalog.ts, geography.ts, staff.ts, memberships.ts)
- `lib/types.ts` — TS types for all 40 schema tables
- `docs/` — the canonical spec (schema.sql = source of truth, billing model, auth brief, data dictionary, app UI specs, BUILD_BRIEF.md)

### Mock data covers every billing lifecycle state
- `ord_1` — booked order with scope **increase** (+$24 incremental charge)
- `ord_2` — clean self-pin awaiting pickup
- `ord_3` — delivered with scope **decrease** (refund)
- `ord_4` — quote **pending approval** ($150 initial → $215 quoted)

### Demo ZIPs (in service area)
Brooklyn `11231`, SF `94110`, Silver Lake `90026`. Out-of-area → waitlist: `90210`.
(Full list in `lib/mock/geography.ts`.) The ZIP-check OTP step accepts any 6 digits.

## What's NOT done: the backend
The full BE plan is ready — apply it next. Summary:
1. **Supabase project** — apply `docs/schema.sql` (convert to PG-native: enums,
   NUMERIC money, uuid PKs), `supabase gen types` → TS types.
2. **Auth** — phone + SMS-OTP (Supabase phone provider via Twilio). Signup:
   phone → OTP → service-area gate → create `leads` → create `clients`. Passkeys
   as upgrade. **MFA required for staff/admin** (enforce in admin middleware, aal2).
3. **RLS on every table** (default-deny). Helper fns `auth_client_id()` /
   `auth_staff_role()`. Client policies scope `auth.uid()` → `clients.auth_user_id`.
4. **API layer** — reads direct via Supabase client (RLS-scoped); all money/
   pricing/assignment mutations server-side (Next Route Handlers + Edge Functions).
   Replace `lib/mock/*` getters with Supabase queries (nested select for order
   detail: orders → garments → adjustments, invoices → line_items/payments/refunds).
5. **Stripe** — Payment Element for initial charge; webhooks
   (`payment_intent.succeeded` → write `payments`, fire `Order Paid`); Connect for
   tailor payouts.
6. **Edge Functions** — assign-tailor (capability + scoring), invoice-reconcile
   (order_revisions + settlement), payout-run, promo-eligibility, courier-sync,
   offline-conversion-upload.

Build order: Supabase+schema → auth (creates clients) → RLS → real queries replace
mocks → Route Handlers → Stripe intents → webhooks.

## Immediate next steps (pick up here)
1. **Deploy Vercel preview** off `main` so review = clicking a URL (build is green).
2. **Start the backend** at Milestone 1: Supabase project + schema + SMS-OTP auth + base RLS.

## Conventions (guardrails — see BUILD_BRIEF.md §"Non-negotiable")
- `docs/schema.sql` is the single source of truth; regenerate derived docs.
- Billing is cross-cutting: initial charge → flex up/down → `order_revisions`
  ledger → settle (charge/refund/credit). **Pay-first**: invoice covered before a
  garment routes to a tailor. Money is **server-authoritative**.
- SEO/structured-data only on marketing; app + admin are `noindex`, behind auth.
