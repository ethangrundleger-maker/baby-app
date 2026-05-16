import type { DBEvent } from "./supabase/types";
import { formatInTimeZone } from "date-fns-tz";

export interface DayStats {
  date: string;
  sleepHours: number;
  feeds: number;
  oz: number;
  wetDiapers: number;
  bmDiapers: number;
  longestWakeMin: number;
  napCount: number;
}

export function statsByDay(events: DBEvent[], tz: string): DayStats[] {
  const byDay = new Map<string, DBEvent[]>();
  for (const e of events) {
    const d = formatInTimeZone(e.occurred_at, tz, "yyyy-MM-dd");
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(e);
  }
  const out: DayStats[] = [];
  for (const [date, list] of [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    let sleepMs = 0, feeds = 0, oz = 0, wet = 0, bm = 0, napCount = 0;
    const napEnds: number[] = [];
    const napStarts: number[] = [];
    for (const e of list) {
      if (e.type === "nap" && e.ended_at) {
        sleepMs += new Date(e.ended_at).getTime() - new Date(e.occurred_at).getTime();
        napStarts.push(new Date(e.occurred_at).getTime());
        napEnds.push(new Date(e.ended_at).getTime());
        napCount++;
      } else if (e.type === "nap") {
        napCount++;
      }
      if (e.type === "feed") { feeds++; if (e.feed_oz) oz += e.feed_oz; }
      if (e.type === "diaper") { if (e.diaper_wet) wet++; if (e.diaper_bm) bm++; }
    }
    let longestWakeMin = 0;
    napStarts.sort((a, b) => a - b); napEnds.sort((a, b) => a - b);
    for (let i = 0; i < napStarts.length - 1; i++) {
      const wake = (napStarts[i + 1] - napEnds[i]) / 60000;
      if (wake > longestWakeMin) longestWakeMin = wake;
    }
    out.push({
      date,
      sleepHours: +(sleepMs / 3_600_000).toFixed(2),
      feeds, oz: +oz.toFixed(1), wetDiapers: wet, bmDiapers: bm,
      longestWakeMin: Math.round(longestWakeMin), napCount,
    });
  }
  return out;
}
