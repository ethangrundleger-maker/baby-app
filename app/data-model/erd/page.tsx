import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";

export const metadata = { title: "Re:Fit — Entity Relationship Diagram" };

// ─── table box definition ────────────────────────────────────────
type TableBox = {
  name: string;
  color: "brand" | "teal" | "violet" | "rose" | "amber" | "emerald" | "sky" | "slate";
  cols: { name: string; pk?: boolean; fk?: string }[];
};

const COLOR = {
  brand:   { bg: "bg-brand-50",  border: "border-brand-200",  header: "bg-brand-100  text-brand-900",  tag: "bg-brand-200  text-brand-800" },
  teal:    { bg: "bg-teal-50",   border: "border-teal-200",   header: "bg-teal-100   text-teal-900",   tag: "bg-teal-200   text-teal-800" },
  violet:  { bg: "bg-violet-50", border: "border-violet-200", header: "bg-violet-100 text-violet-900", tag: "bg-violet-200 text-violet-800" },
  rose:    { bg: "bg-rose-50",   border: "border-rose-200",   header: "bg-rose-100   text-rose-900",   tag: "bg-rose-200   text-rose-800" },
  amber:   { bg: "bg-amber-50",  border: "border-amber-200",  header: "bg-amber-100  text-amber-900",  tag: "bg-amber-200  text-amber-800" },
  emerald: { bg: "bg-emerald-50",border: "border-emerald-200",header: "bg-emerald-100 text-emerald-900",tag:"bg-emerald-200 text-emerald-800"},
  sky:     { bg: "bg-sky-50",    border: "border-sky-200",    header: "bg-sky-100    text-sky-900",    tag: "bg-sky-200    text-sky-800" },
  slate:   { bg: "bg-slate-50",  border: "border-slate-200",  header: "bg-slate-100  text-slate-700",  tag: "bg-slate-200  text-slate-700" },
};

