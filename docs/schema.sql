-- =============================================================================
-- Re:Fit — CANONICAL DATA MODEL (single source of truth)
-- Portable SQL: runs as-is on SQLite (the validation harness) and ports to
-- PostgreSQL. The few Postgres upgrades are noted inline as -- PG: comments.
--   PG upgrades worth making in production:
--   * replace CHECK(... IN ...) enums with native CREATE TYPE ... AS ENUM
--   * money columns NUMERIC(10,2) instead of REAL; or store integer cents
--   * appointments: real overlap guard via
--       EXCLUDE USING gist (pinner_id WITH =, tstzrange(starts_at,ends_at) WITH &&)
--   * convert the -- comments below into COMMENT ON for a queryable dictionary
-- =============================================================================

-- ---------- Geography & operating hubs ----------
CREATE TABLE operating_hubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  has_workspace INTEGER NOT NULL DEFAULT 0 CHECK (has_workspace IN (0,1)),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1))
);

CREATE TABLE service_areas (
  id TEXT PRIMARY KEY,
  hub_id TEXT NOT NULL REFERENCES operating_hubs(id),
  name TEXT NOT NULL
);

CREATE TABLE service_area_zips (
  id TEXT PRIMARY KEY,
  service_area_id TEXT NOT NULL REFERENCES service_areas(id),
  zip TEXT NOT NULL UNIQUE
);

-- ---------- Acquisition & clients ----------
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  phone_verified_at TEXT,
  email TEXT,
  zip TEXT,
  source TEXT,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_content TEXT, utm_term TEXT,
  gclid TEXT, fbclid TEXT, ttclid TEXT,
  landing_page TEXT, referrer TEXT, first_touch_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('new','waitlisted','contacted','converted','lost')),
  converted_client_id TEXT
);

CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  auth_user_id TEXT UNIQUE,
  lead_id TEXT REFERENCES leads(id),
  name TEXT NOT NULL,
  phone TEXT,
  phone_verified_at TEXT,
  email TEXT,
  gender TEXT CHECK (gender IS NULL OR gender IN ('female','male','non_binary','self_described','undisclosed')),
  referral_code TEXT UNIQUE,
  signup_channel TEXT
);

CREATE TABLE addresses (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  label TEXT,
  is_preferred INTEGER NOT NULL DEFAULT 0 CHECK (is_preferred IN (0,1)),
  line1 TEXT, city TEXT, zip TEXT, access_notes TEXT
);

CREATE TABLE measurements (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  measured_by TEXT REFERENCES staff(id),
  measured_at TEXT,
  source TEXT CHECK (source IS NULL OR source IN ('self','staff')),
  build_type TEXT,
  values_json TEXT
);

CREATE TABLE client_photos (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  url TEXT NOT NULL,
  kind TEXT
);

-- ---------- Workforce & capabilities ----------
CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  auth_user_id TEXT UNIQUE,
  hub_id TEXT REFERENCES operating_hubs(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('pinner','tailor','driver','admin')),
  is_contractor INTEGER NOT NULL DEFAULT 1 CHECK (is_contractor IN (0,1)),
  efficiency_rating REAL NOT NULL DEFAULT 1.0 CHECK (efficiency_rating > 0),
  payout_cadence TEXT CHECK (payout_cadence IS NULL OR payout_cadence IN ('immediate','weekly','biweekly'))
);

CREATE TABLE service_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('alteration','repair')),
  default_price REAL NOT NULL CHECK (default_price >= 0),
  payout_rate REAL NOT NULL CHECK (payout_rate >= 0),
  standard_minutes INTEGER CHECK (standard_minutes IS NULL OR standard_minutes >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1))
);

CREATE TABLE hub_service_prices (
  id TEXT PRIMARY KEY,
  hub_id TEXT NOT NULL REFERENCES operating_hubs(id),
  service_id TEXT NOT NULL REFERENCES service_catalog(id),
  price REAL NOT NULL CHECK (price >= 0),
  payout_rate REAL NOT NULL CHECK (payout_rate >= 0),
  UNIQUE (hub_id, service_id)
);

CREATE TABLE tailor_services (
  id TEXT PRIMARY KEY,
  tailor_id TEXT NOT NULL REFERENCES staff(id),
  service_id TEXT NOT NULL REFERENCES service_catalog(id),
  can_perform INTEGER NOT NULL DEFAULT 1 CHECK (can_perform IN (0,1)),
  rate REAL CHECK (rate IS NULL OR rate >= 0),
  UNIQUE (tailor_id, service_id)
);

