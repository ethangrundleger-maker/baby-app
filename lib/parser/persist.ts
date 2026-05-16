import { fromZonedTime } from "date-fns-tz";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { ParsedDay, ParsedEvent } from "./schema";

interface PersistArgs {
  parsed: ParsedDay;
  rawText: string;
  childId: string;
  authorUserId: string | null;
  authorDisplayName: string;
  source: "nanny_paste" | "parent_paste" | "manual";
  summary: string | null;
  parseModel: string | null;
  replaceExisting: boolean;
  timezone: string;
}

const STRUCTURED = 0.95;
const FREEFORM = 0.5;

function eventRow(
  e: ParsedEvent,
  childId: string,
  reportId: string,
  evConfidence: number,
  authorUserId: string | null,
  footerAnchorUtc: string,
) {
  const base = {
    child_id: childId,
    report_id: reportId,
    type: e.type,
    confidence: evConfidence,
    flagged_for_review: evConfidence < 0.6,
    created_by_user_id: authorUserId,
  };
  switch (e.type) {
    case "nap":
      return { ...base, occurred_at: e.start_time, ended_at: e.end_time ?? null, notes: e.notes ?? null };
    case "feed":
      return {
        ...base, occurred_at: e.time, feed_method: e.method,
        feed_oz: e.oz ?? null, feed_foods: e.foods ?? null, notes: e.notes ?? null,
      };
    case "diaper":
      return { ...base, occurred_at: e.time, diaper_wet: e.wet, diaper_bm: e.bm, diaper_dry: e.dry, notes: e.notes ?? null };
    case "outing":
      return { ...base, occurred_at: e.time, ended_at: e.end_time ?? null, notes: e.description };
    case "medication":
      return { ...base, occurred_at: e.time, med_name: e.name, med_dose: e.dose ?? null, notes: e.notes ?? null };
    case "note":
      return { ...base, occurred_at: e.time ?? footerAnchorUtc, notes: e.text };
    case "milestone":
    case "song":
    case "book":
    case "sensory":
    case "sign":
    case "mood":
      // Footer events: stamp at end-of-day in family TZ so they belong to the
      // correct day in the timeline (P0-3 fix).
      return { ...base, occurred_at: footerAnchorUtc, notes: "description" in e ? e.description : null };
    default:
      return { ...base, occurred_at: footerAnchorUtc };
  }
}

export async function persistParsedDay(args: PersistArgs) {
  const db = supabaseAdmin();
  const { data: existing } = await db
    .from("daily_reports")
    .select("id")
    .eq("child_id", args.childId)
    .eq("report_date", args.parsed.date)
    .maybeSingle();

  let reportId: string;
  if (existing) {
    if (args.replaceExisting) {
      // Only delete parsed events tied to this report — preserve any manual
      // edits, even if added by parents later (P1-4 partial fix).
      await db.from("events").delete().eq("report_id", existing.id);
    }
    const { data: updated, error } = await db
      .from("daily_reports").update({
        author_user_id: args.authorUserId,
        author_display_name: args.authorDisplayName,
        source: args.source,
        raw_text: args.rawText,
        summary: args.summary,
        handoff_note: args.parsed.handoff_note ?? null,
        parse_confidence: args.parsed.confidence,
        parse_model: args.parseModel,
      })
      .eq("id", existing.id)
      .select("id").single();
    if (error) throw error;
    reportId = updated.id;
  } else {
    const { data: inserted, error } = await db
      .from("daily_reports").insert({
        child_id: args.childId,
        report_date: args.parsed.date,
        author_user_id: args.authorUserId,
        author_display_name: args.authorDisplayName,
        source: args.source,
        raw_text: args.rawText,
        summary: args.summary,
        handoff_note: args.parsed.handoff_note ?? null,
        parse_confidence: args.parsed.confidence,
        parse_model: args.parseModel,
      })
      .select("id").single();
    if (error) throw error;
    reportId = inserted.id;
  }

  // Anchor for footer events: 8pm local on the report date, in family TZ.
  const footerAnchorUtc = fromZonedTime(`${args.parsed.date}T20:00:00`, args.timezone).toISOString();

  const perEv = args.parsed.perEventConfidence ?? [];
  const rows = args.parsed.events.map((e, i) => {
    // Per-event confidence falls back to a typed default if Claude didn't supply.
    const conf = typeof perEv[i] === "number"
      ? perEv[i]
      : (e.type === "note" ? FREEFORM : STRUCTURED);
    return eventRow(e, args.childId, reportId, conf, args.authorUserId, footerAnchorUtc);
  });
  if (rows.length > 0) {
    const { error } = await db.from("events").insert(rows);
    if (error) throw error;
  }
  return { reportId };
}
