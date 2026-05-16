import { getCurrentChild, getCurrentFamily } from "@/lib/auth";
import { getDayEvents } from "@/lib/queries";
import { TimelineEvents, ActivitiesFooter } from "@/components/timeline/Timeline";
import { DayNav } from "@/components/day-nav";
import { AddEventForm } from "@/components/add-event-form";
import { AddActivityForm } from "@/components/add-activity-form";
import { fmtDate, fmtDateISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HistoryDayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const fam = await getCurrentFamily();
  const child = await getCurrentChild();
  if (!fam || !child) return <div className="py-8 text-muted">No family/child found.</div>;
  const tz = fam.family.timezone;
  const todayISO = fmtDateISO(new Date(), tz);
  const { events, report } = await getDayEvents(child.id, date, tz);

  return (
    <div className="pt-2 pb-32 space-y-4">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted">History</p>
        <h2 className="text-2xl font-semibold">{fmtDate(`${date}T12:00:00Z`, tz)}</h2>
        {report && <p className="text-sm text-muted">By {report.author_display_name} · confidence {Math.round((report.parse_confidence ?? 0) * 100)}%</p>}
      </header>
      <DayNav dateISO={date} todayISO={todayISO} />
      {report?.handoff_note && (
        <section className="rounded-xl bg-accent/10 border border-accent/30 p-4">
          <h3 className="text-xs uppercase tracking-widest text-accent mb-1">Handoff note</h3>
          <p className="whitespace-pre-wrap">{report.handoff_note}</p>
        </section>
      )}
      {report?.raw_text && (
        <details className="rounded-xl bg-surface p-4 shadow-card">
          <summary className="cursor-pointer text-sm text-muted">Original note</summary>
          <pre className="mt-2 text-xs whitespace-pre-wrap text-ink">{report.raw_text}</pre>
        </details>
      )}
      <TimelineEvents events={events} timezone={tz} />
      <AddEventForm childId={child.id} dateISO={date} />
      <section aria-label="Activities & development">
        <h3 className="text-sm font-medium text-muted mb-2">Activities &amp; development</h3>
        <ActivitiesFooter events={events} />
      </section>
      <AddActivityForm childId={child.id} dateISO={date} />
    </div>
  );
}