-- ---------- Scheduling ----------
CREATE TABLE availability_slots (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES staff(id),
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  block_type TEXT NOT NULL CHECK (block_type IN ('available','break','travel','blocked','booked')),
  CHECK (ends_at > starts_at)
);

CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('solo','party')),
  host_client_id TEXT REFERENCES clients(id),
  slot_id TEXT UNIQUE REFERENCES availability_slots(id),
  pinner_id TEXT REFERENCES staff(id),
  address_id TEXT REFERENCES addresses(id),
  scheduled_at TEXT,
  duration_minutes INTEGER,
  travel_buffer_minutes INTEGER,
  entered_code TEXT,
  status TEXT NOT NULL CHECK (status IN ('requested','scheduled','confirmed','en_route','in_progress','completed','no_show','canceled','rescheduled'))
);

-- ---------- The job ----------
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  appointment_id TEXT REFERENCES appointments(id),
  type TEXT NOT NULL CHECK (type IN ('self_pin','appointment')),
  estimated_total REAL CHECK (estimated_total IS NULL OR estimated_total >= 0),
  status TEXT NOT NULL CHECK (status IN ('awaiting_pickup','scheduled','in_progress','ready_for_return','delivered','cancelled')),
  quote_status TEXT CHECK (quote_status IS NULL OR quote_status IN ('estimated','quoted','pending_approval','approved','declined','revised')),
  approval_required INTEGER CHECK (approval_required IS NULL OR approval_required IN (0,1)),
  pickup_address_id TEXT REFERENCES addresses(id),
  return_address_id TEXT REFERENCES addresses(id),
  applied_membership_id TEXT REFERENCES customer_memberships(id)
);

CREATE TABLE garments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  tailor_id TEXT REFERENCES staff(id),
  type TEXT,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pinned','in_transit_to_tailor','in_alteration','completed','in_transit_to_customer','delivered','declined_by_tailor','reassigning','returned_unaltered','on_hold','cancelled')),
  estimated_minutes INTEGER
);

CREATE TABLE pinning_measurements (
  id TEXT PRIMARY KEY,
  garment_id TEXT NOT NULL REFERENCES garments(id),
  pinned_by TEXT REFERENCES staff(id),
  location TEXT, adjustment TEXT, unit TEXT, notes TEXT
);

CREATE TABLE adjustments (
  id TEXT PRIMARY KEY,
  garment_id TEXT NOT NULL REFERENCES garments(id),
  service_id TEXT NOT NULL REFERENCES service_catalog(id),
  pinning_measurement_id TEXT REFERENCES pinning_measurements(id),
  priced_by TEXT REFERENCES staff(id),
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit_price REAL NOT NULL CHECK (unit_price >= 0),
  amount REAL NOT NULL CHECK (amount >= 0),
  payout_amount REAL NOT NULL DEFAULT 0 CHECK (payout_amount >= 0),
  standard_minutes INTEGER, estimated_minutes INTEGER, actual_minutes INTEGER,
  status TEXT NOT NULL CHECK (status IN ('proposed','approved','declined','in_progress','completed','reworked','returned_unaltered')),
  rework_of_adjustment_id TEXT REFERENCES adjustments(id),
  fault TEXT CHECK (fault IS NULL OR fault IN ('tailor','customer','refit'))
);

-- ---------- Logistics ----------
CREATE TABLE deliveries (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  leg_type TEXT NOT NULL CHECK (leg_type IN ('pickup','to_tailor','between','return')),
  method TEXT CHECK (method IS NULL OR method IN ('third_party_courier','in_house_driver','customer_dropoff','customer_pickup')),
  provider TEXT, external_ref TEXT, driver TEXT,
  status TEXT
);

