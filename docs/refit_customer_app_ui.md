# Re:Fit — Customer App: UI & Requirements

The authenticated client app (`app.tryrefit.com`). Not a crawl target → `noindex`,
optimize for speed + interactivity, WCAG 2.2 AA. Each page: **Goal · Sections/UI · Actions · Data · States.**

**App shell:** top bar (logo → dashboard, notifications, account menu), left/bottom nav (Home, Orders, Book, Billing, Account), responsive (mobile-first), toast system, global loading + error boundaries. All data access scoped by RLS to the signed-in client.

## 1. Onboarding wizard `/onboarding`
- **Goal:** collect what's needed to transact, with everything skippable.
- **UI:** stepper — (1) address, (2) measurements + photo upload (optional), (3) payment method (Stripe), (4) membership offer.
- **Actions:** create `addresses`, `measurements`, `client_photos`, `payment_methods`, optional `customer_memberships`.

## 2. Dashboard `/`
- Active-order cards + status, two primary CTAs (Book pinning / Start self-pin), credit balance + referral nudge, recent activity.
- **Data:** `orders`, `garments`, `credits`.

## 3. Book pinning `/book`
- Step flow — choose date → slots → confirm service address → promo code → review & **pay initial charge**.
- **Actions:** reserve `availability_slots`, create `appointments` + `orders` (status scheduled, set `estimated_total`); collect `payments.charge_type='initial'`.

## 4. Self-pin order builder `/self-pin`
- Multi-step — add garments, pick services per garment, describe/measure the adjustment, promo code, review, pay.
- **Actions:** create `orders` (self_pin, awaiting_pickup), `garments`, `adjustments`, `pinning_measurements`; price via catalog/hub; invoice + collect `payments.charge_type='initial'`.

## 5. Orders list `/orders`
- List/cards with status filter (active/completed/cancelled), search; row → detail.

## 6. Order detail `/orders/:id`
- Header (status, **initial vs current total**, balance due or refunded), garment list each with adjustments, **status timeline** (from `status_events`), **order revisions timeline** (from `order_revisions`), **delivery tracking**, invoice summary + receipt link, feedback prompt when delivered.

## 7. Quote review / approve `/orders/:id/approve`
- Itemized adjustments + prices, total, Approve / Decline, decline reason.
- On approve → charge (pay-first) then routing; on decline → return unaltered + refund/credit.

## 8. Measurements `/measurements`
- Measurement values, photo uploader. `build_type` hidden (internal).

## 9. Addresses `/addresses`
- Address cards, add/edit, set preferred, access notes.

## 10. Billing `/billing`
- Invoice list (status, total, date) → invoice/receipt detail. Shows initial + incremental charges and any scope-decrease refund/credit; download PDF.

## 11. Payment methods `/billing/cards`
- Saved cards (brand/last4/default), add (Stripe), remove, set default.

## 12. Membership `/membership`
- Current plan + benefits, renewal date, upgrade/downgrade, cancel.

## 13. Referrals & credits `/referrals`
- Personal referral code + share, how-it-works, credit balance + ledger.

## 14. Feedback `/feedback/:ref`
- Two prompts — appointment (rates pinner) and per-adjustment product (rates tailor). Star rating → tap-to-select tags; optional comment.

## 15. Account & security `/account`
- Tabs — Profile, Security (phone / SMS OTP primary, MFA, passkeys, sessions), Notifications, Privacy (export/delete).

---

*Shared components:* status chip, timeline, order/garment card, adjustment line, price-summary, slot picker, address form, Stripe card element, star+tag rating, uploader, empty-state, confirm modal.
