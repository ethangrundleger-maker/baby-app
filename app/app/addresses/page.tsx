import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ADDRESSES } from "@/lib/mock/seed";
import { Badge } from "@/components/ui/badge";
import { Edit3, MapPin, Plus } from "lucide-react";

export default function AddressesPage() {
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Addresses" subtitle="Where we pick up and drop off." action={<Button variant="brand"><Plus className="h-4 w-4" /> Add address</Button>} />

      <div className="mt-6 space-y-3">
        {ADDRESSES.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-bg-alt"><MapPin className="h-5 w-5 text-ink-muted" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-semibold">{a.label}</span>
                  {a.is_preferred && <Badge tone="brand">preferred</Badge>}
                </div>
                <div className="mt-1 text-sm text-ink-muted">{a.line1}, {a.city} {a.zip}</div>
                {a.access_notes && <div className="mt-2 text-xs text-ink-muted"><strong className="text-ink">Access:</strong> {a.access_notes}</div>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm"><Edit3 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