-- ---------- Payouts ----------
CREATE TABLE payouts (
  id TEXT PRIMARY KEY,
  tailor_id TEXT NOT NULL REFERENCES staff(id),
  period_start TEXT, period_end TEXT,
  net_amount REAL NOT NULL CHECK (net_amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending','processing','paid','failed')),
  paid_at TEXT
);

CREATE TABLE tailor_earnings (
  id TEXT PRIMARY KEY,
  tailor_id TEXT NOT NULL REFERENCES staff(id),
  adjustment_id TEXT NOT NULL REFERENCES adjustments(id),
  invoice_line_item_id TEXT REFERENCES invoice_line_items(id),
  payout_id TEXT REFERENCES payouts(id),
  amount REAL NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending','approved','paid','void','clawed_back'))
);

CREATE TABLE reworks (
  id TEXT PRIMARY KEY,
  original_adjustment_id TEXT NOT NULL REFERENCES adjustments(id),
  new_adjustment_id TEXT REFERENCES adjustments(id),
  reason TEXT,
  fault TEXT CHECK (fault IS NULL OR fault IN ('tailor','customer','refit')),
  resolution TEXT CHECK (resolution IS NULL OR resolution IN ('redo_free','refund','credit'))
);

-- ---------- Membership ----------
CREATE TABLE membership_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  billing_cycle TEXT,
  price REAL NOT NULL CHECK (price >= 0),
  discount_pct REAL CHECK (discount_pct IS NULL OR (discount_pct >= 0 AND discount_pct <= 100)),
  benefits_json TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1))
);

CREATE TABLE customer_memberships (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  plan_id TEXT NOT NULL REFERENCES membership_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active','paused','canceled','expired')),
  started_at TEXT, renews_at TEXT, canceled_at TEXT
);

-- ---------- Billing ----------
CREATE TABLE payment_methods (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  processor_token TEXT, brand TEXT, last4 TEXT,
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0,1))
);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  order_id TEXT REFERENCES orders(id),
  status TEXT NOT NULL CHECK (status IN ('draft','open','partial','paid','overdue','void')),
  subtotal REAL NOT NULL CHECK (subtotal >= 0),
  discount_total REAL NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  credit_applied REAL NOT NULL DEFAULT 0 CHECK (credit_applied >= 0),
  tax REAL NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total REAL NOT NULL CHECK (total >= 0),
  issued_at TEXT,
  CHECK (abs(total - (subtotal - discount_total - credit_applied + tax)) < 0.01)
);

CREATE TABLE invoice_line_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  item_type TEXT NOT NULL CHECK (item_type IN ('adjustment','membership_fee','membership_discount','promo_discount','volume_discount','fee','credit')),
  reference_id TEXT,
  description TEXT,
  amount REAL NOT NULL
);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  payment_method_id TEXT REFERENCES payment_methods(id),
  collected_by_type TEXT NOT NULL CHECK (collected_by_type IN ('pinner','customer','system')),
  collected_by_staff_id TEXT REFERENCES staff(id),
  charge_type TEXT CHECK (charge_type IS NULL OR charge_type IN ('initial','incremental','balance')),
  amount REAL NOT NULL CHECK (amount >= 0),
  method TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','paid','failed','refunded')),
  paid_at TEXT
);

CREATE TABLE refunds (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  payment_id TEXT REFERENCES payments(id),
  amount REAL NOT NULL CHECK (amount > 0),
  reason TEXT CHECK (reason IS NULL OR reason IN ('declined_work','rework','cancellation','goodwill','scope_decrease')),
  status TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE order_revisions (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  revision_number INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('initial','items_added','items_removed','service_changed','rework','correction')),
  previous_total REAL NOT NULL CHECK (previous_total >= 0),
  new_total REAL NOT NULL CHECK (new_total >= 0),
  delta REAL NOT NULL,
  settlement TEXT CHECK (settlement IS NULL OR settlement IN ('charge','refund','credit','none')),
  created_by_staff_id TEXT REFERENCES staff(id),
  created_at TEXT NOT NULL,
  UNIQUE(order_id, revision_number),
  CHECK (abs(delta - (new_total - previous_total)) < 0.01)
);

CREATE TABLE credits (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('refund_credit','referral_credit','goodwill','redemption')),
  reference_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE referrals (
  id TEXT PRIMARY KEY,
  referrer_client_id TEXT NOT NULL REFERENCES clients(id),
  referred_client_id TEXT REFERENCES clients(id),
  status TEXT NOT NULL CHECK (status IN ('pending','qualified','rewarded')),
  reward_amount REAL CHECK (reward_amount IS NULL OR reward_amount >= 0),
  credit_id TEXT REFERENCES credits(id),
  CHECK (referrer_client_id <> referred_client_id)
);

