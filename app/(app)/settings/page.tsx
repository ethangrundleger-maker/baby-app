import { getCurrentChild, getCurrentFamily } from "@/lib/auth";
import { DEV_NORMS, ageInMonths } from "@/lib/dev-norms";
import SignOutButton from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const fam = await getCurrentFamily();
  const child = await getCurrentChild();
  const months = ageInMonths();

  return (
    <div className="pt-2 pb-24 space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>

      <section aria-label="Account" className="rounded-xl bg-surface p-4 shadow-card">
        <h3 className="text-sm font-medium mb-2">You</h3>
        {fam ? (
          <>
            <p className="text-sm">{fam.display_name} <span className="text-muted">· {fam.role}</span></p>
            <p className="text-xs text-muted">Family TZ: {fam.family.timezone}</p>
          </>
        ) : <p className="text-muted text-sm">Not signed in.</p>}
        <div className="mt-3"><SignOutButton /></div>
      </section>

      <section aria-label="Child" className="rounded-xl bg-surface p-4 shadow-card">
        <h3 className="text-sm font-medium mb-2">Child</h3>
        {child ? (
          <>
            <p className="text-sm">{child.name} · {months} months old (DOB {child.dob})</p>
            {child.notes && <p className="text-xs text-muted mt-1 whitespace-pre-wrap">{child.notes}</p>}
          </>
        ) : <p className="text-muted text-sm">No child set up.</p>}
      </section>

      <section aria-label="Developmental context" className="rounded-xl bg-surface p-4 shadow-card">
        <h3 className="text-sm font-medium mb-2">Developmental context (5–6 months)</h3>
        <ul className="text-sm space-y-1">
          <li>Wake window: <strong>{DEV_NORMS.wake_window_minutes.min}–{DEV_NORMS.wake_window_minutes.max} min</strong> (typical ~{DEV_NORMS.wake_window_minutes.typical})</li>
          <li>Naps/day: <strong>{DEV_NORMS.naps_per_day.min}–{DEV_NORMS.naps_per_day.max}</strong> (typical {DEV_NORMS.naps_per_day.typical})</li>
          <li>Day sleep: <strong>{DEV_NORMS.total_day_sleep_hours.min}–{DEV_NORMS.total_day_sleep_hours.max}h</strong></li>
          <li>Night sleep: <strong>{DEV_NORMS.night_sleep_hours.min}–{DEV_NORMS.night_sleep_hours.max}h</strong></li>
          <li>Feeds/day: <strong>{DEV_NORMS.feeds_per_day.min}–{DEV_NORMS.feeds_per_day.max}</strong></li>
          <li>Total milk/day: <strong>{DEV_NORMS.ounces_per_day_total.min}–{DEV_NORMS.ounces_per_day_total.max} oz</strong> — {DEV_NORMS.ounces_per_day_total.note}</li>
          <li>Wet diapers min: <strong>{DEV_NORMS.wet_diapers_per_day_min}/day</strong></li>
        </ul>
        <details className="mt-3 text-xs text-muted">
          <summary className="cursor-pointer">Sources ({DEV_NORMS.sources.length})</summary>
          <ul className="mt-2 space-y-1">
            {DEV_NORMS.sources.map(s => (
              <li key={s.name}>
                <a href={s.url} target="_blank" rel="noreferrer" className="underline">{s.name}</a> — {s.summary_one_line}
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section aria-label="Reflux tips" className="rounded-xl bg-surface p-4 shadow-card">
        <h3 className="text-sm font-medium mb-2">Reflux tips</h3>
        <ul className="text-sm list-disc list-inside space-y-1">
          {DEV_NORMS.reflux_tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </section>

      <section aria-label="Solids" className="rounded-xl bg-surface p-4 shadow-card">
        <h3 className="text-sm font-medium mb-2">Starting solids</h3>
        <p className="text-sm mb-1"><strong>First foods:</strong> {DEV_NORMS.solids_intro_guidance.first_foods.join(", ")}.</p>
        <p className="text-sm mb-1"><strong>Frequency:</strong> {DEV_NORMS.solids_intro_guidance.frequency_per_day}</p>
        <p className="text-sm mb-1"><strong>Amount:</strong> {DEV_NORMS.solids_intro_guidance.amount_per_meal}</p>
        <p className="text-sm text-muted">{DEV_NORMS.solids_intro_guidance.reflux_considerations}</p>
      </section>
    </div>
  );
}
