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
 */
import type { ParsedDay, ParsedEvent } from "./schema";

const TIME_RE = /(\d{1,2}):(\d{2})/;
const RANGE_RE = /(\d{1,2}:\d{2})\s*(?:down|asleep)\s*;\s*(\d{1,2}:\d{2})\s*(?:up|awake|woke)/i;
const FEED_RE  = /(\d+(?:\.\d+)?)\s*oz\s*(breast\s*milk|breastmilk|formula|breast|bottle|mixed)/i;
const DIAPER_RE = /\b(wet|dry|bm|dirty|poop)\b/gi;
const NURSED_RE = /\bnursed\b/i;
const SECTION_LABELS = [
  { key: "milestone", re: /^development\s+skills\s+worked\s+on\s*:\s*(.+)$/i },
  { key: "song", re: /^songs?\s*\/?\s*music\s*:\s*(.+)$/i },
  { key: "book", re: /^books?\s*:\s*(.+)$/i },
  { key: "sensory", re: /^sensory\s*:\s*(.+)$/i },
  { key: "sign", re: /^signs?\s*:\s*(.+)$/i },
] as const;

const NAP_START_TOKENS = /\b(down|asleep)\b/i;
const NAP_END_TOKENS   = /\b(up|woke|awake)\b/i;
const OUTING_TOKENS    = /(walk|park|appointment|appt|library|store|grocery|errand|outing|class|playdate|drive|stroll|blessing\s*box)/i;
const MED_TOKENS       = /(floradacane|reflux\s*med|gas\s*drops|tylenol|gripe\s*water|probiotic)/i;

/**
 * Infer AM/PM for a 12h "h:mm" string given the previous event's UTC timestamp.
 * Anchored to the day starting at the wake time or 7am if missing. Times
 * monotonically increase; if a parsed time appears earlier than the last
 * accepted time AND adding 12h would still place it within the same waking
 * day window, treat it as PM.
 */
export function inferDateTime(
  date: Date,
  hhmm: string,
  cursor: { lastUtcMs: number },
): Date {
  const [hStr, mStr] = hhmm.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (h === 12) h = 0; // handle "12:30" → 0 then add PM logic below

  // Start by assuming AM
  const candidateAm = new Date(date);
  candidateAm.setHours(h, m, 0, 0);

  const candidatePm = new Date(date);
  candidatePm.setHours(h + 12, m, 0, 0);

  // Pick whichever is >= cursor (events are monotonic through the day).
  // Tie-break: pick the closer of the two to the cursor.
  const cursorTime = cursor.lastUtcMs;
  const amOk = candidateAm.getTime() >= cursorTime;
  const pmOk = candidatePm.getTime() >= cursorTime;
  let chosen: Date;
  if (amOk && !pmOk) chosen = candidateAm;
  else if (!amOk && pmOk) chosen = candidatePm;
  else if (amOk && pmOk) {
    // Both later than cursor — prefer the smaller delta (likely AM if early morning continuation).
    chosen = candidateAm.getTime() - cursorTime < candidatePm.getTime() - cursorTime
      ? candidateAm : candidatePm;
  } else {
    // Both earlier than cursor — unusual; fall back to PM to maintain monotonicity if within 24h.
    chosen = candidatePm.getTime() >= cursorTime ? candidatePm : candidatePm;
  }
  cursor.lastUtcMs = chosen.getTime();
  return chosen;
}

export interface HeuristicResult {
  parsed: ParsedDay;
  unparsedLines: string[];
}

