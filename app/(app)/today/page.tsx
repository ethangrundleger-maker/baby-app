import { getCurrentChild, getCurrentFamily } from "@/lib/auth";
import { getDayEvents, getLastNapAndFeed } from "@/lib/queries";
import { HeroCards } from "@/components/hero-cards";
import { Timeline } from "@/components/timeline/Timeline";
import { fmtDate, fmtDateISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const fam = await getCurrentFamily();
  const child = await getCurrentChild();
  if (!fam || !child) {
    return <div className="py-8 text-center text-muted">No family/child found. Visit Settings to set up.</div>;
  }
  const tz = fam.family.timezone;
  const todayISO = fmtDateISO(new Date(), tz);
  const [{ events, report }, last] = await Promise.all([
    getDayEvents(child.id, todayISO),
    getLastNapAndFeed(child.id),
  ]);

  return (
    <div className="space-y-5 pt-2">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted">Today · {child.name}</p>
        <h2 className="text-2xl font-semibold">{fmtDate(new Date(), tz)}</h2>
      </div>

      <HeroCards
        lastNap={last.lastNap}
        lastFeed={last.lastFeed}
        lastDiaper={last.lastDiaper}
        lastMed={last.lastMed}
        timezone={tz}
      />

      {report?.summary && (
        <section aria-label="Day summary" className="rounded-xl bg-surface2 p-4 shadow-card">
          <h3 className="text-xs uppercase tracking-widest text-muted mb-1">Summary</h3>
          <p className="text-ink">{report.summary}</p>
          <p className="text-xs text-muted mt-2">By {report.author_display_name} · confidence {Math.round((report.parse_confidence ?? 0) * 100)}%</p>
        </section>
      )}

      {report?.handoff_note && (
        <section aria-label="Handoff note" className="rounded-xl bg-accent/10 border border-accent/30 p-4">
          <h3 className="text-xs uppercase tracking-widest text-accent mb-1">Handoff note</h3>
          <p className="text-ink whitespace-pre-wrap">{report.handoff_note}</p>
        </section>
      )}

      <section aria-label="Timeline">
        <h3 className="text-sm font-medium text-muted mb-2">Timeline</h3>
        <Timeline events={events} timezone={tz} />
      </section>
    </div>
  );
}