function Table({ box }: { box: TableBox }) {
  const c = COLOR[box.color];
  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} overflow-hidden text-xs min-w-[160px]`}>
      <div className={`px-3 py-1.5 font-mono font-semibold text-[11px] ${c.header}`}>{box.name}</div>
      <ul className="divide-y divide-white/60">
        {box.cols.map((col) => (
          <li key={col.name} className="flex items-center gap-1.5 px-3 py-1">
            {col.pk && <span className={`shrink-0 rounded px-1 py-px text-[9px] font-bold uppercase tracking-wide ${c.tag}`}>PK</span>}
            {col.fk && <span className={`shrink-0 rounded px-1 py-px text-[9px] font-bold uppercase tracking-wide ${c.tag} opacity-70`}>FK</span>}
            <span className={col.pk ? "font-semibold text-ink" : "text-ink-muted"}>{col.name}</span>
            {col.fk && <span className="ml-auto text-[9px] text-ink-subtle truncate">→ {col.fk}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 text-ink-subtle px-1">
      <ArrowRight className="h-4 w-4" />
      {label && <span className="text-[9px] text-ink-subtle whitespace-nowrap">{label}</span>}
    </div>
  );
}

function DownArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-ink-subtle py-0.5">
      <div className="h-4 w-px bg-line-strong" />
      <div className="h-2 w-px bg-line-strong" />
      {label && <span className="text-[9px] text-ink-subtle">{label}</span>}
    </div>
  );
}

// ─── domain map data ─────────────────────────────────────────────
const DOMAINS: { name: string; color: TableBox["color"]; tables: string[] }[] = [
  { name: "Geography", color: "sky",     tables: ["operating_hubs","service_areas","service_area_zips"] },
  { name: "Customers", color: "brand",   tables: ["leads","clients","addresses","measurements","client_photos"] },
  { name: "Staff & Capabilities", color: "teal", tables: ["staff","tailor_services"] },
  { name: "Services & Pricing",   color: "amber",  tables: ["service_catalog","hub_service_prices"] },
  { name: "Scheduling",           color: "violet", tables: ["availability_slots","appointments"] },
  { name: "Orders & Work",        color: "rose",   tables: ["orders","garments","pinning_measurements","adjustments","reworks"] },
  { name: "Logistics",            color: "slate",  tables: ["deliveries"] },
  { name: "Billing & Money",      color: "emerald",tables: ["invoices","invoice_line_items","payments","refunds","order_revisions","credits","payment_methods"] },
  { name: "Tailor Payments",      color: "teal",   tables: ["tailor_earnings","payouts"] },
  { name: "Memberships",          color: "violet", tables: ["membership_plans","customer_memberships"] },
  { name: "Promotions & Referrals",color:"amber",  tables: ["promotions","promotion_items","promotion_email_locks","promo_redemptions","referrals"] },
  { name: "Quality & Feedback",   color: "brand",  tables: ["feedback","feedback_tags","feedback_tag_selections"] },
  { name: "System",               color: "slate",  tables: ["status_events"] },
];

// ─── spine table definitions ──────────────────────────────────────
const T_LEADS: TableBox = { name: "leads", color: "brand", cols: [
  { name: "id", pk: true },
  { name: "phone" },
  { name: "zip" },
  { name: "source" },
  { name: "status" },
]};
const T_CLIENTS: TableBox = { name: "clients", color: "brand", cols: [
  { name: "id", pk: true },
  { name: "lead_id", fk: "leads" },
  { name: "auth_user_id" },
  { name: "name" },
  { name: "phone" },
  { name: "hub_id", fk: "operating_hubs" },
]};
const T_ORDERS: TableBox = { name: "orders", color: "rose", cols: [
  { name: "id", pk: true },
  { name: "client_id", fk: "clients" },
  { name: "appointment_id", fk: "appointments" },
  { name: "type" },
  { name: "status" },
  { name: "estimated_total" },
  { name: "current_total" },
]};
const T_GARMENTS: TableBox = { name: "garments", color: "rose", cols: [
  { name: "id", pk: true },
  { name: "order_id", fk: "orders" },
  { name: "tailor_id", fk: "staff" },
  { name: "type" },
  { name: "status" },
]};
const T_ADJUSTMENTS: TableBox = { name: "adjustments", color: "rose", cols: [
  { name: "id", pk: true },
  { name: "garment_id", fk: "garments" },
  { name: "service_id", fk: "service_catalog" },
  { name: "qty" },
  { name: "unit_price" },
  { name: "amount" },
  { name: "payout_amount" },
  { name: "status" },
]};
const T_INVOICE_LINES: TableBox = { name: "invoice_line_items", color: "emerald", cols: [
  { name: "id", pk: true },
  { name: "invoice_id", fk: "invoices" },
  { name: "item_type" },
  { name: "description" },
  { name: "amount" },
]};
const T_INVOICES: TableBox = { name: "invoices", color: "emerald", cols: [
  { name: "id", pk: true },
  { name: "order_id", fk: "orders" },
  { name: "client_id", fk: "clients" },
  { name: "status" },
  { name: "subtotal" },
  { name: "discount_total" },
  { name: "credit_applied" },
  { name: "total" },
]};
const T_PAYMENTS: TableBox = { name: "payments", color: "emerald", cols: [
  { name: "id", pk: true },
  { name: "invoice_id", fk: "invoices" },
  { name: "charge_type" },
  { name: "amount" },
  { name: "status" },
]};
const T_REFUNDS: TableBox = { name: "refunds", color: "emerald", cols: [
  { name: "id", pk: true },
  { name: "invoice_id", fk: "invoices" },
  { name: "amount" },
  { name: "reason" },
]};
const T_TAILOR_EARN: TableBox = { name: "tailor_earnings", color: "teal", cols: [
  { name: "id", pk: true },
  { name: "tailor_id", fk: "staff" },
  { name: "adjustment_id", fk: "adjustments" },
  { name: "amount" },
  { name: "status" },
]};
const T_PAYOUTS: TableBox = { name: "payouts", color: "teal", cols: [
  { name: "id", pk: true },
  { name: "tailor_id", fk: "staff" },
  { name: "net_amount" },
  { name: "status" },
  { name: "paid_at" },
]};
const T_ORDER_REVISIONS: TableBox = { name: "order_revisions", color: "emerald", cols: [
  { name: "id", pk: true },
  { name: "order_id", fk: "orders" },
  { name: "reason" },
  { name: "previous_total" },
  { name: "new_total" },
  { name: "delta" },
  { name: "settlement" },
]};
const T_STAFF: TableBox = { name: "staff", color: "teal", cols: [
  { name: "id", pk: true },
  { name: "role" },
  { name: "name" },
  { name: "hub_id", fk: "operating_hubs" },
]};
const T_APPOINTMENTS: TableBox = { name: "appointments", color: "violet", cols: [
  { name: "id", pk: true },
  { name: "pinner_id", fk: "staff" },
  { name: "host_client_id", fk: "clients" },
  { name: "type" },
  { name: "scheduled_at" },
  { name: "status" },
]};
const T_DELIVERIES: TableBox = { name: "deliveries", color: "slate", cols: [
  { name: "id", pk: true },
  { name: "order_id", fk: "orders" },
  { name: "leg_type" },
  { name: "status" },
]};
const T_CREDITS: TableBox = { name: "credits", color: "emerald", cols: [
  { name: "id", pk: true },
  { name: "client_id", fk: "clients" },
  { name: "amount" },
  { name: "type" },
]};
const T_MEMBERSHIPS: TableBox = { name: "customer_memberships", color: "violet", cols: [
  { name: "id", pk: true },
  { name: "client_id", fk: "clients" },
  { name: "plan_id", fk: "membership_plans" },
  { name: "status" },
  { name: "renews_at" },
]};

export default function ErdPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-bg-card">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex items-center gap-3">
            <Link href="/data-model" className="text-xs font-medium uppercase tracking-widest text-brand-600 hover:text-brand-700">← Data model</Link>
            <span className="text-line-strong">/</span>
            <span className="text-xs font-medium uppercase tracking-widest text-ink-muted">ERD</span>
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">Entity Relationship Diagram</h1>
          <p className="mt-2 text-base text-ink-muted max-w-2xl">How Re:Fit's 40 tables connect. The spine runs left to right — each column shows a foreign-key relationship.</p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {(["brand","rose","emerald","teal","violet","amber","sky","slate"] as const).map((c) => (
              <span key={c} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${COLOR[c].border} ${COLOR[c].bg} ${COLOR[c].header}`}>
                <span className={`h-2 w-2 rounded-full ${COLOR[c].tag}`} />
                {{ brand:"Customers", rose:"Orders & Work", emerald:"Billing & Money", teal:"Staff & Payouts", violet:"Scheduling & Plans", amber:"Services & Promos", sky:"Geography", slate:"Logistics / System" }[c]}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 space-y-12">

        {/* ── SPINE ── */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-5">The transaction spine</h2>

          {/* Row 1: main flow */}
          <div className="overflow-x-auto pb-4">
            <div className="inline-flex items-start gap-1 min-w-max">
              <Table box={T_LEADS} />
              <Arrow label="converts to" />
              <Table box={T_CLIENTS} />
              <Arrow label="places" />
              <Table box={T_ORDERS} />
              <Arrow label="contains" />
              <Table box={T_GARMENTS} />
              <Arrow label="has" />
              <Table box={T_ADJUSTMENTS} />
            </div>
          </div>

          {/* Row 2: billing + earnings branch */}
          <div className="mt-2 overflow-x-auto pb-4">
            <div className="inline-flex items-start gap-1 min-w-max">
              {/* Offset to align under orders */}
              <div style={{ width: 160 + 4 + 202 + 4 }} className="shrink-0" />
              <div className="flex flex-col items-center gap-1">
                <DownArrow label="billed via" />
                <Table box={T_INVOICES} />
                <DownArrow />
                <div className="flex gap-1">
                  <Table box={T_PAYMENTS} />
                  <Table box={T_REFUNDS} />
                </div>
              </div>
              <div style={{ width: 4 + 170 + 4 }} className="shrink-0" />
              <div className="flex flex-col items-center gap-1">
                <DownArrow label="generates" />
                <Table box={T_INVOICE_LINES} />
              </div>
              <Arrow label="drives" />
              <div className="flex flex-col items-center gap-1">
                <Table box={T_TAILOR_EARN} />
                <DownArrow label="batched into" />
                <Table box={T_PAYOUTS} />
              </div>
            </div>
          </div>

          {/* Row 3: supporting tables */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-line bg-bg-card p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-muted">Order flex (billing model)</div>
              <Table box={T_ORDER_REVISIONS} />
            </div>
            <div className="rounded-lg border border-line bg-bg-card p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-muted">Pinning visits</div>
              <Table box={T_APPOINTMENTS} />
            </div>
            <div className="rounded-lg border border-line bg-bg-card p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-muted">Logistics</div>
              <Table box={T_DELIVERIES} />
            </div>
            <div className="rounded-lg border border-line bg-bg-card p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-muted">Staff (tailors / pinners)</div>
              <Table box={T_STAFF} />
            </div>
            <div className="rounded-lg border border-line bg-bg-card p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-muted">Credits ledger</div>
              <Table box={T_CREDITS} />
            </div>
            <div className="rounded-lg border border-line bg-bg-card p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-muted">Memberships</div>
              <Table box={T_MEMBERSHIPS} />
            </div>
          </div>
        </section>

        {/* ── DOMAIN MAP ── */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-2">All 40 tables by domain</h2>
          <p className="text-sm text-ink-muted mb-6">Every table lives in exactly one domain. Color matches the spine above.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DOMAINS.map((d) => {
              const c = COLOR[d.color];
              return (
                <div key={d.name} className={`rounded-lg border ${c.border} ${c.bg} overflow-hidden`}>
                  <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${c.header}`}>{d.name}</div>
                  <ul className="divide-y divide-white/60 px-4 py-1">
                    {d.tables.map((t) => (
                      <li key={t} className="py-1.5">
                        <Link href={`/data-model#tbl-${t}`} className="font-mono text-xs text-ink hover:text-brand-600 hover:underline">
                          {t}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FK RELATIONSHIPS ── */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-5">Key foreign key relationships</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { from: "clients.lead_id", to: "leads.id", label: "Lead becomes client on phone-verified signup" },
              { from: "orders.client_id", to: "clients.id", label: "Every order is owned by exactly one client" },
              { from: "orders.appointment_id", to: "appointments.id", label: "Book-a-pinner orders link to the visit" },
              { from: "garments.order_id", to: "orders.id", label: "Garments belong to one order" },
              { from: "garments.tailor_id", to: "staff.id", label: "Assignment locked by capability check trigger" },
              { from: "adjustments.garment_id", to: "garments.id", label: "One piece of work on one garment" },
              { from: "adjustments.service_id", to: "service_catalog.id", label: "Priced from the catalog" },
              { from: "invoice_line_items.invoice_id", to: "invoices.id", label: "Invoice total derives from line items" },
              { from: "tailor_earnings.adjustment_id", to: "adjustments.id", label: "True per-adjustment profit visibility" },
              { from: "tailor_earnings.payout_id", to: "payouts.id", label: "Earnings batched into payout runs" },
              { from: "order_revisions.order_id", to: "orders.id", label: "Dated audit trail; delta = new − previous" },
              { from: "payments.invoice_id", to: "invoices.id", label: "Initial / incremental / balance charges" },
              { from: "refunds.invoice_id", to: "invoices.id", label: "Scope-decrease refunds" },
              { from: "credits.client_id", to: "clients.id", label: "Referral rewards, refund credits, goodwill" },
              { from: "customer_memberships.client_id", to: "clients.id", label: "One active plan per client" },
              { from: "promo_redemptions.order_id", to: "orders.id", label: "One redemption log row per use" },
              { from: "deliveries.order_id", to: "orders.id", label: "Pickup, to-tailor, between tailors, return" },
              { from: "feedback.subject_id", to: "appointments / adjustments", label: "Rates pinner (visit) or tailor (work)" },
              { from: "hub_service_prices.hub_id", to: "operating_hubs.id", label: "Per-market price overrides" },
              { from: "service_area_zips.service_area_id", to: "service_areas.id", label: "ZIP → area → hub routing" },
            ].map((fk) => (
              <div key={fk.from} className="rounded-lg border border-line bg-bg-card p-3 text-xs">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-brand-700 font-semibold">{fk.from}</span>
                  <ArrowRight className="h-3 w-3 text-ink-subtle shrink-0" />
                  <span className="text-ink-muted">{fk.to}</span>
                </div>
                <p className="mt-1 text-ink-subtle leading-snug">{fk.label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-line pt-6 text-center text-sm text-ink-muted">
          <Link href="/data-model" className="font-medium text-brand-600 hover:text-brand-700">← Full column-level reference</Link>
          <span className="mx-3 text-line-strong">·</span>
          Source of truth: <code className="rounded bg-bg-alt px-1.5 py-0.5 text-xs">docs/schema.sql</code>
        </div>
      </div>
    </div>
  );
}
