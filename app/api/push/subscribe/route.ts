import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const Body = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
  user_agent: z.string().optional(),
});

export async function POST(req: Request) {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const { data: membership } = await supa
    .from("family_members").select("family_id").eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership) return NextResponse.json({ error: "no_family" }, { status: 403 });

  const { error } = await supa.from("push_subscriptions").upsert({
    user_id: user.id,
    family_id: membership.family_id,
    endpoint: body.data.endpoint,
    p256dh: body.data.keys.p256dh,
    auth: body.data.keys.auth,
    user_agent: body.data.user_agent ?? null,
  }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { endpoint } = await req.json().catch(() => ({ endpoint: null }));
  if (!endpoint) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  await supa.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
