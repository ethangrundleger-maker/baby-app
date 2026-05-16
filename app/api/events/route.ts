import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const Body = z.object({
  child_id: z.string().uuid(),
  type: z.enum(["nap","feed","diaper","outing","milestone","song","book","sensory","sign","medication","mood","handoff_note","note"]),
  occurred_at: z.string(),
  ended_at: z.string().nullable().optional(),
  feed_method: z.enum(["breast","bottle_breastmilk","bottle_formula","bottle_mixed","solids","nursed","other"]).nullable().optional(),
  feed_oz: z.number().nullable().optional(),
  feed_foods: z.array(z.string()).nullable().optional(),
  diaper_wet: z.boolean().nullable().optional(),
  diaper_bm: z.boolean().nullable().optional(),
  diaper_dry: z.boolean().nullable().optional(),
  med_name: z.string().nullable().optional(),
  med_dose: z.string().nullable().optional(),
  nap_location: z.string().nullable().optional(),
  nap_quality: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "bad_request", details: body.error.flatten() }, { status: 400 });

  const { error, data } = await supa.from("events").insert({
    ...body.data,
    created_by_user_id: user.id,
  }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
