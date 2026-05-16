import { supabaseServer } from "./supabase/server";
import type { DBEvent, DBDailyReport } from "./supabase/types";

export async function getDayEvents(childId: string, dateISO: string) {
  const supa = await supabaseServer();
  // Day window in family TZ — start of day to start of next day. We store UTC.
  // We approximate the window by report_date matching + small overlap window for events whose UTC date drifts.
  // Simpler: get events for the report, plus 4am-next-day overlap.
  const start = new Date(`${dateISO}T00:00:00`);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  const { data: events } = await supa
    .from("events").select("*")
    .eq("child_id", childId)
    .gte("occurred_at", start.toISOString())
    .lt("occurred_at", end.toISOString())
    .order("occurred_at", { ascending: true });
  const { data: report } = await supa
    .from("daily_reports").select("*")
    .eq("child_id", childId).eq("report_date", dateISO).maybeSingle();
  return { events: (events ?? []) as DBEvent[], report: report as DBDailyReport | null };
}

export async function getLastNapAndFeed(childId: string) {
  const supa = await supabaseServer();
  const [{ data: lastNap }, { data: lastFeed }, { data: lastDiaper }, { data: lastMed }] = await Promise.all([
    supa.from("events").select("*").eq("child_id", childId).eq("type", "nap").order("occurred_at", { ascending: false }).limit(1).maybeSingle(),
    supa.from("events").select("*").eq("child_id", childId).eq("type", "feed").order("occurred_at", { ascending: false }).limit(1).maybeSingle(),
    supa.from("events").select("*").eq("child_id", childId).eq("type", "diaper").order("occurred_at", { ascending: false }).limit(1).maybeSingle(),
    supa.from("events").select("*").eq("child_id", childId).eq("type", "medication").order("occurred_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return {
    lastNap: lastNap as DBEvent | null,
    lastFeed: lastFeed as DBEvent | null,
    lastDiaper: lastDiaper as DBEvent | null,
    lastMed: lastMed as DBEvent | null,
  };
}

export async function getRecentDays(childId: string, days = 14) {
  const supa = await supabaseServer();
  const since = new Date(); since.setDate(since.getDate() - days);
  const { data: events } = await supa
    .from("events").select("*")
    .eq("child_id", childId)
    .gte("occurred_at", since.toISOString())
    .order("occurred_at", { ascending: true });
  return (events ?? []) as DBEvent[];
}
