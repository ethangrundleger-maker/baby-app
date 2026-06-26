# Re:Fit — Auth, Security & Page-Build Brief

## 1. The one rule for auth

**Do not build your own authentication.** Use a managed identity provider — it handles password hashing, breach detection, secure sessions, MFA, and email flows for you, audited by specialists.

**Recommended: Supabase Auth.** Lives in the same Postgres as the data, which unlocks **Row-Level Security (RLS)** — the strongest possible data-isolation guarantee.

**Best-possible posture:** for clients, **phone + SMS one-time-passcode (OTP)** is the **primary** sign-up and login method in V1 — phone is the identifier, the OTP both validates the lead and authenticates (no passwords). Offer **passkeys / WebAuthn** as an upgrade, email as optional. **Require MFA for all staff/admin**. SMS OTP is sent via the provider's phone-auth (Supabase Auth phone provider, backed by Twilio).

## 2. Tooling recommendation

| Path | Verdict |
|---|---|
| **Lovable + Supabase** (recommended now) | Fastest secure path. |
| **+ Claude Code repo for the data layer** | Keep `schema.sql`, migrations, validators, and complex logic (payouts, assignment scoring) in code. |
| Full **Claude Code / Codex** app | More control + scalability, more lift. Migrate later if Lovable's ceiling is hit. |

## 3. Account types & roles

Two kinds of login, both linked to the auth provider via `auth_user_id`:

- **Client accounts** → row in `clients`. Role: `client`.
- **Staff accounts** → row in `staff`, with `staff.role` ∈ {`pinner`, `tailor`, `driver`, `admin`}.

**Permission matrix (enforced server-side):**

| Capability | client | pinner | tailor | driver | admin |
|---|---|---|---|---|---|
| Own orders/measurements/invoices | ✓ (own only) | — | — | — | ✓ (all) |
| Appointments calendar / pin garments | — | ✓ | — | — | ✓ |
| See/work assigned garments | — | — | ✓ (assigned) | — | ✓ |
| Delivery legs | — | — | — | ✓ (assigned) | ✓ |
| Pricing, promos, catalog, hubs | — | — | — | — | ✓ |
| Payouts, refunds, reports | — | — | — | — | ✓ |
| Manage staff & roles | — | — | — | — | ✓ (super-admin) |

## 4. Security requirements

- **Managed auth** (Supabase/Clerk); credentials never in our tables.
- **MFA required for all staff/admin**; offered to clients. Prefer **passkeys/WebAuthn**.
- **Phone (SMS OTP) verification** required before first order.
- **Sessions:** provider-managed JWTs in `httpOnly`, `Secure`, `SameSite` cookies; short-lived access token + rotating refresh.
- **Row-Level Security (RLS) on every table** in Postgres: default-deny.
- **RBAC** checked on the server for every mutation.
- **PCI:** never store card numbers. Use **Stripe**.
- **Sensitive data** (`measurements`, `client_photos`): photos in a **private** storage bucket served via short-lived signed URLs.
- **Rate-limit & brute-force protect** auth endpoints.
- **Secrets** in env/secret manager.
- **Transport:** HTTPS + HSTS everywhere; CSP; locked-down CORS.
- **Audit:** log auth events + domain transitions (`status_events`).
- **Privacy:** GDPR/CCPA data export + delete.

## 5. Pages — Client app

| Route | Purpose | Key actions |
|---|---|---|
| `/login` `/logout` | Auth | Passkey/SMS-OTP/MFA challenge |
| `/onboarding` | Address, measurements, payment, membership | Create related records |
| `/` (dashboard) | Active orders + quick actions | Book / self-pin |
| `/book` | Pick a pinning slot; promo code | Reserve slot, create order, initial charge |
| `/self-pin` | Build a self-pin order | Create order/garments/adjustments |
| `/orders` | Order history | — |
| `/orders/:id` | Garments, adjustments, status timeline, delivery tracking, invoice | Approve/decline quote |
| `/measurements` | Body profile view, photo upload | — |
| `/addresses` | Address book | CRUD |
| `/billing` | Invoices, payments, receipts | Manage cards |
| `/membership` | Plan status | Upgrade/cancel |
| `/referrals` | Code, balance | Share |
| `/feedback/:ref` | Per-appointment + per-adjustment ratings | — |
| `/account` | Profile, MFA, notifications | — |

## 6. Pages — Admin / staff portal

| Route | Purpose |
|---|---|
| `/admin` | KPI dashboard |
| `/admin/leads` | Lead pipeline + service-area gate |
| `/admin/clients` | Client list/detail |
| `/admin/calendar` | Pinning calendar |
| `/admin/orders` | Garment board (kanban); capability-aware assignment |
| `/admin/work` | "My assigned garments" (tailor view) |
| `/admin/deliveries` | Logistics legs |
| `/admin/quotes` | Pricing & quote approvals |
| `/admin/invoices` | Invoices, payments, refunds |
| `/admin/payouts` | Tailor earnings + payout runs |
| `/admin/promotions` | Promo CRUD |
| `/admin/catalog` | Service catalog + per-hub pricing |
| `/admin/geography` | Hubs, areas, ZIPs |
| `/admin/tailors` | Capabilities, efficiency, utilization |
| `/admin/feedback` | Reviews; pinner/tailor performance |
| `/admin/reports` | Dashboards |
| `/admin/users` | Staff accounts & roles |
| `/admin/audit` | Audit log |

## 7. Build order

1. Supabase project; import `schema.sql`; enable RLS + base policies.
2. Auth (signup w/ service-area gate, login, MFA, verification, account).
3. Client core: onboarding → dashboard → book/self-pin → order detail → billing.
4. Admin core: dashboard → orders board + tailor assignment → quotes/invoices → payouts.
5. Promotions, catalog, geography, reports, audit.
6. Edge Functions (assignment scoring, payout runs).
