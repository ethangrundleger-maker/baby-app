import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MEASUREMENTS } from "@/lib/mock/seed";
import { formatDate } from "@/lib/utils";
import { Camera } from "lucide-react";

const labels: Record<string, string> = {
  chest: "Chest",
  waist: "Waist",
  hips: "Hips",
  inseam: "Inseam",
  shoulder: "Shoulder",
  sleeve: "Sleeve",
  neck: "Neck",
};

export default function MeasurementsPage() {
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="My measurements" subtitle={MEASUREMENTS.measured_at ? `Last updated ${formatDate(MEASUREMENTS.measured_at)} · captured at a pinning visit` : "Not measured yet"} />

      <Card className="mt-6">
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(MEASUREMENTS.values).map(([k, v]) => (
              <div key={k} className="rounded-md border border-line p-3">
                <div className="text-xs uppercase tracking-wider text-ink-muted">{labels[k] ?? k}</div>
                <div className="mt-1 font-display text-xl font-semibold">{v}<span className="text-sm text-ink-muted">"</span></div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <h2 className="mt-10 mb-3 font-display text-lg font-semibold">Reference photos</h2>
      <Card>
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Front", "Side", "Back"].map((label) => (
              <div key={label} className="aspect-[3/4] rounded-md border-2 border-dashed border-line-strong bg-bg-alt/60 flex flex-col items-center justify-center text-center text-ink-muted">
                <Camera className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs">Tap to upload</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      <p className="mt-3 text-xs text-ink-subtle">Photos stay private — only you and your assigned tailor can view them.</p>

      <div className="mt-8 flex justify-end gap-3">
        <Button variant="outline">Schedule a re-measure</Button>
        <Button variant="brand">Edit measurements</Button>
      </div>
    </PageContainer>
  );
}
