"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getMyChildren } from "@/lib/auth";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";

const COOKIE = "selected_child_id";
// 180 days — matches the "stay signed in" expectation.
const MAX_AGE = 60 * 60 * 24 * 180;

export async function selectChild(childId: string): Promise<{ ok: boolean; error?: string }> {
  const children = await getMyChildren();
  if (!children.find((c) => c.id === childId)) {
    return { ok: false, error: "not_authorized" };
  }
  const store = await cookies();
  store.set(COOKIE, childId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Join an additional family by invite code. Mirrors the /auth/callback
 *  invite-binding logic — role is derived from which code (parent vs nanny)
 *  matched. Used by users who are already members of one family and need
 *  to add another (e.g. nanny share). */
export async function joinFamily(input: {
  invite_code: string;
  display_name: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };
  const code = (input.invite_code || "").trim();
  if (!code) return { ok: false, error: "code_required" };
  if (code === "changeme") return { ok: false, error: "invalid_invite" };
  const name = (input.display_name || "").trim().slice(0, 80) || "Member";

  const admin = supabaseAdmin();
  const { data: famByParent } = await admin
    .from("families").select("id").eq("invite_code", code).maybeSingle();
  const { data: famByNanny } = famByParent ? { data: null }
    : await admin.from("families").select("id").eq("nanny_invite_code", code).maybeSingle();
  const fam = famByParent ?? famByNanny;
  if (!fam) return { ok: false, error: "invalid_invite" };
  const role: "parent" | "nanny" = famByParent ? "parent" : "nanny";

  // ignoreDuplicates so a re-submit doesn't downgrade an existing role.
  await admin.from("family_members").upsert({
    family_id: (fam as { id: string }).id,
    user_id: user.id,
    display_name: name,
    role,
  }, { onConflict: "family_id,user_id", ignoreDuplicates: true });

  revalidatePath("/", "layout");
  return { ok: true };
}
