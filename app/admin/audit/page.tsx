import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { ALL_ORDERS } from "@/lib/mock/seed";
import { formatDate, formatTime } from "@/lib/utils";

export default function AuditPage() {
  // Flatten all status events
  const events = ALL_ORDERS.flatMap((o) => o.status_events.map((e) => ({ ...e, order_id: o.id })))
    .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
  return (
    <AdminPage>
      <AdminPageHeader title="Audit log" subtitle="Every status transition across orders, garments, and adjustments." />
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-2.5 font-medium">Entity</th>
              <th className="px-5 py-2.5 font-medium">From</th>
              <th className="px-5 py-2.5 font-medium">To</th>
              <th className="px-5 py-2.5 font-medium">Changed by</th>
              <th className="px-5 py-2.5 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t border-line">
                <td className="px-5 py-3"><span className="capitalize">{e.entity_type}</span> <span className="font-mono text-xs text-ink-muted">#{e.entity_id.slice(-4)}</span></td>
                <td className="px-5 py-3 capitalize text-ink-muted">{e.from_status?.replace(/_/g, " ") ?? "—"}</td>
                <td className="px-5 py-3 capitalize font-medium">{e.to_status.replace(/_/g, " ")}</td>
                <td className="px-5 py-3 text-ink-muted">{e.changed_by}</td>
                <td className="px-5 py-3 text-xs text-ink-muted">{formatDate(e.changed_at)} · {formatTime(e.changed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminPage>
  );
}
