// Types mirror schema.sql. Booleans are real booleans in TS (DB stores 0/1).

export type LeadStatus = "new" | "waitlisted" | "contacted" | "converted" | "lost";
export type Gender = "female" | "male" | "non_binary" | "self_described" | "undisclosed";
export type StaffRole = "pinner" | "tailor" | "driver" | "admin";
export type PayoutCadence = "immediate" | "weekly" | "biweekly";

export type OrderStatus = "awaiting_pickup" | "scheduled" | "in_progress" | "ready_for_return" | "delivered" | "cancelled";
export type OrderType = "self_pin" | "appointment";
export type QuoteStatus = "estimated" | "quoted" | "pending_approval" | "approved" | "declined" | "revised";

export type GarmentStatus =
  | "pinned"
  | "in_transit_to_tailor"
  | "in_alteration"
  | "completed"
  | "in_transit_to_customer"
  | "delivered"
  | "declined_by_tailor"
  | "reassigning"
  | "returned_unaltered"
  | "on_hold"
  | "cancelled";

export type AdjustmentStatus = "proposed" | "approved" | "declined" | "in_progress" | "completed" | "reworked" | "returned_unaltered";
export type Fault = "tailor" | "customer" | "refit";

export type InvoiceStatus = "draft" | "open" | "partial" | "paid" | "overdue" | "void";
export type ChargeType = "initial" | "incremental" | "balance";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type AppointmentType = "solo" | "party";
export type AppointmentStatus =
  | "requested"
  | "scheduled"
  | "confirmed"
  | "en_route"
  | "in_progress"
  | "completed"
  | "no_show"
  | "canceled"
  | "rescheduled";

export type MembershipStatus = "active" | "paused" | "canceled" | "expired";

export type RevisionReason = "initial" | "items_added" | "items_removed" | "service_changed" | "rework" | "correction";
export type Settlement = "charge" | "refund" | "credit" | "none";

export type DeliveryLeg = "pickup" | "to_tailor" | "between" | "return";

export interface OperatingHub {
  id: string;
  name: string;
  address: string;
  active: boolean;
}

export interface ServiceArea {
  id: string;
  hub_id: string;
  name: string;
  zips: string[];
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: Gender;
  referral_code: string;
  signup_channel?: string;
  created_at: string;
  hub_id: string;
}

export interface Address {
  id: string;
  client_id: string;
  label?: string;
  is_preferred: boolean;
  line1: string;
  city: string;
  zip: string;
  access_notes?: string;
}

export interface Staff {
  id: string;
  hub_id: string;
  name: string;
  role: StaffRole;
  is_contractor: boolean;
  efficiency_rating: number;
  payout_cadence?: PayoutCadence;
  capabilities?: string[];
  active: boolean;
}

export interface CatalogService {
  id: string;
  name: string;
  category: "alteration" | "repair";
  default_price: number;
  payout_rate: number;
  standard_minutes: number;
  description?: string;
  active: boolean;
}

export interface PinningMeasurement {
  id: string;
  garment_id: string;
  location: string;
  adjustment: string;
  unit: string;
  notes?: string;
}

export interface Adjustment {
  id: string;
  garment_id: string;
  service_id: string;
  service_name: string;
  qty: number;
  unit_price: number;
  amount: number;
  payout_amount: number;
  standard_minutes: number;
  status: AdjustmentStatus;
  fault?: Fault;
  rework_of_adjustment_id?: string;
}

export interface Garment {
  id: string;
  order_id: string;
  tailor_id?: string;
  tailor_name?: string;
  type: string;
  description?: string;
  status: GarmentStatus;
  estimated_minutes: number;
  adjustments: Adjustment[];
}

export interface Order {
  id: string;
  client_id: string;
  client_name: string;
  appointment_id?: string;
  type: OrderType;
  status: OrderStatus;
  quote_status?: QuoteStatus;
  approval_required?: boolean;
  estimated_total: number;
  current_total: number;
  pickup_address?: string;
  return_address?: string;
  created_at: string;
  hub_id: string;
  garments: Garment[];
  invoice: Invoice;
  revisions: OrderRevision[];
  deliveries: Delivery[];
  status_events: StatusEvent[];
}

