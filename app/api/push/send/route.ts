import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { sendPushToFamily } from "@/lib/push";

const Body = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(280),
  // Only allow relative same-origin paths — prevents push-driven open-redirect.
  url: z.string().regex(/^\/[a-zA-Z0-9/_\-?=&%.]*$/).optional(),
});

export async function POST(req: Request) {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const { data: membership } = await supa
    .from("family_members").select("family_id, role").eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership) return NextResponse.json({ error: "no_family" }, { status: 403 });
  if (membership.role === "viewer") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const result = await sendPushToFamily(membership.family_id, body.data);
  return NextResponse.json(result);
}
