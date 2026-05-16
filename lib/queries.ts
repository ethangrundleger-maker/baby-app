import { fromZonedTime } from "date-fns-tz";
import { supabaseServer } from "./supabase/server";
import type { DBEvent, DBDailyReport } from "./supabase/types";

export async function getDayEvents(childId: string, dateISO: string, tz: string) {
  const supa = await supabaseServer();
  // Day window in family TZ → UTC. (P0-2 fix.)
  const startUtc = fromZonedTime(`${dateISO}T00:00:00`, tz);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
  const { data: events } = await supa
    .from("events").select("*")
    .eq("child_id", childId)
    .gte("occurred_at", startUtc.toISOString())
    .lt("occurred_at", endUtc.toISOString())
    .order("occurred_at", { ascending: true });
  const { data: report } = await supa
    .from("daily_reports").select("*")
    .eq("child_id", childId).eq("report_date", dateISO).maybeSingle();
  return { events: (events ?? []) as DBEvent[], report: report as DBDailyReport | null };
}

export async function getLastNapAndFeed(childId: string) {
  const supa = await supabaseServer();
  const [{ data: lastNap }, { data: lastFeed }, { data: lastDiaper }] = await Promise.all([
    supa.from("events").select("*").eq("child_id", childId).eq("type", "nap").order("occurred_at", { ascending: false }).limit(1).maybeSingle(),
    supa.from("events").select("*").eq("child_id", childId).eq("type", "feed").order("occurred_at", { ascending: false }).limit(1).maybeSingle(),
    supa.from("events").select("*").eq("child_id", childId).eq("type", "diaper").order("occurred_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return {
    lastNap: lastNap as DBEvent | null,
    lastFeed: lastFeed as DBEvent | null,
    lastDiaper: lastDiaper as DBEvent | null,
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
