import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATALOG } from "@/lib/mock/catalog";
import { STAFF, TAILOR_EARNINGS } from "@/lib/mock/seed";
import { formatMoney } from "@/lib/utils";

export default function TailorsPage() {
  const tailors = STAFF.filter((s) => s.role === "tailor");
  return (
    <AdminPage>
      <AdminPageHeader title="Tailors" subtitle="Capability matrix, utilization, and earnings." />
      <div className="space-y-4">
        {tailors.map((t) => {
          const earnings = TAILOR_EARNINGS.filter((e) => e.tailor_id === t.id);
          const earningsTotal = earnings.reduce((a, e) => a + e.amount, 0);
          return (
            <Card key={t.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700">{t.name[0]}</div>
                  <div>
                    <div className="font-display text-base font-semibold">{t.name}</div>
                    <div className="text-xs text-ink-muted">{t.hub_id.replace("hub_", "").toUpperCase()} · efficiency {t.efficiency_rating.toFixed(2)}× · pays {t.payout_cadence}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-semibold">{formatMoney(earningsTotal)}</div>
                  <div className="text-xs text-ink-muted">all-time earnings</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">Capabilities ({t.capabilities?.length ?? 0})</div>
                <div className="flex flex-wrap gap-1.5">
                  {t.capabilities?.map((sid) => {
                    const svc = CATALOG.find((s) => s.id === sid);
                    return svc ? <Badge key={sid} tone="neutral">{svc.name}</Badge> : null;
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AdminPage>
  );
}
