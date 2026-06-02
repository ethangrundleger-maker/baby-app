import type {
  Address,
  Adjustment,
  Appointment,
  AvailabilitySlot,
  Client,
  Credit,
  CustomerMembership,
  Delivery,
  Feedback,
  Garment,
  Invoice,
  InvoiceLine,
  Lead,
  Measurements,
  Order,
  OrderRevision,
  Payment,
  PaymentMethod,
  Payout,
  Promotion,
  Refund,
  Referral,
  StatusEvent,
  TailorEarning,
} from "@/lib/types";
import { getService } from "./catalog";
import { STAFF } from "./staff";
export { STAFF };

// ----- current client (signed-in) -----
export const ME: Client = {
  id: "cli_me",
  name: "Avery Whitaker",
  phone: "+15555550199",
  email: "avery@example.com",
  gender: "non_binary",
  referral_code: "AVERY-9C2",
  signup_channel: "instagram",
  created_at: "2026-02-10T14:30:00Z",
  hub_id: "hub_nyc",
};

export const ADDRESSES: Address[] = [
  { id: "adr_1", client_id: ME.id, label: "Home", is_preferred: true, line1: "224 Carroll St, Apt 3", city: "Brooklyn", zip: "11231", access_notes: "Buzzer #3W. Dog is friendly." },
  { id: "adr_2", client_id: ME.id, label: "Office", is_preferred: false, line1: "100 Bowery, 4F", city: "New York", zip: "10013", access_notes: "Reception will hold packages." },
];

export const CLIENTS: Client[] = [
  ME,
  { id: "cli_jhayes", name: "Jamie Hayes", phone: "+15555550120", email: "jamie@example.com", referral_code: "JAMIE-4K1", created_at: "2026-01-04T10:00:00Z", hub_id: "hub_nyc" },
  { id: "cli_lcho", name: "Lena Cho", phone: "+15555550155", email: "lena@example.com", referral_code: "LENA-2X8", created_at: "2026-02-22T18:11:00Z", hub_id: "hub_nyc" },
  { id: "cli_dpark", name: "Daniel Park", phone: "+15555550144", email: "danny@example.com", referral_code: "DAN-7L3", created_at: "2026-03-01T09:21:00Z", hub_id: "hub_sf" },
  { id: "cli_mhall", name: "Morgan Hall", phone: "+15555550133", email: "morgan@example.com", referral_code: "MORGAN-6Q4", created_at: "2026-03-12T20:00:00Z", hub_id: "hub_la" },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm_1", client_id: ME.id, brand: "Visa", last4: "4242", is_default: true },
  { id: "pm_2", client_id: ME.id, brand: "Amex", last4: "1003", is_default: false },
];

export const CREDITS: Credit[] = [
  { id: "cr_1", client_id: ME.id, amount: 25, type: "referral_credit", created_at: "2026-03-04T17:00:00Z" },
  { id: "cr_2", client_id: ME.id, amount: -10, type: "redemption", created_at: "2026-04-12T15:20:00Z" },
  { id: "cr_3", client_id: ME.id, amount: 8.5, type: "goodwill", created_at: "2026-05-02T11:00:00Z" },
];

export const REFERRALS: Referral[] = [
  { id: "ref_1", referrer_client_id: ME.id, referred_client_name: "Sam J.", status: "rewarded", reward_amount: 25, created_at: "2026-03-04T17:00:00Z" },
  { id: "ref_2", referrer_client_id: ME.id, referred_client_name: "Casey N.", status: "qualified", reward_amount: 25, created_at: "2026-04-21T19:00:00Z" },
  { id: "ref_3", referrer_client_id: ME.id, referred_client_name: "Pending invite", status: "pending", created_at: "2026-05-12T16:00:00Z" },
];

export const MEASUREMENTS: Measurements = {
  id: "msr_1",
  client_id: ME.id,
  measured_at: "2026-04-02T15:00:00Z",
  source: "staff",
  values: { chest: 38, waist: 31, hips: 38, inseam: 30, shoulder: 17.5, sleeve: 24.5, neck: 15 },
};

