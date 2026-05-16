import type { DBEvent } from "@/lib/supabase/types";
import { fmtTime, sinceNow, fmtDuration } from "@/lib/utils";
import { DEV_NORMS } from "@/lib/dev-norms";

function napDuration(e: DBEvent): string {
  if (!e.ended_at) return "still down";
  const ms = new Date(e.ended_at).getTime() - new Date(e.occurred_at).getTime();
  return fmtDuration(ms);
}

function wakeWindowStatus(lastNapEnd: string | null) {
  if (!lastNapEnd) return null;
  const elapsed = (Date.now() - new Date(lastNapEnd).getTime()) / 60000; // minutes
  const { min, max, typical } = DEV_NORMS.wake_window_minutes;
  let label = "";
  let tone: "ok" | "approaching" | "over" = "ok";
  if (elapsed < min) { label = `${Math.round(elapsed)}m awake (early)`; tone = "ok"; }
  else if (elapsed <= max) { label = `${Math.round(elapsed)}m awake (in window ${min}–${max})`; tone = "approaching"; }
  else { label = `${Math.round(elapsed)}m awake (over typical ${typical})`; tone = "over"; }
  return { label, tone, elapsed };
}

function feedWindowStatus(lastFeedAt: string | null) {
  if (!lastFeedAt) return null;
  const elapsed = (Date.now() - new Date(lastFeedAt).getTime()) / 60000;
  if (elapsed < 90) return { label: `${Math.round(elapsed)}m since feed (early)` };
  if (elapsed <= 180) return { label: `${Math.round(elapsed)}m since feed (typical 2–3h window)` };
  return { label: `${Math.round(elapsed)}m since feed (overdue)` };
}

export function HeroCards({
  lastNap, lastFeed, lastDiaper, timezone,
}: {
  lastNap: DBEvent | null; lastFeed: DBEvent | null;
  lastDiaper: DBEvent | null; timezone: string;
}) {
  const napStatus = wakeWindowStatus(lastNap?.ended_at ?? null);
  const feedStatus = feedWindowStatus(lastFeed?.occurred_at ?? null);

  return (
    <section aria-label="Most recent" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Last nap — HERO */}
      <div className="rounded-2xl bg-gradient-to-br from-sleep/40 to-surface p-5 shadow-card border border-sleep/20">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs uppercase tracking-widest text-sleep">Last nap</h2>
          {lastNap && <span className="text-xs text-muted">{sinceNow(lastNap.ended_at ?? lastNap.occurred_at)}</span>}
        </div>
        {lastNap ? (
          <>
            <p className="mt-2 text-3xl font-semibold">
              {fmtTime(lastNap.occurred_at, timezone)}{lastNap.ended_at ? ` → ${fmtTime(lastNap.ended_at, timezone)}` : ""}
            </p>
            <p className="text-muted text-sm mt-1">Duration: {napDuration(lastNap)}</p>
            {napStatus && (
              <p className={`mt-3 text-sm ${napStatus.tone === "over" ? "text-warn" : napStatus.tone === "approaching" ? "text-accent" : "text-muted"}`}>
                {napStatus.label}
              </p>
            )}
            {lastNap.notes && <p className="text-xs text-muted mt-2 line-clamp-2">{lastNap.notes}</p>}
          </>
        ) : (
          <p className="text-muted mt-3">No naps recorded yet.</p>
        )}
      </div>

      {/* Last feed — HERO */}
      <div className="rounded-2xl bg-gradient-to-br from-feed/40 to-surface p-5 shadow-card border border-feed/20">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs uppercase tracking-widest text-feed">Last feed</h2>
          {lastFeed && <span className="text-xs text-muted">{sinceNow(lastFeed.occurred_at)}</span>}
        </div>
        {lastFeed ? (
          <>
            <p className="mt-2 text-3xl font-semibold">
              {fmtTime(lastFeed.occurred_at, timezone)}
            </p>
            <p className="text-muted text-sm mt-1">
              {lastFeed.feed_method === "nursed" ? "Nursed" : `${lastFeed.feed_oz ?? "?"} oz · ${(lastFeed.feed_method ?? "feed").replace("bottle_", "").replace("_", " ")}`}
            </p>
            {feedStatus && <p className="mt-3 text-sm text-muted">{feedStatus.label}</p>}
            {lastFeed.notes && <p className="text-xs text-muted mt-2 line-clamp-2">{lastFeed.notes}</p>}
          </>
        ) : (
          <p className="text-muted mt-3">No feeds recorded yet.</p>
        )}
      </div>

      {/* Last diaper */}
      <div className="rounded-2xl bg-surface p-4 shadow-card border border-diaper/10 sm:col-span-2">
        <h3 className="text-xs uppercase tracking-widest text-diaper">Last diaper</h3>
        {lastDiaper ? (
          <p className="mt-1">
            <span className="text-xl font-semibold">{fmtTime(lastDiaper.occurred_at, timezone)}</span>{" "}
            <span className="text-muted text-sm">
              {[lastDiaper.diaper_wet && "wet", lastDiaper.diaper_bm && "bm", lastDiaper.diaper_dry && "dry"].filter(Boolean).join(" · ") || "—"}
            </span>
          </p>
        ) : <p className="text-muted text-sm mt-1">None today.</p>}
      </div>
    </section>
  );
}
