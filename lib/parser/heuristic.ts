/**
 * Heuristic parser for Shelly's report format. Deterministic — runs first.
 * Format (observed):
 *   5/15
 *   (6:30/5oz & nursed)            ← optional header: wake_time / morning feed
 *   8:07 wet
 *   8:17 down; 9:03 up             ← nap on one line
 *   9:16 6.5 oz breastmilk
 *   10:40 Dr appointment w/mom
 *   12:21 walk/blessing box/park
 *   4:56 down                       ← nap with no end (rolls over)
 *   Development skills worked on: ...
 *   Songs/music: ...
 *   Books: ...
 *   Sensory: ...
 *   Signs: ...
 *
 * Timestamps are constructed in the family timezone via fromZonedTime,
 * so persisted UTC values render correctly back in that TZ on any server.
 */
import { fromZonedTime } from "date-fns-tz";
import type { ParsedDay, ParsedEvent } from "./schema";

const RANGE_RE = /(\d{1,2}:\d{2})\s*(?:down|asleep)\s*;\s*(\d{1,2}:\d{2})\s*(?:up|awake|woke)/i;
const FEED_RE_GLOBAL  = /(\d+(?:\.\d+)?)\s*oz\s*(breast\s*milk|breastmilk|formula|breast|bottle|mixed)/gi;
const DIAPER_RE = /\b(wet|dry|bm|dirty|poop)\b/gi;
const NURSED_RE = /\bnursed\b/i;
const SECTION_LABELS = [
  { key: "milestone", re: /^development\s+skills\s+worked\s+on\s*:\s*(.+)$/i },
  { key: "song",      re: /^songs?\s*\/?\s*music\s*:\s*(.+)$/i },
  { key: "book",      re: /^books?\s*:\s*(.+)$/i },
  { key: "sensory",   re: /^sensory\s*:\s*(.+)$/i },
  { key: "sign",      re: /^signs?\s*:\s*(.+)$/i },
] as const;

const NAP_START_TOKENS = /\b(down|asleep)\b/i;
const NAP_END_TOKENS   = /\b(up|woke|awake)\b/i;
const OUTING_TOKENS    = /(walk|park|appointment|appt|library|store|grocery|errand|outing|class|playdate|drive|stroll|blessing\s*box)/i;
const MED_TOKENS       = /(floradacane|reflux\s*med|gas\s*drops|tylenol|gripe\s*water|probiotic)/i;

/** Convert "h:mm" in `tz` on `dateISO` to a UTC Date.
 *  Tries AM first; if it's earlier than `cursor.lastUtcMs`, tries PM. Picks
 *  whichever is the next monotonic instant in the day.
 */
export function zonedHHMMToUtc(
  dateISO: string,
  hhmm: string,
  tz: string,
  cursor: { lastUtcMs: number },
): Date {
  const [hStr, mStr] = hhmm.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (h === 12) h = 0;
  const pad = (n: number) => n.toString().padStart(2, "0");

  const amStr = `${dateISO}T${pad(h)}:${pad(m)}:00`;
  const pmStr = `${dateISO}T${pad(h + 12)}:${pad(m)}:00`;
  const am = fromZonedTime(amStr, tz);
  const pm = fromZonedTime(pmStr, tz);

  const cursorTime = cursor.lastUtcMs;
  const amOk = am.getTime() >= cursorTime;
  const pmOk = pm.getTime() >= cursorTime;
  let chosen: Date;
  if (amOk && !pmOk) chosen = am;
  else if (!amOk && pmOk) chosen = pm;
  else if (amOk && pmOk) {
    chosen = am.getTime() - cursorTime < pm.getTime() - cursorTime ? am : pm;
  } else {
    // Both earlier than cursor — clamp to cursor (preserves monotonicity).
    chosen = new Date(cursorTime);
  }
  cursor.lastUtcMs = chosen.getTime();
  return chosen;
}

const CONF_STRUCTURED = 0.95;
const CONF_PARTIAL = 0.7;
const CONF_FREEFORM = 0.4;