export function parseHeuristic(raw: string, reportDate: Date): HeuristicResult {
  const events: ParsedEvent[] = [];
  const unparsed: string[] = [];
  const flags: string[] = [];

  // Anchor cursor at 6am local for the report date
  const anchor = new Date(reportDate);
  anchor.setHours(6, 0, 0, 0);
  const cursor = { lastUtcMs: anchor.getTime() };

  let wakeTime: string | null = null;
  let morningFeed: string | null = null;

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Date header like "5/15" or "5/15/2026" at top — skip; date is supplied externally.
    if (/^\d{1,2}\/\d{1,2}(?:\/\d{2,4})?(?:\s*\(.*\))?$/.test(line)) continue;

    // Header: (6:30/5oz & nursed) or (7/7:30)
    const headerMatch = line.match(/^\(([^)]+)\)$/);
    if (headerMatch) {
      const inner = headerMatch[1];
      const parts = inner.split("/");
      wakeTime = parts[0]?.trim() ?? null;
      morningFeed = parts.slice(1).join("/").trim() || null;
      continue;
    }

    // Section labels at footer
    let sectioned = false;
    for (const { key, re } of SECTION_LABELS) {
      const m = line.match(re);
      if (m) {
        events.push({ type: key as ParsedEvent["type"], description: m[1].trim() } as ParsedEvent);
        sectioned = true;
        break;
      }
    }
    if (sectioned) continue;

    // Nap range on same line: "8:17 down; 9:03 up"
    const range = line.match(RANGE_RE);
    if (range) {
      const start = inferDateTime(reportDate, range[1], cursor);
      const end = inferDateTime(reportDate, range[2], cursor);
      const noteMatch = line.replace(RANGE_RE, "").replace(/^[\s;,.]+|[\s;,.]+$/g, "");
      events.push({
        type: "nap",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        notes: noteMatch || null,
      });
      continue;
    }

    // Otherwise, line must start with a time
    const tMatch = line.match(/^(\d{1,2}:\d{2})\s*(.*)$/);
    if (!tMatch) {
      // Could be a continuation line; flag
      unparsed.push(line);
      continue;
    }
    const time = tMatch[1];
    const rest = tMatch[2].trim();
    const when = inferDateTime(reportDate, time, cursor);

    // Bare "down" or "up"
    if (NAP_START_TOKENS.test(rest) && !NAP_END_TOKENS.test(rest)) {
      events.push({ type: "nap", start_time: when.toISOString(), end_time: null, notes: rest });
      continue;
    }
    if (NAP_END_TOKENS.test(rest) && !NAP_START_TOKENS.test(rest)) {
      // Attach to most recent open nap
      const openNap = [...events].reverse().find(e => e.type === "nap" && !("end_time" in e ? e.end_time : null));
      if (openNap && openNap.type === "nap") {
        openNap.end_time = when.toISOString();
        if (rest) openNap.notes = [openNap.notes, rest].filter(Boolean).join(" | ");
      } else {
        events.push({ type: "note", time: when.toISOString(), text: rest });
      }
      continue;
    }

    // Feed
    const feed = rest.match(FEED_RE);
    if (feed) {
      const oz = parseFloat(feed[1]);
      const kind = feed[2].toLowerCase();
      let method: "bottle_breastmilk" | "bottle_formula" | "bottle_mixed" | "other" = "other";
      if (/breast\s*milk|breastmilk/.test(kind)) method = "bottle_breastmilk";
      else if (/formula/.test(kind)) method = "bottle_formula";
      else if (/mixed/.test(kind)) method = "bottle_mixed";
      events.push({ type: "feed", time: when.toISOString(), method, oz });
      continue;
    }
    if (NURSED_RE.test(rest)) {
      events.push({ type: "feed", time: when.toISOString(), method: "nursed", oz: null });
      continue;
    }

    // Diaper
    const dpMatches = rest.match(DIAPER_RE);
    if (dpMatches && !OUTING_TOKENS.test(rest) && !MED_TOKENS.test(rest)) {
      const set = new Set(dpMatches.map(x => x.toLowerCase()));
      events.push({
        type: "diaper",
        time: when.toISOString(),
        wet: set.has("wet"),
        bm: set.has("bm") || set.has("dirty") || set.has("poop"),
        dry: set.has("dry"),
      });
      continue;
    }

    // Medication
    if (MED_TOKENS.test(rest)) {
      const mName = rest.match(MED_TOKENS)?.[1] ?? "medication";
      events.push({ type: "medication", time: when.toISOString(), name: mName, notes: rest });
      continue;
    }

    // Outing
    if (OUTING_TOKENS.test(rest)) {
      events.push({ type: "outing", time: when.toISOString(), description: rest });
      continue;
    }

    // Fallback: time-stamped freeform note (still useful, low confidence)
    events.push({ type: "note", time: when.toISOString(), text: rest });
  }

  // Confidence heuristic: ratio of structured events to total parsed lines.
  const structuredCount = events.filter(e =>
    e.type === "nap" || e.type === "feed" || e.type === "diaper" || e.type === "outing"
  ).length;
  const totalLines = lines.length;
  const baseConfidence = totalLines === 0 ? 0 : Math.min(1, structuredCount / Math.max(1, totalLines - 5));
  const confidence = Math.max(0.4, Math.min(1, baseConfidence));

  if (unparsed.length > 0) flags.push(`unparsed_lines:${unparsed.length}`);

  return {
    parsed: {
      date: reportDate.toISOString().slice(0, 10),
      wake_time: wakeTime,
      morning_feed: morningFeed,
      events,
      handoff_note: null,
      summary: null,
      confidence,
      flags,
    },
    unparsedLines: unparsed,
  };
}
