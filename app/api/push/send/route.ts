import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { sendPushToFamily } from "@/lib/push";
import { getCurrentFamily } from "@/lib/auth";

const Body = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(280),
  // Same-origin relative paths only. First char after the leading "/" must
  // NOT be "/" — otherwise "//evil.com/..." would be accepted as a
  // protocol-relative redirect (round-3 P1-1).
  url: z.string().regex(/^\/(?:[a-zA-Z0-9_\-.?=&%][a-zA-Z0-9/_\-?=&%.]*)?$/).optional(),
});

export async function POST(req: Request) {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const fam = await getCurrentFamily();
  if (!fam) return NextResponse.json({ error: "no_family" }, { status: 403 });
  if (fam.role === "viewer") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const result = await sendPushToFamily(fam.family_id, body.data);
  return NextResponse.json(result);
}