export const MY_MEMBERSHIP: CustomerMembership | undefined = {
  id: "mem_1",
  client_id: ME.id,
  plan_id: "plan_signature",
  plan_name: "Signature",
  status: "active",
  started_at: "2026-03-01T00:00:00Z",
  renews_at: "2026-07-01T00:00:00Z",
};

// ----- Build a few orders that show every lifecycle state -----

function makeAdjustment(garment_id: string, service_id: string, qty: number, override?: Partial<Adjustment>): Adjustment {
  const svc = getService(service_id)!;
  const amount = svc.default_price * qty;
  return {
    id: `adj_${garment_id}_${service_id}`,
    garment_id,
    service_id,
    service_name: svc.name,
    qty,
    unit_price: svc.default_price,
    amount,
    payout_amount: svc.payout_rate * qty,
    standard_minutes: svc.standard_minutes * qty,
    status: "approved",
    ...override,
  };
}

// ---------- ORDER 1: in-progress booked order with a scope increase ----------
const o1_garments: Garment[] = [
  {
    id: "grm_1a",
    order_id: "ord_1",
    tailor_id: "stf_tailor_1",
    tailor_name: "Elena Vasquez",
    type: "Suit pants",
    description: "Charcoal wool suit pants, JCrew",
    status: "in_alteration",
    estimated_minutes: 70,
    adjustments: [
      makeAdjustment("grm_1a", "svc_hem_pants", 1, { status: "in_progress" }),
      makeAdjustment("grm_1a", "svc_taper_pants", 1, { status: "in_progress" }),
    ],
  },
  {
    id: "grm_1b",
    order_id: "ord_1",
    tailor_id: "stf_tailor_2",
    tailor_name: "Hiroshi Tanaka",
    type: "Blazer",
    description: "Navy wool blazer, Theory",
    status: "in_transit_to_tailor",
    estimated_minutes: 150,
    adjustments: [
      makeAdjustment("grm_1b", "svc_jacket_take_in", 1, { status: "approved" }),
      makeAdjustment("grm_1b", "svc_shorten_sleeves_jacket", 1, { status: "approved" }),
    ],
  },
];

const o1_invoice_lines: InvoiceLine[] = [
  { id: "li_1a", invoice_id: "inv_1", item_type: "adjustment", description: "Hem pants × 1", amount: 22 },
  { id: "li_1b", invoice_id: "inv_1", item_type: "adjustment", description: "Taper pants × 1", amount: 38 },
  { id: "li_1c", invoice_id: "inv_1", item_type: "adjustment", description: "Take in blazer × 1", amount: 65 },
  { id: "li_1d", invoice_id: "inv_1", item_type: "adjustment", description: "Shorten jacket sleeves × 1", amount: 55 },
  { id: "li_1e", invoice_id: "inv_1", item_type: "membership_discount", description: "Signature (20% off)", amount: -36 },
];

const o1_payments: Payment[] = [
  { id: "pay_1a", invoice_id: "inv_1", charge_type: "initial", amount: 120, method: "Visa •4242", status: "paid", paid_at: "2026-05-20T15:00:00Z", collected_by_type: "customer" },
  { id: "pay_1b", invoice_id: "inv_1", charge_type: "incremental", amount: 24, method: "Visa •4242", status: "paid", paid_at: "2026-05-23T11:42:00Z", collected_by_type: "customer" },
];

const o1_invoice: Invoice = {
  id: "inv_1",
  client_id: ME.id,
  order_id: "ord_1",
  status: "paid",
  subtotal: 180,
  discount_total: 36,
  credit_applied: 0,
  tax: 0,
  total: 144,
  issued_at: "2026-05-20T15:00:00Z",
  lines: o1_invoice_lines,
  payments: o1_payments,
  refunds: [],
};

