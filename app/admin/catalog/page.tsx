import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CATALOG } from "@/lib/mock/catalog";
import { formatMoney } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function CatalogPage() {
  return (
    <AdminPage>
      <AdminPageHeader title="Service catalog" subtitle="Default prices, payouts, and standard time per alteration." action={<Button variant="brand"><Plus className="h-4 w-4" /> New service</Button>} />
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-2.5 font-medium">Service</th>
              <th className="px-5 py-2.5 font-medium">Category</th>
              <th className="px-5 py-2.5 font-medium text-right">Default price</th>
              <th className="px-5 py-2.5 font-medium text-right">Payout</th>
              <th className="px-5 py-2.5 font-medium text-right">Margin</th>
              <th className="px-5 py-2.5 font-medium text-right">Std. time</th>
            </tr>
          </thead>
          <tbody>
            {CATALOG.map((s) => {
              const margin = ((s.default_price - s.payout_rate) / s.default_price) * 100;
              return (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-5 py-3"><div className="font-medium">{s.name}</div><div className="text-xs text-ink-muted">{s.description}</div></td>
                  <td className="px-5 py-3 capitalize text-ink-muted">{s.category}</td>
                  <td className="px-5 py-3 text-right">{formatMoney(s.default_price)}</td>
                  <td className="px-5 py-3 text-right text-ink-muted">{formatMoney(s.payout_rate)}</td>
                  <td className="px-5 py-3 text-right font-medium">{margin.toFixed(0)}%</td>
                  <td className="px-5 py-3 text-right text-ink-muted">{s.standard_minutes}m</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </AdminPage>
  );
}
