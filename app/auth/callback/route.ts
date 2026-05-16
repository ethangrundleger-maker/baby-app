import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const invite = url.searchParams.get("invite") ?? "";
  const name = url.searchParams.get("name") ?? "Member";
  const role = (url.searchParams.get("role") as "parent" | "nanny" | "viewer") || "parent";

  if (code) {
    const supa = await supabaseServer();
    const { error } = await supa.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin));
  }

  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", url.origin));

  // Join family if invite provided + not already a member
  if (invite) {
    const admin = supabaseAdmin();
    const { data: fam } = await admin.from("families").select("id").eq("invite_code", invite).maybeSingle();
    if (fam) {
      await admin.from("family_members").upsert({
        family_id: fam.id, user_id: user.id, display_name: name, role,
      }, { onConflict: "family_id,user_id" });
    }
  }
  return NextResponse.redirect(new URL("/today", url.origin));
}