const o1_revisions: OrderRevision[] = [
  { id: "rev_1a", order_id: "ord_1", revision_number: 1, reason: "initial", previous_total: 0, new_total: 120, delta: 120, settlement: "charge", created_by_staff_name: "Maya Patel", created_at: "2026-05-20T15:00:00Z" },
  { id: "rev_1b", order_id: "ord_1", revision_number: 2, reason: "items_added", previous_total: 120, new_total: 144, delta: 24, settlement: "charge", created_by_staff_name: "Maya Patel", created_at: "2026-05-23T11:42:00Z" },
];

const o1_status_events: StatusEvent[] = [
  { id: "se_1a", entity_type: "order", entity_id: "ord_1", to_status: "scheduled", changed_at: "2026-05-15T20:00:00Z", changed_by: "system" },
  { id: "se_1b", entity_type: "order", entity_id: "ord_1", from_status: "scheduled", to_status: "in_progress", changed_at: "2026-05-20T17:30:00Z", changed_by: "Maya Patel" },
  { id: "se_1c", entity_type: "garment", entity_id: "grm_1a", to_status: "pinned", changed_at: "2026-05-20T16:15:00Z", changed_by: "Maya Patel" },
  { id: "se_1d", entity_type: "garment", entity_id: "grm_1a", from_status: "pinned", to_status: "in_transit_to_tailor", changed_at: "2026-05-22T09:00:00Z", changed_by: "Dani Vega" },
  { id: "se_1e", entity_type: "garment", entity_id: "grm_1a", from_status: "in_transit_to_tailor", to_status: "in_alteration", changed_at: "2026-05-23T10:00:00Z", changed_by: "Elena Vasquez" },
];

const o1_deliveries: Delivery[] = [
  { id: "dlv_1a", order_id: "ord_1", leg_type: "pickup", method: "in_house_driver", provider: "Re:Fit", status: "completed", scheduled_at: "2026-05-20T15:00:00Z", completed_at: "2026-05-20T16:30:00Z" },
  { id: "dlv_1b", order_id: "ord_1", leg_type: "to_tailor", method: "in_house_driver", provider: "Re:Fit", status: "completed", scheduled_at: "2026-05-22T09:00:00Z", completed_at: "2026-05-22T11:15:00Z" },
  { id: "dlv_1c", order_id: "ord_1", leg_type: "return", method: "in_house_driver", provider: "Re:Fit", status: "scheduled", scheduled_at: "2026-06-04T10:00:00Z" },
];

const ORDER_1: Order = {
  id: "ord_1",
  client_id: ME.id,
  client_name: ME.name,
  appointment_id: "apt_1",
  type: "appointment",
  status: "in_progress",
  quote_status: "approved",
  approval_required: false,
  estimated_total: 120,
  current_total: 144,
  pickup_address: "224 Carroll St, Brooklyn",
  return_address: "224 Carroll St, Brooklyn",
  created_at: "2026-05-15T20:00:00Z",
  hub_id: "hub_nyc",
  garments: o1_garments,
  invoice: o1_invoice,
  revisions: o1_revisions,
  deliveries: o1_deliveries,
  status_events: o1_status_events,
};

// ---------- ORDER 2: self-pin, awaiting pickup ----------
const o2_garments: Garment[] = [
  {
    id: "grm_2a",
    order_id: "ord_2",
    type: "Linen dress",
    description: "Reformation Juliette",
    status: "pinned",
    estimated_minutes: 45,
    adjustments: [makeAdjustment("grm_2a", "svc_hem_dress", 1, { status: "approved" })],
  },
];

const o2_invoice_lines: InvoiceLine[] = [
  { id: "li_2a", invoice_id: "inv_2", item_type: "adjustment", description: "Hem dress × 1", amount: 36 },
  { id: "li_2b", invoice_id: "inv_2", item_type: "membership_discount", description: "Signature (20% off)", amount: -7.2 },
];

