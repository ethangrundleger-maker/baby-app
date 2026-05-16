import { NextResponse } from "next/server";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { supabaseServer } from "@/lib/supabase/server";

const FeedMethod = z.enum([
  "breast", "bottle_breastmilk", "bottle_formula", "bottle_mixed", "solids", "nursed", "other",
]);

const Body = z.object({
  child_id: z.string().uuid(),
  type: z.enum([
    "nap", "feed", "diaper", "outing", "milestone",
    "song", "book", "sensory", "sign", "medication",
    "mood", "note",
  ]),
  // YYYY-MM-DD in family TZ — the day this event belongs to.
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // HH:MM 24h in family TZ.
  time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  feed_method: FeedMethod.nullable().optional(),
  feed_oz: z.number().min(0).max(20).nullable().optional(),
  diaper_wet: z.boolean().nullable().optional(),
  diaper_bm: z.boolean().nullable().optional(),
  diaper_dry: z.boolean().nullable().optional(),
  med_name: z.string().max(80).nullable().optional(),
  med_dose: z.string().max(80).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export async function POST(req: Request) {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "bad_request", details: body.error.flatten() }, { status: 400 });
  }

  // Family + child scope check (matches parse route's IDOR guard).
  const { data: membership } = await supa
    .from("family_members")
    .select("family_id, role, families!inner(timezone)")
    .eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership) return NextResponse.json({ error: "no_family" }, { status: 403 });
  if (membership.role === "viewer") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: child } = await supa
    .from("children").select("id, family_id").eq("id", body.data.child_id).maybeSingle();
  if (!child || child.family_id !== membership.family_id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const fams = (membership as { families: unknown }).families;
  const famObj = Array.isArray(fams) ? fams[0] : fams;
  const tz = (famObj && typeof famObj === "object" && "timezone" in famObj
    ? (famObj as { timezone: string }).timezone : null) || "America/New_York";

  // Resolve date+time in family TZ → UTC (fixes auto-refresh / out-of-day-window bug).
  const occurredAt = fromZonedTime(`${body.data.date}T${body.data.time}:00`, tz);
  const endedAt = body.data.end_time
    ? fromZonedTime(`${body.data.date}T${body.data.end_time}:00`, tz)
    : null;

  const row = {
    child_id: body.data.child_id,
    type: body.data.type,
    occurred_at: occurredAt.toISOString(),
    ended_at: endedAt ? endedAt.toISOString() : null,
    feed_method: body.data.feed_method ?? null,
    feed_oz: body.data.feed_oz ?? null,
    diaper_wet: body.data.diaper_wet ?? null,
    diaper_bm: body.data.diaper_bm ?? null,
    diaper_dry: body.data.diaper_dry ?? null,
    med_name: body.data.med_name ?? null,
    med_dose: body.data.med_dose ?? null,
    notes: body.data.notes ?? null,
    confidence: 1.0,
    flagged_for_review: false,
    created_by_user_id: user.id,
  };

  const { data: inserted, error } = await supa
    .from("events").insert(row).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: inserted.id });
}
