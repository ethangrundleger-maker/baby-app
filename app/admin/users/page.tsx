import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STAFF } from "@/lib/mock/seed";
import { Plus } from "lucide-react";

export default function UsersPage() {
  return (
    <AdminPage>
      <AdminPageHeader title="Staff & roles" subtitle="Pinners, tailors, drivers, admins — all MFA-required." action={<Button variant="brand"><Plus className="h-4 w-4" /> Invite</Button>} />
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-2.5 font-medium">Name</th>
              <th className="px-5 py-2.5 font-medium">Role</th>
              <th className="px-5 py-2.5 font-medium">Hub</th>
              <th className="px-5 py-2.5 font-medium">Contract</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {STAFF.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-5 py-3 font-medium">{s.name}</td>
                <td className="px-5 py-3 capitalize">{s.role}</td>
                <td className="px-5 py-3 uppercase text-xs text-ink-muted">{s.hub_id.replace("hub_", "")}</td>
                <td className="px-5 py-3 text-ink-muted">{s.is_contractor ? "Contractor" : "Employee"}</td>
                <td className="px-5 py-3"><Badge tone={s.active ? "success" : "neutral"}>{s.active ? "active" : "inactive"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminPage>
  );
}