const ORDER_2: Order = {
  id: "ord_2",
  client_id: ME.id,
  client_name: ME.name,
  type: "self_pin",
  status: "awaiting_pickup",
  quote_status: "approved",
  estimated_total: 28.8,
  current_total: 28.8,
  pickup_address: "224 Carroll St, Brooklyn",
  return_address: "224 Carroll St, Brooklyn",
  created_at: "2026-05-29T19:00:00Z",
  hub_id: "hub_nyc",
  garments: o2_garments,
  invoice: {
    id: "inv_2",
    client_id: ME.id,
    order_id: "ord_2",
    status: "paid",
    subtotal: 36,
    discount_total: 7.2,
    credit_applied: 0,
    tax: 0,
    total: 28.8,
    issued_at: "2026-05-29T19:00:00Z",
    lines: o2_invoice_lines,
    payments: [{ id: "pay_2a", invoice_id: "inv_2", charge_type: "initial", amount: 28.8, method: "Visa •4242", status: "paid", paid_at: "2026-05-29T19:00:00Z", collected_by_type: "customer" }],
    refunds: [],
  },
  revisions: [
    { id: "rev_2a", order_id: "ord_2", revision_number: 1, reason: "initial", previous_total: 0, new_total: 28.8, delta: 28.8, settlement: "charge", created_at: "2026-05-29T19:00:00Z" },
  ],
  deliveries: [{ id: "dlv_2a", order_id: "ord_2", leg_type: "pickup", method: "third_party_courier", provider: "Veho", status: "scheduled", scheduled_at: "2026-06-03T11:00:00Z" }],
  status_events: [{ id: "se_2a", entity_type: "order", entity_id: "ord_2", to_status: "awaiting_pickup", changed_at: "2026-05-29T19:00:00Z", changed_by: "system" }],
};

// ---------- ORDER 3: delivered (history) with a scope-decrease refund ----------
const o3_invoice_lines: InvoiceLine[] = [
  { id: "li_3a", invoice_id: "inv_3", item_type: "adjustment", description: "Hem jeans × 2", amount: 56 },
  { id: "li_3b", invoice_id: "inv_3", item_type: "adjustment", description: "Seam repair × 1", amount: 14 },
  { id: "li_3c", invoice_id: "inv_3", item_type: "membership_discount", description: "Signature (20% off)", amount: -14 },
];

const ORDER_3: Order = {
  id: "ord_3",
  client_id: ME.id,
  client_name: ME.name,
  type: "self_pin",
  status: "delivered",
  quote_status: "approved",
  estimated_total: 84,
  current_total: 56,
  pickup_address: "224 Carroll St, Brooklyn",
  return_address: "224 Carroll St, Brooklyn",
  created_at: "2026-04-10T18:00:00Z",
  hub_id: "hub_nyc",
  garments: [
    {
      id: "grm_3a",
      order_id: "ord_3",
      tailor_id: "stf_tailor_1",
      tailor_name: "Elena Vasquez",
      type: "Jeans (2)",
      description: "Two pair of dark wash jeans",
      status: "delivered",
      estimated_minutes: 60,
      adjustments: [
        makeAdjustment("grm_3a", "svc_hem_jeans", 2, { status: "completed" }),
        makeAdjustment("grm_3a", "svc_seam_repair", 1, { status: "returned_unaltered" }),
      ],
    },
  ],
  invoice: {
    id: "inv_3",
    client_id: ME.id,
    order_id: "ord_3",
    status: "paid",
    subtotal: 56,
    discount_total: 11.2,
    credit_applied: 0,
    tax: 0,
    total: 44.8,
    issued_at: "2026-04-10T18:00:00Z",
    lines: o3_invoice_lines,
    payments: [{ id: "pay_3a", invoice_id: "inv_3", charge_type: "initial", amount: 67.2, method: "Visa •4242", status: "paid", paid_at: "2026-04-10T18:00:00Z", collected_by_type: "customer" }],
    refunds: [{ id: "rfd_3a", invoice_id: "inv_3", amount: 22.4, reason: "scope_decrease", created_at: "2026-04-15T14:30:00Z" }],
  },
  revisions: [
    { id: "rev_3a", order_id: "ord_3", revision_number: 1, reason: "initial", previous_total: 0, new_total: 67.2, delta: 67.2, settlement: "charge", created_at: "2026-04-10T18:00:00Z" },
    { id: "rev_3b", order_id: "ord_3", revision_number: 2, reason: "items_removed", previous_total: 67.2, new_total: 44.8, delta: -22.4, settlement: "refund", created_by_staff_name: "Elena Vasquez", created_at: "2026-04-15T14:30:00Z" },
  ],
  deliveries: [
    { id: "dlv_3a", order_id: "ord_3", leg_type: "pickup", method: "third_party_courier", provider: "Veho", status: "completed", scheduled_at: "2026-04-11T09:00:00Z", completed_at: "2026-04-11T11:00:00Z" },
    { id: "dlv_3b", order_id: "ord_3", leg_type: "return", method: "third_party_courier", provider: "Veho", status: "completed", scheduled_at: "2026-04-17T10:00:00Z", completed_at: "2026-04-17T13:00:00Z" },
  ],
  status_events: [
    { id: "se_3a", entity_type: "order", entity_id: "ord_3", to_status: "awaiting_pickup", changed_at: "2026-04-10T18:00:00Z", changed_by: "system" },
    { id: "se_3b", entity_type: "order", entity_id: "ord_3", from_status: "awaiting_pickup", to_status: "in_progress", changed_at: "2026-04-11T11:00:00Z", changed_by: "system" },
    { id: "se_3c", entity_type: "order", entity_id: "ord_3", from_status: "in_progress", to_status: "ready_for_return", changed_at: "2026-04-16T16:00:00Z", changed_by: "Elena Vasquez" },
    { id: "se_3d", entity_type: "order", entity_id: "ord_3", from_status: "ready_for_return", to_status: "delivered", changed_at: "2026-04-17T13:00:00Z", changed_by: "Veho" },
  ],
};

