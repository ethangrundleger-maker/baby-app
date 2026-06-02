import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ALL_ORDERS, STAFF } from "@/lib/mock/seed";
import { formatMoney } from "@/lib/utils";

export default function TailorQueuePage() {
  // Group garments by tailor
  const byTailor = new Map<string, { name: string; items: any[] }>();
  for (const o of ALL_ORDERS) {
    for (const g of o.garments) {
      if (!g.tailor_id) continue;
      const key = g.tailor_id;
      if (!byTailor.has(key)) byTailor.set(key, { name: g.tailor_name ?? "Unknown", items: [] });
      byTailor.get(key)!.items.push({ g, o });
    }
  }
  return (
    <AdminPage>
      <AdminPageHeader title="Tailor queue" subtitle="What every tailor is currently working on, with capability-aware load." />
      <div className="space-y-6">
        {Array.from(byTailor.entries()).map(([tailorId, { name, items }]) => {
          const tailor = STAFF.find((s) => s.id === tailorId);
          const totalMinutes = items.reduce((a, { g }) => a + g.estimated_minutes, 0);
          const totalEarnings = items.reduce((a, { g }) => a + g.adjustments.reduce((s: number, ad: any) => s + ad.payout_amount, 0), 0);
          return (
            <Card key={tailorId} className="overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-line bg-bg-alt px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700">{name[0]}</div>
                  <div>
                    <div className="font-display text-base font-semibold">{name}</div>
                    <div className="text-xs text-ink-muted">efficiency {tailor?.efficiency_rating.toFixed(2)}× · payout {tailor?.payout_cadence} · {tailor?.capabilities?.length ?? 0} capabilities</div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">{items.length} garments · {Math.round(totalMinutes / 60)}h queued</div>
                  <div className="text-xs text-ink-muted">earning {formatMoney(totalEarnings)}</div>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="px-5 py-2 font-medium">Order</th>
                    <th className="px-5 py-2 font-medium">Garment</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                    <th className="px-5 py-2 font-medium">Adjustments</th>
                    <th className="px-5 py-2 font-medium text-right">Time</th>
                    <th className="px-5 py-2 font-medium text-right">Earning</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(({ g, o }) => (
                    <tr key={g.id} className="border-t border-line">
                      <td className="px-5 py-3 font-mono text-xs">#{o.id.slice(-4)}</td>
                      <td className="px-5 py-3"><div className="font-medium">{g.type}</div><div className="text-xs text-ink-muted">{o.client_name}</div></td>
                      <td className="px-5 py-3"><StatusBadge status={g.status} /></td>
                      <td className="px-5 py-3 text-xs">{g.adjustments.map((a: any) => a.service_name).join(", ")}</td>
                      <td className="px-5 py-3 text-right text-ink-muted">{g.estimated_minutes}m</td>
                      <td className="px-5 py-3 text-right font-medium">{formatMoney(g.adjustments.reduce((s: number, a: any) => s + a.payout_amount, 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          );
        })}
      </div>
    </AdminPage>
  );
}
