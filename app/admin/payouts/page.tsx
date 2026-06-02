import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYOUTS, TAILOR_EARNINGS } from "@/lib/mock/seed";
import { formatDate, formatMoney } from "@/lib/utils";

export default function PayoutsPage() {
  const pendingEarnings = TAILOR_EARNINGS.filter((e) => e.status === "approved");
  const pendingAmount = pendingEarnings.reduce((a, e) => a + e.amount, 0);

  // Group by tailor
  const byTailor = new Map<string, { name: string; total: number; earnings: typeof pendingEarnings }>();
  for (const e of pendingEarnings) {
    if (!byTailor.has(e.tailor_id)) byTailor.set(e.tailor_id, { name: e.tailor_name, total: 0, earnings: [] });
    const g = byTailor.get(e.tailor_id)!;
    g.total += e.amount;
    g.earnings.push(e);
  }

  return (
    <AdminPage>
      <AdminPageHeader title="Payouts" subtitle={`Ready to pay out: ${formatMoney(pendingAmount)} across ${byTailor.size} tailors.`} action={<Button variant="brand">Run payouts now</Button>} />

      <h2 className="mb-3 font-display text-lg font-semibold">Approved & unpaid earnings</h2>
      <div className="space-y-3 mb-10">
        {Array.from(byTailor.entries()).map(([id, group]) => (
          <Card key={id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{group.name}</div>
                <div className="text-xs text-ink-muted">{group.earnings.length} earning{group.earnings.length === 1 ? "" : "s"}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-semibold">{formatMoney(group.total)}</div>
                <Button variant="outline" size="sm">Mark approved</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold">Payout history</h2>
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-2.5 font-medium">Tailor</th>
              <th className="px-5 py-2.5 font-medium">Period</th>
              <th className="px-5 py-2.5 font-medium text-right">Amount</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">Paid at</th>
            </tr>
          </thead>
          <tbody>
            {PAYOUTS.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-5 py-3">{p.tailor_name}</td>
                <td className="px-5 py-3 text-xs text-ink-muted">{formatDate(p.period_start)} – {formatDate(p.period_end)}</td>
                <td className="px-5 py-3 text-right font-medium">{formatMoney(p.net_amount)}</td>
                <td className="px-5 py-3"><Badge tone={p.status === "paid" ? "success" : p.status === "pending" ? "warn" : "info"}>{p.status}</Badge></td>
                <td className="px-5 py-3 text-xs text-ink-muted">{p.paid_at ? formatDate(p.paid_at) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminPage>
  );
}