// ---------- ORDER 4: quote pending approval ----------
const ORDER_4: Order = {
  id: "ord_4",
  client_id: ME.id,
  client_name: ME.name,
  type: "appointment",
  appointment_id: "apt_2",
  status: "in_progress",
  quote_status: "pending_approval",
  approval_required: true,
  estimated_total: 150,
  current_total: 215,
  pickup_address: "224 Carroll St, Brooklyn",
  return_address: "224 Carroll St, Brooklyn",
  created_at: "2026-05-26T19:00:00Z",
  hub_id: "hub_nyc",
  garments: [
    {
      id: "grm_4a",
      order_id: "ord_4",
      type: "Wedding suit",
      description: "Three-piece tuxedo for September wedding",
      status: "pinned",
      estimated_minutes: 240,
      adjustments: [
        makeAdjustment("grm_4a", "svc_taper_pants", 1, { status: "proposed" }),
        makeAdjustment("grm_4a", "svc_hem_pants", 1, { status: "proposed" }),
        makeAdjustment("grm_4a", "svc_jacket_take_in", 1, { status: "proposed" }),
        makeAdjustment("grm_4a", "svc_shorten_sleeves_jacket", 1, { status: "proposed" }),
      ],
    },
  ],
  invoice: {
    id: "inv_4",
    client_id: ME.id,
    order_id: "ord_4",
    status: "open",
    subtotal: 215,
    discount_total: 0,
    credit_applied: 0,
    tax: 0,
    total: 215,
    issued_at: "2026-05-26T19:00:00Z",
    lines: [
      { id: "li_4a", invoice_id: "inv_4", item_type: "adjustment", description: "Taper pants", amount: 38 },
      { id: "li_4b", invoice_id: "inv_4", item_type: "adjustment", description: "Hem pants", amount: 22 },
      { id: "li_4c", invoice_id: "inv_4", item_type: "adjustment", description: "Take in jacket", amount: 65 },
      { id: "li_4d", invoice_id: "inv_4", item_type: "adjustment", description: "Shorten jacket sleeves", amount: 55 },
      { id: "li_4e", invoice_id: "inv_4", item_type: "adjustment", description: "Vest take-in (custom)", amount: 35 },
    ],
    payments: [{ id: "pay_4a", invoice_id: "inv_4", charge_type: "initial", amount: 150, method: "Visa •4242", status: "paid", paid_at: "2026-05-26T19:00:00Z", collected_by_type: "customer" }],
    refunds: [],
  },
  revisions: [
    { id: "rev_4a", order_id: "ord_4", revision_number: 1, reason: "initial", previous_total: 0, new_total: 150, delta: 150, settlement: "charge", created_at: "2026-05-26T19:00:00Z" },
  ],
  deliveries: [{ id: "dlv_4a", order_id: "ord_4", leg_type: "pickup", method: "in_house_driver", provider: "Re:Fit", status: "completed", scheduled_at: "2026-05-27T14:00:00Z", completed_at: "2026-05-27T15:30:00Z" }],
  status_events: [
    { id: "se_4a", entity_type: "order", entity_id: "ord_4", to_status: "scheduled", changed_at: "2026-05-22T10:00:00Z", changed_by: "system" },
    { id: "se_4b", entity_type: "order", entity_id: "ord_4", from_status: "scheduled", to_status: "in_progress", changed_at: "2026-05-27T15:30:00Z", changed_by: "Sofia Rivera" },
  ],
};