export interface OrderRevision {
  id: string;
  order_id: string;
  revision_number: number;
  reason: RevisionReason;
  previous_total: number;
  new_total: number;
  delta: number;
  settlement?: Settlement;
  created_by_staff_name?: string;
  created_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  leg_type: DeliveryLeg;
  method?: "third_party_courier" | "in_house_driver" | "customer_dropoff" | "customer_pickup";
  provider?: string;
  status: string;
  scheduled_at?: string;
  completed_at?: string;
}

export interface StatusEvent {
  id: string;
  entity_type: string;
  entity_id: string;
  from_status?: string;
  to_status: string;
  changed_by?: string;
  changed_at: string;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  item_type: "adjustment" | "membership_fee" | "membership_discount" | "promo_discount" | "volume_discount" | "fee" | "credit";
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  client_id: string;
  order_id?: string;
  status: InvoiceStatus;
  subtotal: number;
  discount_total: number;
  credit_applied: number;
  tax: number;
  total: number;
  issued_at: string;
  lines: InvoiceLine[];
  payments: Payment[];
  refunds: Refund[];
}

export interface Payment {
  id: string;
  invoice_id: string;
  charge_type: ChargeType;
  amount: number;
  method: string;
  status: PaymentStatus;
  paid_at?: string;
  collected_by_type: "pinner" | "customer" | "system";
}

export interface Refund {
  id: string;
  invoice_id: string;
  amount: number;
  reason: "declined_work" | "rework" | "cancellation" | "goodwill" | "scope_decrease";
  created_at: string;
}

export interface Lead {
  id: string;
  phone: string;
  email?: string;
  zip: string;
  source?: string;
  utm_source?: string;
  utm_campaign?: string;
  status: LeadStatus;
  first_touch_at: string;
  in_service_area: boolean;
}

export interface Appointment {
  id: string;
  type: AppointmentType;
  host_client_id?: string;
  host_client_name?: string;
  pinner_id?: string;
  pinner_name?: string;
  address?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  order_ids: string[];
}

export interface AvailabilitySlot {
  id: string;
  staff_id: string;
  starts_at: string;
  ends_at: string;
  block_type: "available" | "break" | "travel" | "blocked" | "booked";
}

export interface MembershipPlan {
  id: string;
  name: string;
  billing_cycle: "monthly" | "annual";
  price: number;
  discount_pct: number;
  benefits: string[];
}

export interface CustomerMembership {
  id: string;
  client_id: string;
  plan_id: string;
  plan_name: string;
  status: MembershipStatus;
  started_at: string;
  renews_at: string;
}

export interface Promotion {
  id: string;
  method: "code" | "automatic";
  code?: string;
  name: string;
  value_type: "percentage" | "fixed_amount" | "free_item";
  value: number;
  status: "active" | "scheduled" | "paused" | "expired";
  max_uses?: number;
  used: number;
}

export interface Credit {
  id: string;
  client_id: string;
  amount: number;
  type: "refund_credit" | "referral_credit" | "goodwill" | "redemption";
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_client_id: string;
  referred_client_name?: string;
  status: "pending" | "qualified" | "rewarded";
  reward_amount?: number;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  client_id: string;
  brand: string;
  last4: string;
  is_default: boolean;
}

export interface Measurements {
  id: string;
  client_id: string;
  measured_at?: string;
  source: "self" | "staff";
  values: Record<string, number>;
}

export interface Feedback {
  id: string;
  subject_type: "appointment" | "adjustment";
  subject_id: string;
  client_id: string;
  rating: number;
  sentiment?: "positive" | "negative";
  comment?: string;
  tags: string[];
  created_at: string;
}

export interface TailorEarning {
  id: string;
  tailor_id: string;
  tailor_name: string;
  adjustment_id: string;
  amount: number;
  status: "pending" | "approved" | "paid" | "void" | "clawed_back";
  payout_id?: string;
}

export interface Payout {
  id: string;
  tailor_id: string;
  tailor_name: string;
  period_start: string;
  period_end: string;
  net_amount: number;
  status: "pending" | "processing" | "paid" | "failed";
  paid_at?: string;
}
