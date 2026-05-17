import { NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { parseDailyReport } from "@/lib/parser";
import { persistParsedDay } from "@/lib/parser/persist";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { MODEL_EXTRACT } from "@/lib/anthropic/client";
import { sendPushToFamily } from "@/lib/push";
import { getCurrentChild } from "@/lib/auth";

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

/** Durable per-user rate limit via Supabase. Prune is scoped to the caller
 *  so concurrent requests don't fight for the same DELETE (round-2 P1-B). */
async function rateLimit(userId: string, kind: string): Promise<boolean> {
  const db = supabaseAdmin();
  const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  await db.from("rate_events").delete()
    .eq("user_id", userId).eq("kind", kind).lt("created_at", cutoff);
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

  // Resolve target child: if the request didn't specify one, use whichever
  // baby is currently selected via the cookie. Then verify membership in
  // that child's family — works correctly for users in multiple families.
  let childId = parsed.data.child_id;
  if (!childId) {
    const current = await getCurrentChild();
    if (!current) return NextResponse.json({ error: "no_child" }, { status: 400 });
    childId = current.id;
  }

  const { data: child } = await supa
    .from("children")
    .select("id, family_id, families!inner(timezone)")
    .eq("id", childId)
    .maybeSingle();
  if (!child) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const familyId = (child as { family_id: string }).family_id;

  const { data: membership } = await supa
    .from("family_members")
    .select("family_id, display_name, role")
    .eq("user_id", user.id)
    .eq("family_id", familyId)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  // Preview is read-only; full save (which writes events) requires a writer role.
  if (!preview && (membership as { role: string }).role === "viewer") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const fams = (child as { families: unknown }).families;
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