export const MY_ORDERS: Order[] = [ORDER_1, ORDER_2, ORDER_3, ORDER_4];

// Cross-client orders for admin view
export const ALL_ORDERS: Order[] = [
  ...MY_ORDERS,
  // a few for other clients
  {
    ...ORDER_2,
    id: "ord_5",
    client_id: "cli_jhayes",
    client_name: "Jamie Hayes",
    status: "in_progress",
    current_total: 64,
    estimated_total: 64,
    garments: [
      {
        ...ORDER_2.garments[0],
        id: "grm_5a",
        order_id: "ord_5",
        type: "Wool trousers",
        tailor_id: "stf_tailor_4",
        tailor_name: "Marcus King",
        status: "in_alteration",
        adjustments: [makeAdjustment("grm_5a", "svc_hem_pants", 2, { status: "in_progress" }), makeAdjustment("grm_5a", "svc_waist_in_pants", 1, { status: "in_progress" })],
      },
    ],
    created_at: "2026-05-25T11:00:00Z",
  },
  {
    ...ORDER_3,
    id: "ord_6",
    client_id: "cli_lcho",
    client_name: "Lena Cho",
    status: "ready_for_return",
    current_total: 36,
    estimated_total: 36,
    garments: [
      {
        ...ORDER_3.garments[0],
        id: "grm_6a",
        order_id: "ord_6",
        type: "Silk blouse",
        tailor_id: "stf_tailor_3",
        tailor_name: "Priya Singh",
        status: "completed",
        adjustments: [makeAdjustment("grm_6a", "svc_take_in_shirt", 1, { status: "completed" })],
      },
    ],
    created_at: "2026-05-22T11:00:00Z",
  },
  {
    ...ORDER_2,
    id: "ord_7",
    client_id: "cli_mhall",
    client_name: "Morgan Hall",
    status: "awaiting_pickup",
    current_total: 168,
    estimated_total: 168,
    hub_id: "hub_la",
    garments: [
      {
        ...ORDER_2.garments[0],
        id: "grm_7a",
        order_id: "ord_7",
        type: "Cocktail dress",
        status: "pinned",
        adjustments: [makeAdjustment("grm_7a", "svc_hem_dress", 1, { status: "approved" }), makeAdjustment("grm_7a", "svc_take_in_dress", 1, { status: "approved" }), makeAdjustment("grm_7a", "svc_strap_adjust", 1, { status: "approved" })],
      },
    ],
    created_at: "2026-05-30T18:00:00Z",
  },
];

