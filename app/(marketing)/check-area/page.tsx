import { Section, SectionHeader } from "@/components/ui/section";
import { ZipCheck } from "@/components/marketing/zip-check";
import { SERVICE_AREAS, HUBS } from "@/lib/mock/geography";

export const metadata = { title: "Check your area" };

export default function Page() {
  return (
    <>
      <Section>
        <div className="mx-auto max-w-xl text-center">
          <SectionHeader title="Do we serve your area?" subtitle="Enter your ZIP — we'll tell you in one click, and either get you started or take your number for when we're nearby." align="center" />
          <div className="mt-2"><ZipCheck /></div>
        </div>
      </Section>
      <Section bg="alt">
        <SectionHeader title="Where we operate today" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HUBS.filter((h) => h.active).map((h) => (
            <div key={h.id} className="rounded-lg border border-line bg-bg-card p-5">
              <div className="font-display text-xl font-semibold">{h.name}</div>
              <p className="text-xs text-ink-muted mb-3">{h.address}</p>
              <ul className="space-y-2 text-sm">
                {SERVICE_AREAS.filter((a) => a.hub_id === h.id).map((a) => (
                  <li key={a.id}>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-ink-muted">{a.zips.length} ZIP codes</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
