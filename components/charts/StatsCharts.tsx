"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceArea, BarChart, Bar, CartesianGrid, Legend } from "recharts";
import type { DayStats } from "@/lib/stats";
import { DEV_NORMS } from "@/lib/dev-norms";

export function StatsCharts({ days }: { days: DayStats[] }) {
  if (days.length === 0) {
    return <p className="text-muted">Not enough data yet. Paste a few days first.</p>;
  }
  const napTotal = DEV_NORMS.total_day_sleep_hours;

  return (
    <div className="space-y-8">
      <section aria-label="Day sleep">
        <h3 className="text-sm font-medium mb-2">Day sleep (hours)</h3>
        <p className="text-xs text-muted mb-2">Shaded band: typical 5–6mo day-sleep range ({napTotal.min}–{napTotal.max}h).</p>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={days} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#22305a" />
              <XAxis dataKey="date" tick={{ fill: "#8893c4", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8893c4", fontSize: 11 }} domain={[0, 6]} />
              <Tooltip contentStyle={{ background: "#121833", border: "1px solid #1a2247" }} />
              <ReferenceArea y1={napTotal.min} y2={napTotal.max} fill="#7aa2ff" fillOpacity={0.08} />
              <Line type="monotone" dataKey="sleepHours" stroke="#8a7bff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <details className="mt-2 text-xs text-muted">
          <summary>Data table</summary>
          <table className="w-full text-left mt-2">
            <thead><tr><th>Date</th><th>Hours</th></tr></thead>
            <tbody>{days.map(d => <tr key={d.date}><td>{d.date}</td><td>{d.sleepHours}</td></tr>)}</tbody>
          </table>
        </details>
      </section>

      <section aria-label="Feeds and ounces">
        <h3 className="text-sm font-medium mb-2">Feeds &amp; ounces</h3>
        <p className="text-xs text-muted mb-2">Typical: {DEV_NORMS.feeds_per_day.min}–{DEV_NORMS.feeds_per_day.max} feeds, {DEV_NORMS.ounces_per_day_total.min}–{DEV_NORMS.ounces_per_day_total.max} oz milk total.</p>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={days} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#22305a" />
              <XAxis dataKey="date" tick={{ fill: "#8893c4", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8893c4", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#121833", border: "1px solid #1a2247" }} />
              <Legend wrapperStyle={{ color: "#8893c4" }} />
              <Bar dataKey="feeds" fill="#34d399" />
              <Bar dataKey="oz" fill="#7aa2ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section aria-label="Diapers">
        <h3 className="text-sm font-medium mb-2">Diapers</h3>
        <p className="text-xs text-muted mb-2">≥ {DEV_NORMS.wet_diapers_per_day_min} wet diapers/day is the hydration floor.</p>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={days} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#22305a" />
              <XAxis dataKey="date" tick={{ fill: "#8893c4", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8893c4", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#121833", border: "1px solid #1a2247" }} />
              <Legend wrapperStyle={{ color: "#8893c4" }} />
              <Bar dataKey="wetDiapers" fill="#fbbf24" />
              <Bar dataKey="bmDiapers" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section aria-label="Longest wake window">
        <h3 className="text-sm font-medium mb-2">Longest wake window (min)</h3>
        <p className="text-xs text-muted mb-2">Typical wake window for 5–6mo: {DEV_NORMS.wake_window_minutes.min}–{DEV_NORMS.wake_window_minutes.max} min.</p>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={days} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#22305a" />
              <XAxis dataKey="date" tick={{ fill: "#8893c4", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8893c4", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#121833", border: "1px solid #1a2247" }} />
              <ReferenceArea y1={DEV_NORMS.wake_window_minutes.min} y2={DEV_NORMS.wake_window_minutes.max} fill="#7aa2ff" fillOpacity={0.08} />
              <Line type="monotone" dataKey="longestWakeMin" stroke="#f97373" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
