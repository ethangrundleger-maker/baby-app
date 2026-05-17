import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const invite = (url.searchParams.get("invite") ?? "").trim();
  const name = (url.searchParams.get("name") ?? "Member").slice(0, 80);
  // Role is intentionally NOT read from the URL. It is derived from which
  // invite code matched in the families table. (Round-2 P0-B fix.)

  if (code) {
    const supa = await supabaseServer();
    const { error } = await supa.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin));
  }

  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", url.origin));

  // Password reset flow: the user clicked the email link; now show the
  // "set a new password" form. The session is live so updateUser will work.
  if (url.searchParams.get("reset") === "1") {
    return NextResponse.redirect(new URL("/auth/set-password", url.origin));
  }

  if (!invite) return NextResponse.redirect(new URL("/today", url.origin));
  if (invite === "changeme") {
    return NextResponse.redirect(new URL("/login?error=invite_is_placeholder", url.origin));
  }

  const admin = supabaseAdmin();
  // Match the invite against either the parent code or the nanny code; role
  // follows which column matched. If neither matches → reject.
  const { data: famByParent } = await admin
    .from("families").select("id").eq("invite_code", invite).maybeSingle();
  const { data: famByNanny } = famByParent ? { data: null }
    : await admin.from("families").select("id").eq("nanny_invite_code", invite).maybeSingle();

  const fam = famByParent ?? famByNanny;
  const derivedRole: "parent" | "nanny" = famByParent ? "parent" : "nanny";

  if (!fam) {
    return NextResponse.redirect(new URL("/login?error=invalid_invite", url.origin));
  }

  // Insert membership if the user isn't already a member. We deliberately do
  // NOT overwrite an existing row: if a parent has their account, a later
  // click on a nanny invite link must not silently demote them to nanny
  // (round-3 P3-1).
  await admin.from("family_members").upsert({
    family_id: fam.id, user_id: user.id, display_name: name, role: derivedRole,
  }, { onConflict: "family_id,user_id", ignoreDuplicates: true });

  return NextResponse.redirect(new URL("/today", url.origin));
}
