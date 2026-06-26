// The Re:Fit data dictionary, as structured data for rendering.
// Hand-authored to match docs/schema.sql exactly.

export interface Column {
  name: string;
  type: "TEXT" | "INTEGER" | "REAL";
  fk?: string; // target table
  required?: boolean;
  unique?: boolean;
  pk?: boolean;
  enums?: string[];
}

export interface TableDef {
  name: string;
  blurb: string;
  columns: Column[];
}

export interface Section {
  number: number;
  heading: string;
  description: string;
  tables: TableDef[];
}

const id = (): Column => ({ name: "id", type: "TEXT", pk: true });

export const SPINE =
  "A client places an order, which contains garments, each of which gets one or more adjustments. An adjustment is the hinge of the model — it drives both the invoice (what the customer pays) and the tailor earning (what the tailor is paid).";

export const SECTIONS: Section[] = [
  {
    number: 1,
    heading: "Geography & coverage",
    description: "Where Re:Fit operates — from a market down to a single ZIP.",
    tables: [
      {
        name: "operating_hubs",
        blurb: "A local operating market (e.g. a metro area). Owns its staff, pricing, and the areas it serves.",
        columns: [
          id(),
          { name: "name", type: "TEXT", required: true },
          { name: "address", type: "TEXT" },
          { name: "has_workspace", type: "INTEGER", required: true },
          { name: "active", type: "INTEGER", required: true },
        ],
      },
      {
        name: "service_areas",
        blurb: "A named coverage zone inside a hub — groups ZIPs for assignment and reporting.",
        columns: [
          id(),
          { name: "hub_id", type: "TEXT", fk: "operating_hubs", required: true },
          { name: "name", type: "TEXT", required: true },
        ],
      },
      {
        name: "service_area_zips",
        blurb: "Maps one ZIP to exactly one service area. The lookup behind \"do we serve your address?\"",
        columns: [
          id(),
          { name: "service_area_id", type: "TEXT", fk: "service_areas", required: true },
          { name: "zip", type: "TEXT", required: true, unique: true },
        ],
      },
    ],
  },
  {
    number: 2,
    heading: "Customers",
    description: "From first interest to full account.",
    tables: [
      {
        name: "leads",
        blurb: "A prospect captured before they're a customer — SMS-validated phone, ZIP, first-touch marketing.",
        columns: [
          id(),
          { name: "phone", type: "TEXT", required: true },
          { name: "phone_verified_at", type: "TEXT" },
          { name: "email", type: "TEXT" },
          { name: "zip", type: "TEXT" },
          { name: "source", type: "TEXT" },
          { name: "utm_source", type: "TEXT" },
          { name: "utm_medium", type: "TEXT" },
          { name: "utm_campaign", type: "TEXT" },
          { name: "gclid", type: "TEXT" },
          { name: "fbclid", type: "TEXT" },
          { name: "ttclid", type: "TEXT" },
          { name: "landing_page", type: "TEXT" },
          { name: "first_touch_at", type: "TEXT" },
          { name: "status", type: "TEXT", required: true, enums: ["new", "waitlisted", "contacted", "converted", "lost"] },
          { name: "converted_client_id", type: "TEXT" },
        ],
      },
      {
        name: "clients",
        blurb: "A customer account. Links to the login provider and back to the originating lead.",
        columns: [
          id(),
          { name: "auth_user_id", type: "TEXT", unique: true },
          { name: "lead_id", type: "TEXT", fk: "leads" },
          { name: "name", type: "TEXT", required: true },
          { name: "phone", type: "TEXT" },
          { name: "email", type: "TEXT" },
          { name: "gender", type: "TEXT", enums: ["female", "male", "non_binary", "self_described", "undisclosed"] },
          { name: "referral_code", type: "TEXT", unique: true },
          { name: "signup_channel", type: "TEXT" },
        ],
      },
      {
        name: "addresses",
        blurb: "A client's service and pickup addresses. One can be marked preferred.",
        columns: [
          id(),
          { name: "client_id", type: "TEXT", fk: "clients", required: true },
          { name: "label", type: "TEXT" },
          { name: "is_preferred", type: "INTEGER", required: true },
          { name: "line1", type: "TEXT" },
          { name: "city", type: "TEXT" },
          { name: "zip", type: "TEXT" },
          { name: "access_notes", type: "TEXT" },
        ],
      },
      {
        name: "measurements",
        blurb: "Reusable body-measurement profile — kept so repeat orders skip re-measuring.",
        columns: [
          id(),
          { name: "client_id", type: "TEXT", fk: "clients", required: true },
          { name: "measured_by", type: "TEXT", fk: "staff" },
          { name: "measured_at", type: "TEXT" },
          { name: "source", type: "TEXT", enums: ["self", "staff"] },
          { name: "build_type", type: "TEXT" },
          { name: "values_json", type: "TEXT" },
        ],
      },
      {
        name: "client_photos",
        blurb: "Reference photos a client uploads. Images live in secure storage; this table holds the refs.",
        columns: [
          id(),
          { name: "client_id", type: "TEXT", fk: "clients", required: true },
          { name: "url", type: "TEXT", required: true },
          { name: "kind", type: "TEXT" },
        ],
      },
    ],
  },
  {
    number: 3,
    heading: "Staff & capabilities",
    description: "Everyone who does the work, and what each tailor is allowed to do.",
    tables: [
      {
        name: "staff",
        blurb: "Pinners, tailors, drivers, admins — with role, hub, efficiency, payout cadence.",
        columns: [
          id(),
          { name: "auth_user_id", type: "TEXT", unique: true },
          { name: "hub_id", type: "TEXT", fk: "operating_hubs" },
          { name: "name", type: "TEXT", required: true },
          { name: "role", type: "TEXT", required: true, enums: ["pinner", "tailor", "driver", "admin"] },
          { name: "is_contractor", type: "INTEGER", required: true },
          { name: "efficiency_rating", type: "REAL", required: true },
          { name: "payout_cadence", type: "TEXT", enums: ["immediate", "weekly", "biweekly"] },
        ],
      },
      {
        name: "tailor_services",
        blurb: "The capability list — which services each tailor can perform. Enforces capability-aware assignment.",
        columns: [
          id(),
          { name: "tailor_id", type: "TEXT", fk: "staff", required: true },
          { name: "service_id", type: "TEXT", fk: "service_catalog", required: true },
          { name: "can_perform", type: "INTEGER", required: true },
          { name: "rate", type: "REAL" },
        ],
      },
    ],
  },
  {
    number: 4,
    heading: "Services & pricing",
    description: "The menu of work offered and how it is priced per market.",
    tables: [
      {
        name: "service_catalog",
        blurb: "Master menu of services (alterations + repairs) with default price, payout rate, time estimate.",
        columns: [
          id(),
          { name: "name", type: "TEXT", required: true },
          { name: "category", type: "TEXT", required: true, enums: ["alteration", "repair"] },
          { name: "default_price", type: "REAL", required: true },
          { name: "payout_rate", type: "REAL", required: true },
          { name: "standard_minutes", type: "INTEGER" },
          { name: "active", type: "INTEGER", required: true },
        ],
      },
      {
        name: "hub_service_prices",
        blurb: "Per-market overrides — a service can cost (and pay) differently in different hubs.",
        columns: [
          id(),
          { name: "hub_id", type: "TEXT", fk: "operating_hubs", required: true },
          { name: "service_id", type: "TEXT", fk: "service_catalog", required: true },
          { name: "price", type: "REAL", required: true },
          { name: "payout_rate", type: "REAL", required: true },
        ],
      },
    ],
  },
  {
    number: 5,
    heading: "Scheduling",
    description: "Booking a pinning visit into a staff member's calendar.",
    tables: [
      {
        name: "availability_slots",
        blurb: "Bookable slots on a staff calendar — also blocks for travel and breaks.",
        columns: [
          id(),
          { name: "staff_id", type: "TEXT", fk: "staff", required: true },
          { name: "starts_at", type: "TEXT", required: true },
          { name: "ends_at", type: "TEXT", required: true },
          { name: "block_type", type: "TEXT", required: true, enums: ["available", "break", "travel", "blocked", "booked"] },
        ],
      },
      {
        name: "appointments",
        blurb: "A scheduled pinning visit. One appointment can hold several orders (a solo visit or a party).",
        columns: [
          id(),
          { name: "type", type: "TEXT", required: true, enums: ["solo", "party"] },
          { name: "host_client_id", type: "TEXT", fk: "clients" },
          { name: "slot_id", type: "TEXT", fk: "availability_slots", unique: true },
          { name: "pinner_id", type: "TEXT", fk: "staff" },
          { name: "address_id", type: "TEXT", fk: "addresses" },
          { name: "scheduled_at", type: "TEXT" },
          { name: "duration_minutes", type: "INTEGER" },
          { name: "travel_buffer_minutes", type: "INTEGER" },
          { name: "entered_code", type: "TEXT" },
          { name: "status", type: "TEXT", required: true, enums: ["requested", "scheduled", "confirmed", "en_route", "in_progress", "completed", "no_show", "canceled", "rescheduled"] },
        ],
      },
    ],
  },
  {
    number: 6,
    heading: "Orders & the work",
    description: "The heart of the system: an order, its garments, and the individual pieces of work.",
    tables: [
      {
        name: "orders",
        blurb: "The central thing a customer transacts. Records the initial-charge estimate; live total lives on the invoice.",
        columns: [
          id(),
          { name: "client_id", type: "TEXT", fk: "clients", required: true },
          { name: "appointment_id", type: "TEXT", fk: "appointments" },
          { name: "type", type: "TEXT", required: true, enums: ["self_pin", "appointment"] },
          { name: "estimated_total", type: "REAL" },
          { name: "status", type: "TEXT", required: true, enums: ["awaiting_pickup", "scheduled", "in_progress", "ready_for_return", "delivered", "cancelled"] },
          { name: "quote_status", type: "TEXT", enums: ["estimated", "quoted", "pending_approval", "approved", "declined", "revised"] },
          { name: "approval_required", type: "INTEGER" },
          { name: "pickup_address_id", type: "TEXT", fk: "addresses" },
          { name: "return_address_id", type: "TEXT", fk: "addresses" },
          { name: "applied_membership_id", type: "TEXT", fk: "customer_memberships" },
        ],
      },
      {
        name: "garments",
        blurb: "A single clothing item inside an order. Routed to a tailor; has its own progress status.",
        columns: [
          id(),
          { name: "order_id", type: "TEXT", fk: "orders", required: true },
          { name: "tailor_id", type: "TEXT", fk: "staff" },
          { name: "type", type: "TEXT" },
          { name: "description", type: "TEXT" },
          { name: "status", type: "TEXT", required: true, enums: ["pinned", "in_transit_to_tailor", "in_alteration", "completed", "in_transit_to_customer", "delivered", "declined_by_tailor", "reassigning", "returned_unaltered", "on_hold", "cancelled"] },
          { name: "estimated_minutes", type: "INTEGER" },
        ],
      },
      {
        name: "pinning_measurements",
        blurb: "Markup captured on a specific garment — how that exact item should be altered.",
        columns: [
          id(),
          { name: "garment_id", type: "TEXT", fk: "garments", required: true },
          { name: "pinned_by", type: "TEXT", fk: "staff" },
          { name: "location", type: "TEXT" },
          { name: "adjustment", type: "TEXT" },
          { name: "unit", type: "TEXT" },
          { name: "notes", type: "TEXT" },
        ],
      },
      {
        name: "adjustments",
        blurb: "The most important line item — one piece of work on one garment. Feeds both invoice AND tailor earning.",
        columns: [
          id(),
          { name: "garment_id", type: "TEXT", fk: "garments", required: true },
          { name: "service_id", type: "TEXT", fk: "service_catalog", required: true },
          { name: "pinning_measurement_id", type: "TEXT", fk: "pinning_measurements" },
          { name: "priced_by", type: "TEXT", fk: "staff" },
          { name: "qty", type: "INTEGER", required: true },
          { name: "unit_price", type: "REAL", required: true },
          { name: "amount", type: "REAL", required: true },
          { name: "payout_amount", type: "REAL", required: true },
          { name: "standard_minutes", type: "INTEGER" },
          { name: "estimated_minutes", type: "INTEGER" },
          { name: "actual_minutes", type: "INTEGER" },
          { name: "status", type: "TEXT", required: true, enums: ["proposed", "approved", "declined", "in_progress", "completed", "reworked", "returned_unaltered"] },
          { name: "rework_of_adjustment_id", type: "TEXT", fk: "adjustments" },
          { name: "fault", type: "TEXT", enums: ["tailor", "customer", "refit"] },
        ],
      },
    ],
  },
  {
    number: 7,
    heading: "Logistics",
    description: "Moving garments between the customer, tailors, and back.",
    tables: [
      {
        name: "deliveries",
        blurb: "A single leg of movement for garments — pickup, to a tailor, between tailors, or return.",
        columns: [
          id(),
          { name: "order_id", type: "TEXT", fk: "orders", required: true },
          { name: "leg_type", type: "TEXT", required: true, enums: ["pickup", "to_tailor", "between", "return"] },
          { name: "method", type: "TEXT", enums: ["third_party_courier", "in_house_driver", "customer_dropoff", "customer_pickup"] },
          { name: "provider", type: "TEXT" },
          { name: "external_ref", type: "TEXT" },
          { name: "driver", type: "TEXT" },
          { name: "status", type: "TEXT" },
        ],
      },
    ],
  },
  {
    number: 8,
    heading: "Billing & money",
    description: "Charging the customer, and keeping the total correct as the order flexes.",
    tables: [
      {
        name: "invoices",
        blurb: "The bill for an order. Always reconciles (subtotal − discount − credit + tax = total).",
        columns: [
          id(),
          { name: "client_id", type: "TEXT", fk: "clients", required: true },
          { name: "order_id", type: "TEXT", fk: "orders" },
          { name: "status", type: "TEXT", required: true, enums: ["draft", "open", "partial", "paid", "overdue", "void"] },
          { name: "subtotal", type: "REAL", required: true },
          { name: "discount_total", type: "REAL", required: true },
          { name: "credit_applied", type: "REAL", required: true },
          { name: "tax", type: "REAL", required: true },
          { name: "total", type: "REAL", required: true },
          { name: "issued_at", type: "TEXT" },
        ],
      },
      {
        name: "invoice_line_items",
        blurb: "Itemized invoice breakdown; each line points to whatever it's billing for.",
        columns: [
          id(),
          { name: "invoice_id", type: "TEXT", fk: "invoices", required: true },
          { name: "item_type", type: "TEXT", required: true, enums: ["adjustment", "membership_fee", "membership_discount", "promo_discount", "volume_discount", "fee", "credit"] },
          { name: "reference_id", type: "TEXT" },
          { name: "description", type: "TEXT" },
          { name: "amount", type: "REAL", required: true },
        ],
      },
      {
        name: "payments",
        blurb: "Money captured against an invoice. Tag: initial, incremental, or balance.",
        columns: [
          id(),
          { name: "invoice_id", type: "TEXT", fk: "invoices", required: true },
          { name: "payment_method_id", type: "TEXT", fk: "payment_methods" },
          { name: "collected_by_type", type: "TEXT", required: true, enums: ["pinner", "customer", "system"] },
          { name: "collected_by_staff_id", type: "TEXT", fk: "staff" },
          { name: "charge_type", type: "TEXT", enums: ["initial", "incremental", "balance"] },
          { name: "amount", type: "REAL", required: true },
          { name: "method", type: "TEXT" },
          { name: "status", type: "TEXT", required: true, enums: ["pending", "paid", "failed", "refunded"] },
          { name: "paid_at", type: "TEXT" },
        ],
      },
      {
        name: "refunds",
        blurb: "Money returned — including scope decreases. Every refund is dated.",
        columns: [
          id(),
          { name: "invoice_id", type: "TEXT", fk: "invoices", required: true },
          { name: "payment_id", type: "TEXT", fk: "payments" },
          { name: "amount", type: "REAL", required: true },
          { name: "reason", type: "TEXT", enums: ["declined_work", "rework", "cancellation", "goodwill", "scope_decrease"] },
          { name: "status", type: "TEXT" },
          { name: "created_at", type: "TEXT", required: true },
        ],
      },
      {
        name: "order_revisions",
        blurb: "Dated audit trail of every up/down change. Self-checking: delta = new − previous. Always ties out.",
        columns: [
          id(),
          { name: "order_id", type: "TEXT", fk: "orders", required: true },
          { name: "revision_number", type: "INTEGER", required: true },
          { name: "reason", type: "TEXT", required: true, enums: ["initial", "items_added", "items_removed", "service_changed", "rework", "correction"] },
          { name: "previous_total", type: "REAL", required: true },
          { name: "new_total", type: "REAL", required: true },
          { name: "delta", type: "REAL", required: true },
          { name: "settlement", type: "TEXT", enums: ["charge", "refund", "credit", "none"] },
          { name: "created_by_staff_id", type: "TEXT", fk: "staff" },
          { name: "created_at", type: "TEXT", required: true },
        ],
      },
      {
        name: "credits",
        blurb: "Account-credit ledger — referral rewards, refund-as-credit, goodwill. Balance = SUM(amount).",
        columns: [
          id(),
          { name: "client_id", type: "TEXT", fk: "clients", required: true },
          { name: "amount", type: "REAL", required: true },
          { name: "type", type: "TEXT", required: true, enums: ["refund_credit", "referral_credit", "goodwill", "redemption"] },
          { name: "reference_id", type: "TEXT" },
          { name: "created_at", type: "TEXT", required: true },
        ],
      },
      {
        name: "payment_methods",
        blurb: "Saved cards — only secure tokens stored. Never card numbers.",
        columns: [
          id(),
          { name: "client_id", type: "TEXT", fk: "clients", required: true },
          { name: "processor_token", type: "TEXT" },
          { name: "brand", type: "TEXT" },
          { name: "last4", type: "TEXT" },
          { name: "is_default", type: "INTEGER", required: true },
        ],
      },
    ],
  },
  {
    number: 9,
    heading: "Paying the tailors",
    description: "What each tailor earns and the batched payouts.",
    tables: [
      {
        name: "tailor_earnings",
        blurb: "What a tailor earns per adjustment, linked to the matching invoice line — true profit per job.",
        columns: [
          id(),
          { name: "tailor_id", type: "TEXT", fk: "staff", required: true },
          { name: "adjustment_id", type: "TEXT", fk: "adjustments", required: true },
          { name: "invoice_line_item_id", type: "TEXT", fk: "invoice_line_items" },
          { name: "payout_id", type: "TEXT", fk: "payouts" },
          { name: "amount", type: "REAL", required: true },
          { name: "status", type: "TEXT", required: true, enums: ["pending", "approved", "paid", "void", "clawed_back"] },
        ],
      },
      {
        name: "payouts",
        blurb: "A batched payment to a tailor covering a period, following that tailor's cadence.",
        columns: [
          id(),
          { name: "tailor_id", type: "TEXT", fk: "staff", required: true },
          { name: "period_start", type: "TEXT" },
          { name: "period_end", type: "TEXT" },
          { name: "net_amount", type: "REAL", required: true },
          { name: "status", type: "TEXT", required: true, enums: ["pending", "processing", "paid", "failed"] },
          { name: "paid_at", type: "TEXT" },
        ],
      },
    ],
  },
  {
    number: 10,
    heading: "Memberships",
    description: "Optional subscriptions.",
    tables: [
      {
        name: "membership_plans",
        blurb: "Subscription plans, price, benefits.",
        columns: [
          id(),
          { name: "name", type: "TEXT", required: true },
          { name: "billing_cycle", type: "TEXT" },
          { name: "price", type: "REAL", required: true },
          { name: "discount_pct", type: "REAL" },
          { name: "benefits_json", type: "TEXT" },
          { name: "active", type: "INTEGER", required: true },
        ],
      },
      {
        name: "customer_memberships",
        blurb: "A customer's subscription to a plan.",
        columns: [
          id(),
          { name: "client_id", type: "TEXT", fk: "clients", required: true },
          { name: "plan_id", type: "TEXT", fk: "membership_plans", required: true },
          { name: "status", type: "TEXT", required: true, enums: ["active", "paused", "canceled", "expired"] },
          { name: "started_at", type: "TEXT" },
          { name: "renews_at", type: "TEXT" },
          { name: "canceled_at", type: "TEXT" },
        ],
      },
    ],
  },
  {
    number: 11,
    heading: "Promotions & referrals",
    description: "Discounts, and rewarding customers who refer others.",
    tables: [
      {
        name: "promotions",
        blurb: "Shopify-style discounts — code or automatic, percentage / fixed / free-item, with eligibility rules.",
        columns: [
          id(),
          { name: "hub_id", type: "TEXT", fk: "operating_hubs" },
          { name: "method", type: "TEXT", required: true, enums: ["code", "automatic"] },
          { name: "code", type: "TEXT", unique: true },
          { name: "name", type: "TEXT", required: true },
          { name: "value_type", type: "TEXT", required: true, enums: ["percentage", "fixed_amount", "free_item"] },
          { name: "value", type: "REAL" },
          { name: "applies_to", type: "TEXT", enums: ["order", "items"] },
          { name: "level", type: "TEXT", enums: ["order", "appointment"] },
          { name: "min_subtotal", type: "REAL" },
          { name: "min_qty", type: "INTEGER" },
          { name: "status", type: "TEXT", required: true, enums: ["active", "scheduled", "paused", "expired"] },
          { name: "starts_at", type: "TEXT" },
          { name: "ends_at", type: "TEXT" },
          { name: "max_uses", type: "INTEGER" },
          { name: "max_uses_per_customer", type: "INTEGER" },
          { name: "customer_eligibility", type: "TEXT", enums: ["anyone", "first_time", "returning"] },
          { name: "combinable_with_membership", type: "INTEGER", required: true },
          { name: "combinable_with_promos", type: "INTEGER", required: true },
        ],
      },
      {
        name: "promotion_items",
        blurb: "Which catalog items a promotion applies to.",
        columns: [
          id(),
          { name: "promotion_id", type: "TEXT", fk: "promotions", required: true },
          { name: "service_id", type: "TEXT", fk: "service_catalog", required: true },
          { name: "discount_type", type: "TEXT", enums: ["free", "amount", "percent"] },
          { name: "value", type: "REAL" },
        ],
      },
      {
        name: "promotion_email_locks",
        blurb: "Restricts a promotion to specific customers.",
        columns: [
          id(),
          { name: "promotion_id", type: "TEXT", fk: "promotions", required: true },
          { name: "email", type: "TEXT", required: true },
        ],
      },
      {
        name: "promo_redemptions",
        blurb: "Usage log — one row per actual application.",
        columns: [
          id(),
          { name: "promotion_id", type: "TEXT", fk: "promotions" },
          { name: "referral_id", type: "TEXT", fk: "referrals" },
          { name: "order_id", type: "TEXT", fk: "orders" },
          { name: "client_id", type: "TEXT", fk: "clients" },
          { name: "status", type: "TEXT", required: true, enums: ["reserved", "applied", "redeemed", "reversed"] },
        ],
      },
      {
        name: "referrals",
        blurb: "Connects a referrer to the customer they referred, and the credit that was granted.",
        columns: [
          id(),
          { name: "referrer_client_id", type: "TEXT", fk: "clients", required: true },
          { name: "referred_client_id", type: "TEXT", fk: "clients" },
          { name: "status", type: "TEXT", required: true, enums: ["pending", "qualified", "rewarded"] },
          { name: "reward_amount", type: "REAL" },
          { name: "credit_id", type: "TEXT", fk: "credits" },
        ],
      },
    ],
  },
  {
    number: 12,
    heading: "Quality & feedback",
    description: "Fixing mistakes and capturing how it went.",
    tables: [
      {
        name: "reworks",
        blurb: "A redo when something isn't right. Records fault + resolution; tailor-fault claws back the earning.",
        columns: [
          id(),
          { name: "original_adjustment_id", type: "TEXT", fk: "adjustments", required: true },
          { name: "new_adjustment_id", type: "TEXT", fk: "adjustments" },
          { name: "reason", type: "TEXT" },
          { name: "fault", type: "TEXT", enums: ["tailor", "customer", "refit"] },
          { name: "resolution", type: "TEXT", enums: ["redo_free", "refund", "credit"] },
        ],
      },
      {
        name: "feedback",
        blurb: "Rating attached to either an appointment (rates the pinner) or an adjustment (rates the tailor).",
        columns: [
          id(),
          { name: "subject_type", type: "TEXT", required: true, enums: ["appointment", "adjustment"] },
          { name: "subject_id", type: "TEXT", required: true },
          { name: "client_id", type: "TEXT", fk: "clients", required: true },
          { name: "rating", type: "INTEGER" },
          { name: "sentiment", type: "TEXT", enums: ["positive", "negative"] },
          { name: "comment", type: "TEXT" },
        ],
      },
      {
        name: "feedback_tags",
        blurb: "Tappable feedback tags, grouped by sentiment.",
        columns: [
          id(),
          { name: "category", type: "TEXT", required: true, enums: ["appointment", "product"] },
          { name: "sentiment", type: "TEXT", required: true, enums: ["positive", "negative"] },
          { name: "label", type: "TEXT", required: true },
        ],
      },
      {
        name: "feedback_tag_selections",
        blurb: "Which tags a piece of feedback selected.",
        columns: [
          id(),
          { name: "feedback_id", type: "TEXT", fk: "feedback", required: true },
          { name: "tag_id", type: "TEXT", fk: "feedback_tags", required: true },
        ],
      },
    ],
  },
  {
    number: 13,
    heading: "System",
    description: "A record of everything that changed.",
    tables: [
      {
        name: "status_events",
        blurb: "General-purpose history log: status changes on any kind of record.",
        columns: [
          id(),
          { name: "entity_type", type: "TEXT", required: true },
          { name: "entity_id", type: "TEXT", required: true },
          { name: "from_status", type: "TEXT" },
          { name: "to_status", type: "TEXT" },
          { name: "changed_by", type: "TEXT" },
          { name: "changed_at", type: "TEXT" },
        ],
      },
    ],
  },
];

export const ALL_TABLES = SECTIONS.flatMap((s) => s.tables);
export const TOTAL_TABLES = ALL_TABLES.length;
