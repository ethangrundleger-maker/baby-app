import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card, CardBody } from "@/components/ui/card";
import { ALL_ORDERS, TAILOR_EARNINGS, LEADS, PAYOUTS } from "@/lib/mock/seed";
import { formatMoney } from "@/lib/utils";

export default function ReportsPage() {
  const totalRevenue = ALL_ORDERS.reduce((a, o) => a + o.current_total, 0);
  const totalEarnings = TAILOR_EARNINGS.reduce((a, e) => a + e.amount, 0);
  const margin = totalRevenue - totalEarnings;
  const marginPct = totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0;
  const leadConvRate = (LEADS.filter((l) => l.status === "converted").length / LEADS.length) * 100;
  const avgOrderValue = totalRevenue / ALL_ORDERS.length;

  // Status mix
  const statusMix: Record<string, number> = {};
  for (const o of ALL_ORDERS) statusMix[o.status] = (statusMix[o.status] ?? 0) + 1;

  return (
    <AdminPage>
      <AdminPageHeader title="Reports" subtitle="Unit economics & operational metrics." />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={formatMoney(totalRevenue)} sub="all-time" />
        <Stat label="Tailor cost" value={formatMoney(totalEarnings)} sub="paid + pending" />
        <Stat label="Gross margin" value={`${marginPct.toFixed(1)}%`} sub={formatMoney(margin)} />
        <Stat label="AOV" value={formatMoney(avgOrderValue)} sub={`${ALL_ORDERS.length} orders`} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h3 className="font-display text-lg font-semibold">Order status mix</h3>
            <ul className="mt-4 space-y-2">
              {Object.entries(statusMix).map(([s, count]) => (
                <li key={s} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{s.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-bg-alt">
                      <div className="h-full bg-brand-500" style={{ width: `${(count / ALL_ORDERS.length) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-xs text-ink-muted">{count}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="font-display text-lg font-semibold">Lead funnel</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <Funnel label="Leads" count={LEADS.length} pct={100} />
              <Funnel label="In service area" count={LEADS.filter((l) => l.in_service_area).length} pct={(LEADS.filter((l) => l.in_service_area).length / LEADS.length) * 100} />
              <Funnel label="Contacted" count={LEADS.filter((l) => l.status === "contacted" || l.status === "converted").length} pct={((LEADS.filter((l) => l.status === "contacted" || l.status === "converted").length) / LEADS.length) * 100} />
              <Funnel label="Converted" count={LEADS.filter((l) => l.status === "converted").length} pct={leadConvRate} />
            </ul>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardBody>
            <h3 className="font-display text-lg font-semibold">Payouts</h3>
            <p className="mt-1 text-sm text-ink-muted">Total paid out: {formatMoney(PAYOUTS.reduce((a, p) => a + (p.status === "paid" ? p.net_amount : 0), 0))}. Pending: {formatMoney(PAYOUTS.reduce((a, p) => a + (p.status !== "paid" ? p.net_amount : 0), 0))}.</p>
          </CardBody>
        </Card>
      </section>
    </AdminPage>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="text-xs uppercase tracking-wider text-ink-muted">{label}</div>
        <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
        {sub && <div className="mt-1 text-xs text-ink-muted">{sub}</div>}
      </CardBody>
    </Card>
  );
}

function Funnel({ label, count, pct }: { label: string; count: number; pct: number }) {
  return (
    <li>
      <div className="flex items-baseline justify-between">
        <span>{label}</span>
        <span className="font-medium">{count} <span className="text-xs text-ink-muted">({pct.toFixed(0)}%)</span></span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg-alt">
        <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}
