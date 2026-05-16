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
}

function eventRow(e: ParsedEvent, childId: string, reportId: string, parseConfidence: number) {
  const base = {
    child_id: childId,
    report_id: reportId,
    type: e.type,
    confidence: parseConfidence,
    flagged_for_review: parseConfidence < 0.6,
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
      return { ...base, occurred_at: e.time ?? new Date().toISOString(), notes: e.text };
    case "milestone":
    case "song":
    case "book":
    case "sensory":
    case "sign":
    case "mood":
      return { ...base, occurred_at: new Date().toISOString(), notes: "description" in e ? e.description : null };
    default:
      return { ...base, occurred_at: new Date().toISOString() };
  }
}

export async function persistParsedDay(args: PersistArgs) {
  const db = supabaseAdmin();
  // Upsert daily_report — one per (child, day). If exists, optionally wipe events for that report.
  const { data: existing } = await db
    .from("daily_reports")
    .select("id")
    .eq("child_id", args.childId)
    .eq("report_date", args.parsed.date)
    .maybeSingle();

  let reportId: string;
  if (existing) {
    if (args.replaceExisting) {
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

  // Insert events
  const rows = args.parsed.events.map(e => eventRow(e, args.childId, reportId, args.parsed.confidence));
  if (rows.length > 0) {
    const { error } = await db.from("events").insert(rows);
    if (error) throw error;
  }
  return { reportId };
}
