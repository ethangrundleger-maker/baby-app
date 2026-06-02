import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROMOTIONS } from "@/lib/mock/seed";
import { Plus } from "lucide-react";

export default function PromotionsPage() {
  return (
    <AdminPage>
      <AdminPageHeader title="Promotions" subtitle="Codes & automatic discounts, Shopify-style." action={<Button variant="brand"><Plus className="h-4 w-4" /> New promotion</Button>} />
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-2.5 font-medium">Name</th>
              <th className="px-5 py-2.5 font-medium">Method</th>
              <th className="px-5 py-2.5 font-medium">Code</th>
              <th className="px-5 py-2.5 font-medium">Value</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium text-right">Used</th>
            </tr>
          </thead>
          <tbody>
            {PROMOTIONS.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-5 py-3 font-medium">{p.name}</td>
                <td className="px-5 py-3 capitalize text-ink-muted">{p.method}</td>
                <td className="px-5 py-3 font-mono text-xs">{p.code ?? "—"}</td>
                <td className="px-5 py-3">{p.value_type === "percentage" ? `${p.value}%` : p.value_type === "fixed_amount" ? `$${p.value}` : "Free"}</td>
                <td className="px-5 py-3"><Badge tone={p.status === "active" ? "success" : p.status === "scheduled" ? "info" : p.status === "paused" ? "warn" : "neutral"}>{p.status}</Badge></td>
                <td className="px-5 py-3 text-right">{p.used.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminPage>
  );
}
