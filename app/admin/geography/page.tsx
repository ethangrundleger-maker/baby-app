import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HUBS, SERVICE_AREAS } from "@/lib/mock/geography";
import { Plus } from "lucide-react";

export default function GeographyPage() {
  return (
    <AdminPage>
      <AdminPageHeader title="Geography" subtitle="Hubs, service areas, and the ZIP coverage map." action={<Button variant="brand"><Plus className="h-4 w-4" /> New hub</Button>} />
      <div className="space-y-5">
        {HUBS.map((h) => (
          <Card key={h.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-semibold">{h.name}</span>
                  <Badge tone={h.active ? "success" : "neutral"}>{h.active ? "active" : "inactive"}</Badge>
                </div>
                <div className="text-xs text-ink-muted mt-0.5">{h.address}</div>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">Service areas</div>
              <div className="space-y-2">
                {SERVICE_AREAS.filter((a) => a.hub_id === h.id).map((a) => (
                  <div key={a.id} className="rounded-md border border-line p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{a.name}</div>
                      <span className="text-xs text-ink-muted">{a.zips.length} ZIPs</span>
                    </div>
                    <div className="mt-1 text-xs text-ink-muted">{a.zips.slice(0, 10).join(", ")}{a.zips.length > 10 ? `, +${a.zips.length - 10}` : ""}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
