import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ALL_ORDERS } from "@/lib/mock/seed";
import { formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";

export default function DeliveriesPage() {
  const all = ALL_ORDERS.flatMap((o) => o.deliveries.map((d) => ({ d, o })));
  return (
    <AdminPage>
      <AdminPageHeader title="Deliveries" subtitle="Every pickup, transfer, and return leg." />
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-2.5 font-medium">Order</th>
              <th className="px-5 py-2.5 font-medium">Leg</th>
              <th className="px-5 py-2.5 font-medium">Method</th>
              <th className="px-5 py-2.5 font-medium">Provider</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">Scheduled</th>
              <th className="px-5 py-2.5 font-medium">Completed</th>
            </tr>
          </thead>
          <tbody>
            {all.map(({ d, o }) => (
              <tr key={d.id} className="border-t border-line">
                <td className="px-5 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono text-xs hover:underline">#{o.id.slice(-4)}</Link></td>
                <td className="px-5 py-3 capitalize">{d.leg_type.replace(/_/g, " ")}</td>
                <td className="px-5 py-3 capitalize text-ink-muted">{d.method?.replace(/_/g, " ")}</td>
                <td className="px-5 py-3">{d.provider}</td>
                <td className="px-5 py-3"><Badge tone={d.status === "completed" ? "success" : d.status === "scheduled" ? "info" : "neutral"}>{d.status}</Badge></td>
                <td className="px-5 py-3 text-xs text-ink-muted">{d.scheduled_at && `${formatDate(d.scheduled_at)} · ${formatTime(d.scheduled_at)}`}</td>
                <td className="px-5 py-3 text-xs text-ink-muted">{d.completed_at && `${formatDate(d.completed_at)} · ${formatTime(d.completed_at)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminPage>
  );
}
