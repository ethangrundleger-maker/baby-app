# Re:Fit — Data Dictionary

Every table in the database, grouped by area, with what it does and its columns. Generated directly from `schema.sql` (the single source of truth), so it always matches the live design.

**How to read a table below:** each row is one column. *Notes* flags the primary key, foreign keys ("→ other_table" means "points to that table"), the allowed values for status-like fields, and whether a value is required or unique. Types are SQLite-portable (`TEXT`, `REAL`, `INTEGER`); in Postgres these become native text, numeric/money, and integer/enum types.

**The spine, in one line:** a **client** places an **order**, which contains **garments**, each of which gets one or more **adjustments** (the actual work). An adjustment is the hinge of the whole model — it drives both the **invoice** (what the customer pays) and the **tailor earning** (what the tailor is paid).

> The full table-by-table reference is also rendered as a styleable page at `/data-model` in the running app, and the canonical SQL is at `docs/schema.sql`.

## 1. Geography & coverage

*Where Re:Fit operates, narrowing from a market down to a single ZIP code.*

### `operating_hubs`
A local operating market (e.g. a metro area). It owns its staff, its pricing, and the areas it serves.

### `service_areas`
A named coverage zone inside a hub. It groups ZIP codes together for assignment and reporting.

### `service_area_zips`
Maps one ZIP code to exactly one service area (and therefore one hub).

## 2. Customers

### `leads`
A prospect captured before they become a customer — their phone (validated by SMS), ZIP, and first-touch marketing details.

### `clients`
A customer account. Links to the login provider and back to the originating lead.

### `addresses`
A client's service and pickup addresses. One can be marked as their preferred address.

### `measurements`
A reusable body-measurement profile for a client, kept so repeat orders don't need re-measuring.

### `client_photos`
Reference photos a client uploads. The images live in secure storage; this table only holds the references.

## 3. Staff & capabilities

### `staff`
Everyone who works the operation — pinners, tailors, drivers, and admins.

### `tailor_services`
Which services each tailor can perform. The system uses it to make sure work is only assigned to a tailor who can do it.

## 4. Services & pricing

### `service_catalog`
The master menu of services (alterations and repairs).

### `hub_service_prices`
Per-market overrides of the catalog — a service can cost (and pay) differently in different hubs.

## 5. Scheduling

### `availability_slots`
Bookable time slots on a staff member's calendar.

### `appointments`
A scheduled pinning visit. One appointment can hold several orders at once (a solo visit or a group "pinning party").

## 6. Orders & the work

### `orders`
The central thing a customer transacts.

### `garments`
A single clothing item inside an order. Each garment is routed to a tailor.

### `pinning_measurements`
The markup captured on a specific garment.

### `adjustments`
**The most important line item.** One piece of work on one garment. Feeds both the customer's invoice and the tailor's earning.

## 7. Logistics

### `deliveries`
A single leg of movement for garments — pickup, to a tailor, between tailors, or return.

## 8. Billing & money

### `invoices`
The bill for an order. Always reconciles (subtotal − discount − credit + tax = total).

### `invoice_line_items`
The itemized breakdown of an invoice.

### `payments`
Money captured against an invoice — initial, incremental, or balance.

### `refunds`
Money returned to the customer — including scope-decrease refunds.

### `order_revisions`
The dated audit trail of every up/down change to an order after the initial charge. Self-checking; the math always ties out.

### `credits`
The account-credit ledger — referral rewards, refunds-as-credit, goodwill.

### `payment_methods`
A customer's saved payment methods. Only secure tokens stored.

## 9. Paying the tailors

### `tailor_earnings`
What a tailor earns for each adjustment, linked to the matching invoice line so true profit per job is visible.

### `payouts`
A batched payment to a tailor covering a period.

## 10. Memberships

### `membership_plans`
The subscription plans on offer.

### `customer_memberships`
A specific customer's subscription to a plan.

## 11. Promotions & referrals

### `promotions`
Discounts in the style of Shopify.

### `promotion_items`
Which catalog items a promotion applies to.

### `promotion_email_locks`
Restricts a promotion to specific customers.

### `promo_redemptions`
A usage log — one row each time a promotion is applied.

### `referrals`
Connects a referring customer to the customer they referred.

## 12. Quality & feedback

### `reworks`
A redo when something isn't right. Tailor-fault rework claws back that tailor's earning.

### `feedback`
A rating that attaches to either an appointment (rates the pinner) or an adjustment (rates the tailor).

### `feedback_tags`
The set of tappable feedback tags, grouped by sentiment.

### `feedback_tag_selections`
Records which tags a particular piece of feedback selected.

## 13. System

### `status_events`
General-purpose history log: status changes on any kind of record.

---

*40 tables. Regenerate with `python3 gen_data_dictionary.py` after any schema change. Full column-level reference: open `/data-model` in the app.*
