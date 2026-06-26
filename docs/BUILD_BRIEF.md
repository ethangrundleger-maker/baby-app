# Re:Fit — Build Brief

> Orientation for the coding agent. Read this first, then the spec files it points to.
> Rename to `CLAUDE.md` at the repo root so it loads automatically as project context.

## What we're building

Re:Fit is a concierge **mobile tailoring marketplace** — the tailor comes to the
customer. Two entry paths: (1) **book a pinning visit** (a stylist marks up garments
at the customer's home), or (2) **self-pin** (customer marks up their own, courier
picks up). A vetted network of tailors does the work; a logistics layer moves
garments; billing spans one-off orders and memberships. There are **three surfaces**:
a public **marketing** site, a customer **app**, and a staff **admin** portal.

## The specs (read in this order)

| File | What it defines | Authority |
|---|---|---|
| `schema.sql` | The full PostgreSQL-portable database (40 tables, constraints, triggers) | **SOURCE OF TRUTH** |
| `refit_data_dictionary.md` | Plain-English reference for every table/column | generated from schema |
| `refit_erd.mermaid` | Visual entity-relationship map | generated from schema |
| `refit_data_model.md` | Narrative data-model spec + the source-of-truth workflow | canonical |
| `refit_billing_model.md` | Initial-charge → flex up/down → reconcile logic | **canonical (cross-cutting)** |
| `refit_auth_and_pages_brief.md` | Auth/security model (SMS-first), RLS/RBAC, role matrix | canonical |
| `refit_architecture_seo.md` | Architecture/stack decision + SEO/AISEO standards | canonical |
| `refit_sitemap.md` / `.mermaid` | Every page across all three surfaces | canonical |
| `refit_marketing_pages_ui.md` | Per-page UI/requirements — marketing | per-page spec |
| `refit_customer_app_ui.md` | Per-page UI/requirements — customer app | per-page spec |
| `refit_admin_app_ui.md` | Per-page UI/requirements — admin portal | per-page spec |
| `refit_marketing_schema.md` | schema.org JSON-LD per marketing page | per-page spec |
| `refit_signup_flow.mermaid` | Phone + SMS-OTP signup flow | flow |
| `refit_tracking_plan.md` / `.json` | Analytics event taxonomy + machine contract | **event contract** |
| `refit_marketing_attribution.md` + `refit_attribution_flow.mermaid` | Paid channels + server-side attribution spine | canonical |
| Generators | `gen_erd.py`, `gen_data_dictionary.py` | regenerate derived docs |
| Validators | `validate_schema.py`, `refit_regression_test.py`, `validate_events.py` | **CI gates** |

## Architecture & stack (decided)

- **Monorepo:** Turborepo + pnpm. Apps: `apps/marketing` (tryrefit.com, **SSG/ISR**, the SEO surface), `apps/app` (app.tryrefit.com, customer, behind auth), `apps/admin` (admin.tryrefit.com, staff + MFA). Shared packages: `ui` (design system), `db` (schema + generated TS types + validators), `config`.
- **Framework:** Next.js (App Router) on **Vercel**.
- **Backend:** **Supabase** — Postgres (apply `schema.sql`), Auth, **RLS on every table**, Storage (private buckets for photos), Edge Functions for heavy logic.
- **Payments:** **Stripe** (Payment Element + wallets; Connect for tailor payouts). Tokens only — never store card data.
- **Auth:** **phone + SMS OTP primary** (Supabase Auth phone provider via Twilio), passkeys as upgrade, email optional. MFA required for all staff/admin.
- **Analytics:** first-party event spine → server-side fan-out to Meta/Google/TikTok CAPIs + warehouse (see attribution spec). Recommended CDP: RudderStack → BigQuery; PostHog for product analytics.

## Non-negotiable conventions (the guardrails)

1. **`schema.sql` is the single source of truth.** Never hand-edit `refit_erd.mermaid` or `refit_data_dictionary.md` — regenerate them. Generate TS types from the DB.
2. **The three validators must stay green in CI** as the merge gate: `validate_schema.py` (25 checks), `refit_regression_test.py` (27 invariants), `validate_events.py` (event contract).
3. **`refit_tracking_plan.json` is the event contract.** Generate a **typed analytics client** from it so a developer cannot fire an unknown event or omit a required property. No raw PII in events — hash phone/email (`phone_sha256`).
4. **Billing model is cross-cutting** (`refit_billing_model.md`): orders take an **initial charge**, then flex up/down with each change written to the dated, self-checking **`order_revisions`** ledger and settled as charge/refund/credit. **`Order Paid` = the V1 ad conversion** (initial charge); **`Order Adjusted` sends a conversion value update**. **Pay-first**: the invoice must be covered before a garment routes to a tailor.
5. **Money is server-authoritative.** Pricing, totals, discounts, and settlements are computed server-side; never trust client amounts.
6. **SEO/AISEO applies to the marketing surface only.** The app and admin are `noindex`, behind auth — performance + accessibility only.
7. **Security:** RLS scopes every row to the right user/role/hub; staff need MFA; admin on its own subdomain.

## Build order (milestones)

- **Phase 0 — Foundation.** Scaffold the monorepo + three Next apps; create the Supabase project; apply `schema.sql`; generate TS types; wire CI to run the generators (and fail if output drifts) + the three validators.
- **Phase 1 — Platform.** `packages/ui` design system; **SMS-OTP auth**; **RLS policies** for every table + the role matrix from the auth brief.
- **Phase 2 — Marketing site.** Build to `refit_marketing_pages_ui.md` + `refit_marketing_schema.md`: SSG/ISR, the JSON-LD graph, the area-checker → SMS-validated lead, Lighthouse 95+.
- **Phase 3 — Customer app.** Build to `refit_customer_app_ui.md`: onboarding, self-pin builder, booking, order detail (with the `order_revisions` timeline + balance/refund states), billing, membership, referrals, feedback. Implement the billing model end to end.
- **Phase 4 — Admin portal.** Build to `refit_admin_app_ui.md`: capability-aware orders/assignment board, scheduling, invoices/payouts, promotions, geography, feedback, reports.
- **Phase 5 — Growth stack.** Event spine + typed client from the tracking plan; server-side CAPIs + offline conversion upload; warehouse + BI per the attribution spec.

## Logic that belongs in Edge Functions (not the UI)

Tailor-assignment ranking (utilization/location/efficiency), payout-run generation,
promotion eligibility/stacking resolution, courier status sync, invoice
reconciliation, and the offline conversion uploads to the ad platforms.

## Open decisions — get a human call before coding these

- **Rework / margin accounting:** how tailor-fault clawbacks hit P&L.
- **Referral qualification:** credit on referred signup vs. first paid order.
- **Assignment weighting:** default utilization 50 / location 30 / efficiency 20 — confirm.
- **`hub_id` denormalization** onto orders/invoices for faster reporting (query-layer finding).
- **Scope-decrease default:** refund to original method vs. account credit.
- **Optional email capture** for receipts/recovery despite SMS-first.

## Definition of done (per feature)

Builds and type-checks; matches its page spec; all three validators green; analytics
events fire per the tracking plan (asserted by tests); RLS enforced; for marketing,
the SEO/structured-data checklist passes; for app/admin, WCAG AA + performance.
