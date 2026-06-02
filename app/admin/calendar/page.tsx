import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { APPOINTMENTS } from "@/lib/mock/seed";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CalendarPage() {
  const grouped: Record<string, typeof APPOINTMENTS> = {};
  for (const a of APPOINTMENTS) {
    const key = new Date(a.scheduled_at).toISOString().slice(0, 10);
    grouped[key] = grouped[key] || [];
    grouped[key].push(a);
  }
  const sortedKeys = Object.keys(grouped).sort();

  return (
    <AdminPage>
      <AdminPageHeader title="Pinning calendar" subtitle="Across all pinners, every solo & party visit." action={<Button variant="brand"><Plus className="h-4 w-4" /> New slot</Button>} />
      <div className="space-y-5">
        {sortedKeys.map((day) => (
          <div key={day}>
            <h3 className="mb-2 text-sm font-medium text-ink-muted">{new Date(day).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3>
            <Card>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="px-5 py-2 font-medium">Time</th>
                    <th className="px-5 py-2 font-medium">Type</th>
                    <th className="px-5 py-2 font-medium">Host</th>
                    <th className="px-5 py-2 font-medium">Pinner</th>
                    <th className="px-5 py-2 font-medium">Address</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[day].map((a) => (
                    <tr key={a.id} className="border-t border-line">
                      <td className="px-5 py-3 font-medium">{new Date(a.scheduled_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</td>
                      <td className="px-5 py-3 capitalize">{a.type}</td>
                      <td className="px-5 py-3">{a.host_client_name}</td>
                      <td className="px-5 py-3">{a.pinner_name}</td>
                      <td className="px-5 py-3 text-ink-muted">{a.address}</td>
                      <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
