import { NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { parseDailyReport } from "@/lib/parser";
import { persistParsedDay } from "@/lib/parser/persist";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { MODEL_EXTRACT } from "@/lib/anthropic/client";
import { sendPushToFamily } from "@/lib/push";

const Body = z.object({
  raw: z.string().min(1).max(20000),
  report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  source: z.enum(["nanny_paste", "parent_paste", "manual"]).default("parent_paste"),
  child_id: z.string().uuid().optional(),
  replace_existing: z.boolean().default(true),
  preview: z.boolean().default(false),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;

/** Durable per-user rate limit via Supabase (P1-3 fix). */
async function rateLimit(userId: string, kind: string): Promise<boolean> {
  const db = supabaseAdmin();
  const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  // Prune old + count current
  await db.from("rate_events").delete().lt("created_at", cutoff);
  const { count } = await db
    .from("rate_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId).eq("kind", kind);
  if ((count ?? 0) >= RATE_LIMIT_MAX) return false;
  await db.from("rate_events").insert({ user_id: userId, kind });
  return true;
}

export async function POST(req: Request) {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await rateLimit(user.id, "parse"))) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { raw, report_date, source, preview, replace_existing } = parsed.data;

  const { data: membership } = await supa
    .from("family_members")
    .select("family_id, display_name, role, families!inner(timezone)")
    .eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership) return NextResponse.json({ error: "no_family" }, { status: 403 });

  let childId: string | undefined = parsed.data.child_id;
  if (!childId) {
    const { data: child } = await supa
      .from("children").select("id").eq("family_id", membership.family_id).limit(1).maybeSingle();
    if (!child) return NextResponse.json({ error: "no_child" }, { status: 400 });
    childId = child.id as string;
  }
  if (!childId) return NextResponse.json({ error: "no_child" }, { status: 400 });

  const fams = (membership as { families: unknown }).families;
  const famObj = Array.isArray(fams) ? fams[0] : fams;
  const timezone = (famObj && typeof famObj === "object" && "timezone" in famObj
    ? (famObj as { timezone: string }).timezone : null) || "America/New_York";
  const reportDate = new Date(report_date + "T12:00:00Z");

  const result = await parseDailyReport({ raw, reportDate, timezone });

  if (preview) {
    return NextResponse.json({
      parsed: result.parsed, source: result.source, summary: result.summary,
    });
  }

  const { reportId } = await persistParsedDay({
    parsed: result.parsed,
    rawText: raw,
    childId,
    authorUserId: user.id,
    authorDisplayName: membership.display_name,
    source,
    summary: result.summary,
    parseModel: result.source === "heuristic" ? "heuristic" : MODEL_EXTRACT,
    replaceExisting: replace_existing,
    timezone,
  });

  // Notify family — runs after response so the user isn't blocked, but
  // queued via `after()` so the lambda doesn't freeze first (P2-2 fix).
  if (source === "nanny_paste") {
    after(async () => {
      try {
        await sendPushToFamily(membership.family_id, {
          title: `New report from ${membership.display_name}`,
          body: result.summary?.slice(0, 140) ?? "Tap to view today's timeline.",
          url: `/today`,
        });
      } catch {
        // best-effort; push subscriptions get cleaned up inside sendPushToFamily
      }
    });
  }

  return NextResponse.json({
    report_id: reportId,
    parsed: result.parsed,
    source: result.source,
    summary: result.summary,
  });
}
