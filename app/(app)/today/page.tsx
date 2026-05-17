import { getCurrentChild, getCurrentFamily } from "@/lib/auth";
import { getDayEvents, getLastNapAndFeed } from "@/lib/queries";
import { HeroCards } from "@/components/hero-cards";
import { TimelineEvents, ActivitiesFooter } from "@/components/timeline/Timeline";
import { DayNav } from "@/components/day-nav";
import { AddEventForm } from "@/components/add-event-form";
import { AddActivityForm } from "@/components/add-activity-form";
import { MidnightRefresh } from "@/components/midnight-refresh";
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
    getDayEvents(child.id, todayISO, tz),
    getLastNapAndFeed(child.id),
  ]);

  return (
    <div className="space-y-5 pt-2 pb-32">
      <MidnightRefresh tz={tz} />
      <div>
        <p className="text-xs uppercase tracking-widest text-muted">Today · {child.name}</p>
        <h2 className="text-2xl font-semibold">{fmtDate(new Date(), tz)}</h2>
      </div>

      <DayNav dateISO={todayISO} todayISO={todayISO} />

      <HeroCards
        lastNap={last.lastNap}
        lastFeed={last.lastFeed}
        lastDiaper={last.lastDiaper}
        timezone={tz}
      />

      {report?.handoff_note && (
        <section aria-label="Handoff note" className="rounded-xl bg-accent/10 border border-accent/30 p-4">
          <h3 className="text-xs uppercase tracking-widest text-accent mb-1">Handoff note</h3>
          <p className="text-ink whitespace-pre-wrap">{report.handoff_note}</p>
        </section>
      )}

      <section aria-label="Timeline">
        <h3 className="text-sm font-medium text-muted mb-2">Timeline</h3>
        <TimelineEvents events={events} timezone={tz} />
      </section>

      <AddEventForm childId={child.id} dateISO={todayISO} timezone={tz} />

      <section aria-label="Activities & development">
        <h3 className="text-sm font-medium text-muted mb-2">Activities &amp; development</h3>
        <ActivitiesFooter events={events} />
      </section>

      <AddActivityForm childId={child.id} dateISO={todayISO} timezone={tz} />
    </div>
  );
}
