import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { LEADS } from "@/lib/mock/seed";
import { formatDate } from "@/lib/utils";

export default function LeadsPage() {
  return (
    <AdminPage>
      <AdminPageHeader title="Leads" subtitle="ZIP-validated, SMS-confirmed phone leads — ready to contact or waitlist." />
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-2.5 font-medium">Phone</th>
              <th className="px-5 py-2.5 font-medium">ZIP</th>
              <th className="px-5 py-2.5 font-medium">Source</th>
              <th className="px-5 py-2.5 font-medium">UTM campaign</th>
              <th className="px-5 py-2.5 font-medium">In service area</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">First touch</th>
            </tr>
          </thead>
          <tbody>
            {LEADS.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <td className="px-5 py-3 font-mono text-xs">{l.phone}</td>
                <td className="px-5 py-3">{l.zip}</td>
                <td className="px-5 py-3 capitalize text-ink-muted">{l.source}</td>
                <td className="px-5 py-3 text-ink-muted">{l.utm_campaign ?? "—"}</td>
                <td className="px-5 py-3">{l.in_service_area ? <span className="text-success">yes</span> : <span className="text-warn">no</span>}</td>
                <td className="px-5 py-3"><StatusBadge status={l.status} /></td>
                <td className="px-5 py-3 text-xs text-ink-muted">{formatDate(l.first_touch_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminPage>
  );
}
