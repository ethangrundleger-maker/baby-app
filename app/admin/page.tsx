import Link from "next/link";
import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card, CardBody } from "@/components/ui/card";
import { ALL_ORDERS, LEADS, TAILOR_EARNINGS, APPOINTMENTS, STAFF } from "@/lib/mock/seed";
import { formatMoney } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpRight, Banknote, Package, ScrollText, UserCircle, Users } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const open = ALL_ORDERS.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const revenueWTD = ALL_ORDERS.reduce((a, o) => a + o.current_total, 0);
  const pendingPayouts = TAILOR_EARNINGS.filter((e) => e.status !== "paid").reduce((a, e) => a + e.amount, 0);
  const newLeads = LEADS.filter((l) => l.status === "new").length;
  const tailorsActive = STAFF.filter((s) => s.role === "tailor" && s.active).length;
  const upcoming = APPOINTMENTS.filter((a) => new Date(a.scheduled_at).getTime() > Date.now()).slice(0, 4);
  const needsApproval = ALL_ORDERS.filter((o) => o.quote_status === "pending_approval");

  return (
    <AdminPage>
      <AdminPageHeader title="Operations dashboard" subtitle="What's happening across hubs right now." />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue (week)" value={formatMoney(revenueWTD)} delta="+12%" trend="up" icon={<Banknote className="h-4 w-4" />} />
        <Stat label="Open orders" value={String(open.length)} delta="+4 today" trend="up" icon={<Package className="h-4 w-4" />} />
        <Stat label="Pending payouts" value={formatMoney(pendingPayouts)} delta={`${tailorsActive} tailors`} icon={<Banknote className="h-4 w-4" />} />
        <Stat label="New leads" value={String(newLeads)} delta="last 24h" icon={<UserCircle className="h-4 w-4" />} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Open orders</h2>
              <Link href="/admin/orders" className="text-xs font-medium text-brand-600 hover:text-brand-700">View board →</Link>
            </div>
            <table className="mt-4 w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-ink-muted">
                <tr><th className="pb-2 font-medium">Order</th><th className="pb-2 font-medium">Client</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium text-right">Total</th></tr>
              </thead>
              <tbody>
                {open.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="py-2.5"><Link href={`/admin/orders/${o.id}`} className="font-mono text-xs hover:underline">#{o.id.slice(-4)}</Link></td>
                    <td className="py-2.5">{o.client_name}</td>
                    <td className="py-2.5"><StatusBadge status={o.status} /></td>
                    <td className="py-2.5 text-right font-medium">{formatMoney(o.current_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Needs you</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {needsApproval.map((o) => (
                <li key={o.id} className="rounded-md bg-amber-50 p-3 text-amber-900">
                  <div className="font-medium">Quote awaiting approval</div>
                  <Link href={`/admin/orders/${o.id}`} className="text-xs hover:underline">#{o.id.slice(-4)} · {o.client_name} · {formatMoney(o.current_total)}</Link>
                </li>
              ))}
              <li className="rounded-md bg-bg-alt p-3">
                <div className="font-medium">Payout run ready</div>
                <Link href="/admin/payouts" className="text-xs text-ink-muted hover:underline">{formatMoney(pendingPayouts)} · {TAILOR_EARNINGS.filter((e) => e.status === "approved").length} earnings approved</Link>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Upcoming pinnings</h2>
              <Link href="/admin/calendar" className="text-xs font-medium text-brand-600 hover:text-brand-700">Calendar →</Link>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-medium">{a.host_client_name}</div>
                    <div className="text-xs text-ink-muted">{a.pinner_name} · {a.address}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-ink-muted">{new Date(a.scheduled_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>
                    <div className="font-medium">{new Date(a.scheduled_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Recent leads</h2>
              <Link href="/admin/leads" className="text-xs font-medium text-brand-600 hover:text-brand-700">All leads →</Link>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {LEADS.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-mono text-xs text-ink-muted">{l.phone}</div>
                    <div className="text-xs text-ink-muted">{l.zip} · {l.source}</div>
                  </div>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </AdminPage>
  );
}

function Stat({ label, value, delta, trend, icon }: { label: string; value: string; delta?: string; trend?: "up" | "down"; icon: React.ReactNode }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="text-xs uppercase tracking-wider text-ink-muted">{label}</div>
          <div className="text-ink-muted">{icon}</div>
        </div>
        <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
        {delta && (
          <div className={`mt-2 inline-flex items-center gap-1 text-xs ${trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-ink-muted"}`}>
            {trend === "up" && <ArrowUp className="h-3 w-3" />}
            {trend === "down" && <ArrowDown className="h-3 w-3" />}
            {delta}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
