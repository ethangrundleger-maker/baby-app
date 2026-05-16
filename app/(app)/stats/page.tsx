import { getCurrentChild, getCurrentFamily } from "@/lib/auth";
import { getRecentDays } from "@/lib/queries";
import { statsByDay } from "@/lib/stats";
import { StatsCharts } from "@/components/charts/StatsCharts";
import { ageInMonths } from "@/lib/dev-norms";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const fam = await getCurrentFamily();
  const child = await getCurrentChild();
  if (!fam || !child) return <div className="py-8 text-muted">No family/child found.</div>;
  const tz = fam.family.timezone;

  const events = await getRecentDays(child.id, 21);
  const days = statsByDay(events, tz);
  const months = ageInMonths();

  return (
    <div className="pt-2 pb-24 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted">Stats · {child.name} · {months} months</p>
        <h2 className="text-2xl font-semibold">Last 21 days</h2>
      </header>
      <StatsCharts days={days} />
    </div>
  );
}