-- ---------- Promotions ----------
CREATE TABLE promotions (
  id TEXT PRIMARY KEY,
  hub_id TEXT REFERENCES operating_hubs(id),
  method TEXT NOT NULL CHECK (method IN ('code','automatic')),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  value_type TEXT NOT NULL CHECK (value_type IN ('percentage','fixed_amount','free_item')),
  value REAL CHECK (value IS NULL OR value >= 0),
  applies_to TEXT CHECK (applies_to IS NULL OR applies_to IN ('order','items')),
  level TEXT CHECK (level IS NULL OR level IN ('order','appointment')),
  min_subtotal REAL CHECK (min_subtotal IS NULL OR min_subtotal >= 0),
  min_qty INTEGER CHECK (min_qty IS NULL OR min_qty >= 0),
  status TEXT NOT NULL CHECK (status IN ('active','scheduled','paused','expired')),
  starts_at TEXT, ends_at TEXT,
  max_uses INTEGER, max_uses_per_customer INTEGER,
  customer_eligibility TEXT CHECK (customer_eligibility IS NULL OR customer_eligibility IN ('anyone','first_time','returning')),
  combinable_with_membership INTEGER NOT NULL DEFAULT 0 CHECK (combinable_with_membership IN (0,1)),
  combinable_with_promos INTEGER NOT NULL DEFAULT 0 CHECK (combinable_with_promos IN (0,1)),
  CHECK ((method='code' AND code IS NOT NULL) OR (method='automatic' AND code IS NULL))
);

CREATE TABLE promotion_items (
  id TEXT PRIMARY KEY,
  promotion_id TEXT NOT NULL REFERENCES promotions(id),
  service_id TEXT NOT NULL REFERENCES service_catalog(id),
  discount_type TEXT CHECK (discount_type IS NULL OR discount_type IN ('free','amount','percent')),
  value REAL
);

CREATE TABLE promotion_email_locks (
  id TEXT PRIMARY KEY,
  promotion_id TEXT NOT NULL REFERENCES promotions(id),
  email TEXT NOT NULL
);

CREATE TABLE promo_redemptions (
  id TEXT PRIMARY KEY,
  promotion_id TEXT REFERENCES promotions(id),
  referral_id TEXT REFERENCES referrals(id),
  order_id TEXT REFERENCES orders(id),
  client_id TEXT REFERENCES clients(id),
  status TEXT NOT NULL CHECK (status IN ('reserved','applied','redeemed','reversed')),
  CHECK (promotion_id IS NOT NULL OR referral_id IS NOT NULL)
);

-- ---------- Sentiment ----------
CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('appointment','adjustment')),
  subject_id TEXT NOT NULL,
  client_id TEXT NOT NULL REFERENCES clients(id),
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  sentiment TEXT CHECK (sentiment IS NULL OR sentiment IN ('positive','negative')),
  comment TEXT
);

CREATE TABLE feedback_tags (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('appointment','product')),
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive','negative')),
  label TEXT NOT NULL
);

CREATE TABLE feedback_tag_selections (
  id TEXT PRIMARY KEY,
  feedback_id TEXT NOT NULL REFERENCES feedback(id),
  tag_id TEXT NOT NULL REFERENCES feedback_tags(id),
  UNIQUE (feedback_id, tag_id)
);

-- ---------- Operations ----------
CREATE TABLE status_events (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  from_status TEXT, to_status TEXT,
  changed_by TEXT, changed_at TEXT
);

-- ---------- Triggers (capability enforcement) ----------
CREATE TRIGGER trg_assign_capability
BEFORE UPDATE OF tailor_id ON garments
FOR EACH ROW WHEN NEW.tailor_id IS NOT NULL
BEGIN
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM adjustments a
    WHERE a.garment_id = NEW.id
      AND NOT EXISTS (
        SELECT 1 FROM tailor_services ts
        WHERE ts.tailor_id = NEW.tailor_id AND ts.service_id = a.service_id AND ts.can_perform = 1)
  ) THEN RAISE(ABORT, 'assigned tailor cannot perform one or more of this garment''s adjustments') END;
END;

CREATE TRIGGER trg_add_adjustment_capability
BEFORE INSERT ON adjustments
FOR EACH ROW
BEGIN
  SELECT CASE WHEN (
      (SELECT tailor_id FROM garments WHERE id = NEW.garment_id) IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM tailor_services ts
        WHERE ts.tailor_id = (SELECT tailor_id FROM garments WHERE id = NEW.garment_id)
          AND ts.service_id = NEW.service_id AND ts.can_perform = 1)
  ) THEN RAISE(ABORT, 'garment''s assigned tailor cannot perform this adjustment') END;
END;