// ----- Appointments -----
export const APPOINTMENTS: Appointment[] = [
  {
    id: "apt_1",
    type: "solo",
    host_client_id: ME.id,
    host_client_name: ME.name,
    pinner_id: "stf_pinner_1",
    pinner_name: "Maya Patel",
    address: "224 Carroll St, Brooklyn",
    scheduled_at: "2026-05-20T15:00:00Z",
    duration_minutes: 60,
    status: "completed",
    order_ids: ["ord_1"],
  },
  {
    id: "apt_2",
    type: "solo",
    host_client_id: ME.id,
    host_client_name: ME.name,
    pinner_id: "stf_pinner_2",
    pinner_name: "Sofia Rivera",
    address: "224 Carroll St, Brooklyn",
    scheduled_at: "2026-05-27T14:00:00Z",
    duration_minutes: 60,
    status: "completed",
    order_ids: ["ord_4"],
  },
  {
    id: "apt_3",
    type: "party",
    host_client_id: "cli_lcho",
    host_client_name: "Lena Cho",
    pinner_id: "stf_pinner_1",
    pinner_name: "Maya Patel",
    address: "92 Berry St, Brooklyn",
    scheduled_at: "2026-06-06T17:00:00Z",
    duration_minutes: 120,
    status: "scheduled",
    order_ids: ["ord_6"],
  },
  {
    id: "apt_4",
    type: "solo",
    host_client_id: "cli_jhayes",
    host_client_name: "Jamie Hayes",
    pinner_id: "stf_pinner_2",
    pinner_name: "Sofia Rivera",
    address: "44 Greene Ave, Brooklyn",
    scheduled_at: "2026-06-04T11:00:00Z",
    duration_minutes: 60,
    status: "confirmed",
    order_ids: ["ord_5"],
  },
];

// Slots offered to a booking flow
export const SLOTS: AvailabilitySlot[] = (() => {
  const slots: AvailabilitySlot[] = [];
  const base = new Date("2026-06-05T13:00:00Z");
  for (let d = 0; d < 7; d++) {
    for (const hour of [10, 12, 14, 16, 18]) {
      const start = new Date(base);
      start.setUTCDate(start.getUTCDate() + d);
      start.setUTCHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setUTCHours(end.getUTCHours() + 1);
      slots.push({
        id: `slot_${d}_${hour}`,
        staff_id: hour % 4 === 0 ? "stf_pinner_1" : "stf_pinner_2",
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        block_type: "available",
      });
    }
  }
  return slots;
})();

// ----- Leads -----
export const LEADS: Lead[] = [
  { id: "lead_1", phone: "+15555550181", zip: "11215", source: "instagram", utm_source: "ig", utm_campaign: "spring_hem", status: "new", first_touch_at: "2026-06-01T15:00:00Z", in_service_area: true },
  { id: "lead_2", phone: "+15555550172", zip: "10024", source: "google", utm_source: "google", utm_campaign: "tailor_near_me", status: "contacted", first_touch_at: "2026-05-31T11:00:00Z", in_service_area: true },
  { id: "lead_3", phone: "+15555550193", zip: "90210", source: "referral", status: "waitlisted", first_touch_at: "2026-05-30T16:00:00Z", in_service_area: false },
  { id: "lead_4", phone: "+15555550204", zip: "94110", source: "tiktok", utm_source: "tiktok", utm_campaign: "transform", status: "converted", first_touch_at: "2026-05-21T20:00:00Z", in_service_area: true },
  { id: "lead_5", phone: "+15555550211", zip: "11211", source: "nextdoor", status: "new", first_touch_at: "2026-06-02T18:30:00Z", in_service_area: true },
];

// ----- Promotions -----
export const PROMOTIONS: Promotion[] = [
  { id: "prm_welcome", method: "code", code: "WELCOME15", name: "First-time 15% off", value_type: "percentage", value: 15, status: "active", max_uses: undefined, used: 482 },
  { id: "prm_member50", method: "automatic", name: "Member bundle (auto 5%)", value_type: "percentage", value: 5, status: "active", used: 1240 },
  { id: "prm_summer", method: "code", code: "SUMMER26", name: "Summer hem promo", value_type: "fixed_amount", value: 10, status: "scheduled", used: 0 },
  { id: "prm_referral", method: "automatic", name: "Referral credit ($25)", value_type: "fixed_amount", value: 25, status: "active", used: 312 },
];

