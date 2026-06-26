# Re:Fit — Billing & Order-Mutation Model (canonical)

**The order total is not fixed at creation.** A customer pays an initial charge, then
the order flexes up or down as the real scope is known, and the difference is settled.
This document is the single source of truth for that logic; every other system
(schema, events, attribution, UI) reflects it.

---

## 1. Two online paths — both create a paying online customer (the V1 ad conversion)

- **Self-purchase (self-pin):** customer builds the order online and pays online. The **initial charge = the built order total** (`orders.estimated_total`).
- **Booking an appointment:** customer books online and pays an **initial charge** up front (a deposit / initial estimate). Real scope is set at the pinning visit.

## 2. Orders flex up or down

- **More than expected** — came with 5 garments, has 6; or adds services → order **increases** → **incremental charge**.
- **Less than expected** — expected 3, only 2 → order **decreases** → **refund or account credit**.
- Other reasons: a service is swapped, a rework, or a correction.

The **current/final total always lives on the invoice** (derived from `adjustments` → `invoice_line_items`). `orders.estimated_total` only records what the initial charge was based on.

## 3. How a change is recorded and settled

Every change writes an **`order_revisions`** row (self-checking: `delta = new_total − previous_total`):

| Field | Meaning |
|---|---|
| `reason` | initial / items_added / items_removed / service_changed / rework / correction |
| `previous_total` → `new_total` | the order total before/after |
| `delta` | signed change |
| `settlement` | how the delta was handled: **charge** / **refund** / **credit** / none |

Settlement rules:
- **delta > 0** → capture an **incremental** `payment` (`charge_type = 'incremental'`).
- **delta < 0** → issue a **refund** (`refunds.reason = 'scope_decrease'`) **or** an account **credit** (`credits.type = 'refund_credit'`).
- **balance settle-up** at the end → `payment.charge_type = 'balance'`.

The invoice reconciliation invariant holds at every step (`total = subtotal − discount − credit + tax`).

## 4. Lifecycle (the canonical sequence)

```
create order ──▶ INITIAL CHARGE (estimated_total)         payment.charge_type='initial'  → conversion fires
       │
       ├─ scope ↑  ──▶ order_revisions(+delta, charge)     payment.charge_type='incremental' → value update
       ├─ scope ↓  ──▶ order_revisions(−delta, refund|credit) refund(scope_decrease) | credit → value update
       │
       └─▶ RECONCILED (final_total)                        balance settled; order closed for billing
```

## 5. Marketing / attribution implication

- **V1 conversion = the initial online paid order** (`Order Paid`), with `Sign Up Completed` as the upper-funnel signal.
- Because the value changes after the click-time conversion, **send the conversion at initial charge, then send a value adjustment** on every `Order Adjusted`. Optimize toward **final** order value.

## 6. Where this shows up

- **Schema** (`schema.sql`): `orders.estimated_total`, `payments.charge_type`, `refunds.reason='scope_decrease'`, the `order_revisions` ledger.
- **Events** (`refit_tracking_plan.*`): `Order Paid` = initial conversion; `Order Adjusted`, `Order Charged`, `Order Reconciled`.
- **Customer UI**: self-pin shows initial charge; booking shows initial charge/deposit; order detail shows a revisions timeline + balance due/refunded; billing shows incremental charges + refunds.
- **Admin UI**: pinner/ops can add/remove items → a revision with auto-settlement; invoices handle incremental charge + refund-on-decrease.
- **Reporting:** revenue uses **final** order value; track initial-vs-final variance and refund-on-decrease rate.

## 7. Future principles

- **Checkout as simple as Shopify.** Express wallets (Apple Pay / Google Pay / Stripe Link), one-tap saved methods, minimal typed fields, accelerated single-screen checkout.
- **SMS-first identity.** Lead validation and signup are phone + SMS OTP. A verified phone doubles as a top-tier ad-match key.