function dailyConfidence(structured: number, total: number): number {
  if (total === 0) return 0;
  const ratio = structured / Math.max(1, total);
  return Math.max(0.4, Math.min(1, ratio));
}

export interface HeuristicResult {
  parsed: ParsedDay & { perEventConfidence: number[] };
  unparsedLines: string[];
}

export function parseHeuristic(raw: string, reportDate: Date, tz = "America/New_York"): HeuristicResult {
  const dateISO = reportDate.toISOString().slice(0, 10);
  const events: ParsedEvent[] = [];
  const perEventConfidence: number[] = [];
  const unparsed: string[] = [];
  const flags: string[] = [];

  // Anchor cursor at 6am in family TZ
  const anchorUtc = fromZonedTime(`${dateISO}T06:00:00`, tz);
  const cursor = { lastUtcMs: anchorUtc.getTime() };

  let wakeTime: string | null = null;
  let morningFeed: string | null = null;
  let addedMorningEvent = false;

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const pushEv = (e: ParsedEvent, conf: number) => {
    events.push(e);
    perEventConfidence.push(conf);
  };

  for (const line of lines) {
    // Date header like "5/15" → skip; report date is supplied externally.
    if (/^\d{1,2}\/\d{1,2}(?:\/\d{2,4})?(?:\s*\(.*\))?$/.test(line)) continue;

    // Header: (6:30/5oz & nursed) or (7/7:30)
    const headerMatch = line.match(/^\(([^)]+)\)$/);
    if (headerMatch) {
      const inner = headerMatch[1];
      const parts = inner.split("/");
      wakeTime = parts[0]?.trim() ?? null;
      morningFeed = parts.slice(1).join("/").trim() || null;

      // Emit a morning feed event so it counts in stats. (P1-1 fix)
      if (wakeTime && /^\d{1,2}:?\d{0,2}$/.test(wakeTime.replace(/\s/g, ""))) {
        const wt = wakeTime.includes(":") ? wakeTime : `${wakeTime}:00`;
        const when = zonedHHMMToUtc(dateISO, wt, tz, cursor);
        let method: "nursed" | "bottle_breastmilk" | "bottle_formula" | "bottle_mixed" | "other" = "nursed";
        let oz: number | null = null;
        if (morningFeed) {
          const ozMatch = morningFeed.match(/(\d+(?:\.\d+)?)\s*oz/i);
          if (ozMatch) oz = parseFloat(ozMatch[1]);
          if (/nurs/i.test(morningFeed) && oz) method = "bottle_mixed";
          else if (/nurs/i.test(morningFeed)) method = "nursed";
          else if (/formula/i.test(morningFeed)) method = "bottle_formula";
          else if (oz) method = "bottle_breastmilk";
        }
        pushEv({ type: "feed", time: when.toISOString(), method, oz, notes: `morning feed${morningFeed ? `: ${morningFeed}` : ""}` }, CONF_PARTIAL);
        addedMorningEvent = true;
      }
      continue;
    }

    // Section labels at footer
    let sectioned = false;
    for (const { key, re } of SECTION_LABELS) {
      const m = line.match(re);
      if (m) {
        pushEv({ type: key as ParsedEvent["type"], description: m[1].trim() } as ParsedEvent, CONF_STRUCTURED);
        sectioned = true;
        break;
      }
    }
    if (sectioned) continue;

    // Nap range on same line: "8:17 down; 9:03 up"
    const range = line.match(RANGE_RE);
    if (range) {
      const start = zonedHHMMToUtc(dateISO, range[1], tz, cursor);
      const end = zonedHHMMToUtc(dateISO, range[2], tz, cursor);
      const noteMatch = line.replace(RANGE_RE, "").replace(/^[\s;,.]+|[\s;,.]+$/g, "");
      pushEv({
        type: "nap",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        notes: noteMatch || null,
      }, CONF_STRUCTURED);
      continue;
    }

    // Otherwise, line must start with a time
    const tMatch = line.match(/^(\d{1,2}:\d{2})\s*(.*)$/);
    if (!tMatch) {
      unparsed.push(line);
      continue;
    }
    const time = tMatch[1];
    const rest = tMatch[2].trim();
    const when = zonedHHMMToUtc(dateISO, time, tz, cursor);

    // Bare "down" or "up"
    if (NAP_START_TOKENS.test(rest) && !NAP_END_TOKENS.test(rest)) {
      pushEv({ type: "nap", start_time: when.toISOString(), end_time: null, notes: rest }, CONF_STRUCTURED);
      continue;
    }
    if (NAP_END_TOKENS.test(rest) && !NAP_START_TOKENS.test(rest)) {
      // Attach to most recent open nap
      const idx = [...events].reverse().findIndex(e => e.type === "nap" && !("end_time" in e ? e.end_time : null));
      const realIdx = idx === -1 ? -1 : events.length - 1 - idx;
      if (realIdx !== -1 && events[realIdx].type === "nap") {
        const napEv = events[realIdx] as Extract<ParsedEvent, { type: "nap" }>;
        napEv.end_time = when.toISOString();
        if (rest) napEv.notes = [napEv.notes, rest].filter(Boolean).join(" | ");
      } else {
        pushEv({ type: "note", time: when.toISOString(), text: rest }, CONF_PARTIAL);
      }
      continue;
    }

    // Feed — match ALL "N oz <kind>" occurrences on the line (P1-2 fix).
    const feedMatches = [...rest.matchAll(FEED_RE_GLOBAL)];
    if (feedMatches.length > 0) {
      for (const fm of feedMatches) {
        const oz = parseFloat(fm[1]);
        const kind = fm[2].toLowerCase();
        let method: "bottle_breastmilk" | "bottle_formula" | "bottle_mixed" | "other" = "other";
        if (/breast\s*milk|breastmilk/.test(kind)) method = "bottle_breastmilk";
        else if (/formula/.test(kind)) method = "bottle_formula";
        else if (/mixed/.test(kind)) method = "bottle_mixed";
        pushEv({ type: "feed", time: when.toISOString(), method, oz }, CONF_STRUCTURED);
      }
      continue;
    }
    if (NURSED_RE.test(rest)) {
      pushEv({ type: "feed", time: when.toISOString(), method: "nursed", oz: null }, CONF_STRUCTURED);
      continue;
    }

    // Diaper
    const dpMatches = rest.match(DIAPER_RE);
    if (dpMatches && !OUTING_TOKENS.test(rest) && !MED_TOKENS.test(rest)) {
      const set = new Set(dpMatches.map(x => x.toLowerCase()));
      pushEv({
        type: "diaper",
        time: when.toISOString(),
        wet: set.has("wet"),
        bm: set.has("bm") || set.has("dirty") || set.has("poop"),
        dry: set.has("dry"),
      }, CONF_STRUCTURED);
      continue;
    }

    // Medication
    if (MED_TOKENS.test(rest)) {
      const mName = rest.match(MED_TOKENS)?.[1] ?? "medication";
      pushEv({ type: "medication", time: when.toISOString(), name: mName, notes: rest }, CONF_STRUCTURED);
      continue;
    }

    // Outing
    if (OUTING_TOKENS.test(rest)) {
      pushEv({ type: "outing", time: when.toISOString(), description: rest }, CONF_STRUCTURED);
      continue;
    }

    // Fallback: time-stamped freeform note
    pushEv({ type: "note", time: when.toISOString(), text: rest }, CONF_FREEFORM);
  }

  const structured = perEventConfidence.filter(c => c >= 0.9).length;
  const confidence = dailyConfidence(structured, events.length);

  if (unparsed.length > 0) flags.push(`unparsed_lines:${unparsed.length}`);
  if (!addedMorningEvent && wakeTime) flags.push("morning_feed_skipped");

  return {
    parsed: {
      date: dateISO,
      wake_time: wakeTime,
      morning_feed: morningFeed,
      events,
      handoff_note: null,
      summary: null,
      confidence,
      flags,
      perEventConfidence,
    },
    unparsedLines: unparsed,
  };
}