// ----- Earnings & payouts -----
export const TAILOR_EARNINGS: TailorEarning[] = [
  { id: "te_1", tailor_id: "stf_tailor_1", tailor_name: "Elena Vasquez", adjustment_id: "adj_grm_3a_svc_hem_jeans", amount: 28, status: "paid", payout_id: "po_1" },
  { id: "te_2", tailor_id: "stf_tailor_1", tailor_name: "Elena Vasquez", adjustment_id: "adj_grm_1a_svc_hem_pants", amount: 11, status: "approved" },
  { id: "te_3", tailor_id: "stf_tailor_1", tailor_name: "Elena Vasquez", adjustment_id: "adj_grm_1a_svc_taper_pants", amount: 19, status: "approved" },
  { id: "te_4", tailor_id: "stf_tailor_2", tailor_name: "Hiroshi Tanaka", adjustment_id: "adj_grm_1b_svc_jacket_take_in", amount: 32, status: "pending" },
  { id: "te_5", tailor_id: "stf_tailor_2", tailor_name: "Hiroshi Tanaka", adjustment_id: "adj_grm_1b_svc_shorten_sleeves_jacket", amount: 28, status: "pending" },
  { id: "te_6", tailor_id: "stf_tailor_3", tailor_name: "Priya Singh", adjustment_id: "adj_grm_6a_svc_take_in_shirt", amount: 16, status: "approved" },
  { id: "te_7", tailor_id: "stf_tailor_4", tailor_name: "Marcus King", adjustment_id: "adj_grm_5a_svc_hem_pants", amount: 22, status: "approved" },
];

export const PAYOUTS: Payout[] = [
  { id: "po_1", tailor_id: "stf_tailor_1", tailor_name: "Elena Vasquez", period_start: "2026-04-08T00:00:00Z", period_end: "2026-04-14T23:59:59Z", net_amount: 412.5, status: "paid", paid_at: "2026-04-15T12:00:00Z" },
  { id: "po_2", tailor_id: "stf_tailor_1", tailor_name: "Elena Vasquez", period_start: "2026-04-15T00:00:00Z", period_end: "2026-04-21T23:59:59Z", net_amount: 388, status: "paid", paid_at: "2026-04-22T12:00:00Z" },
  { id: "po_3", tailor_id: "stf_tailor_2", tailor_name: "Hiroshi Tanaka", period_start: "2026-04-15T00:00:00Z", period_end: "2026-04-28T23:59:59Z", net_amount: 950, status: "paid", paid_at: "2026-04-29T12:00:00Z" },
  { id: "po_4", tailor_id: "stf_tailor_1", tailor_name: "Elena Vasquez", period_start: "2026-05-27T00:00:00Z", period_end: "2026-06-02T23:59:59Z", net_amount: 256.75, status: "pending" },
];

// Feedback
export const FEEDBACK: Feedback[] = [
  { id: "fb_1", subject_type: "appointment", subject_id: "apt_1", client_id: ME.id, rating: 5, sentiment: "positive", comment: "Maya was a delight, very precise.", tags: ["on_time", "kind", "expert"], created_at: "2026-05-20T18:00:00Z" },
  { id: "fb_2", subject_type: "adjustment", subject_id: "adj_grm_3a_svc_hem_jeans", client_id: ME.id, rating: 5, sentiment: "positive", comment: "Hems are perfect.", tags: ["great_fit", "fast_turnaround"], created_at: "2026-04-19T20:00:00Z" },
];

// ---- helpers ----
export function getOrder(id: string) {
  return ALL_ORDERS.find((o) => o.id === id);
}
export function getMyOrder(id: string) {
  return MY_ORDERS.find((o) => o.id === id);
}
export function getClient(id: string) {
  return CLIENTS.find((c) => c.id === id);
}
