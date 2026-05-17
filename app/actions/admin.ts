"use server";

import { revalidatePath } from "next/cache";
import { isAppAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

function randomCode(): string {
  // 12 hex chars — short enough to text, hard enough to guess.
  return randomBytes(6).toString("hex");
}

const TZ_RE = /^[A-Za-z]+\/[A-Za-z_+\-0-9]+$/;

export async function createFamily(input: {
  name: string;
  timezone?: string;
}): Promise<{ ok: boolean; error?: string; family_id?: string }> {
  if (!(await isAppAdmin())) return { ok: false, error: "forbidden" };
  const name = (input.name || "").trim().slice(0, 80);
  if (!name) return { ok: false, error: "name_required" };
  const tz = (input.timezone || "America/New_York").trim();
  if (!TZ_RE.test(tz)) return { ok: false, error: "bad_timezone" };

  const admin = supabaseAdmin();
  // Retry up to 3x if the random codes happen to collide.
  for (let attempt = 0; attempt < 3; attempt++) {
    const invite_code = randomCode();
    const nanny_invite_code = randomCode();
    if (invite_code === nanny_invite_code) continue;
    const { data, error } = await admin
      .from("families")
      .insert({ name, timezone: tz, invite_code, nanny_invite_code })
      .select("id")
      .maybeSingle();
    if (!error && data) {
      revalidatePath("/settings");
      return { ok: true, family_id: (data as { id: string }).id };
    }
    if (error && !/duplicate|unique/i.test(error.message)) {
      return { ok: false, error: error.message };
    }
  }
  return { ok: false, error: "code_collision" };
}

export async function createChild(input: {
  family_id: string;
  name: string;
  dob?: string | null;
  notes?: string | null;
}): Promise<{ ok: boolean; error?: string; child_id?: string }> {
  if (!(await isAppAdmin())) return { ok: false, error: "forbidden" };
  const name = (input.name || "").trim().slice(0, 80);
  if (!name) return { ok: false, error: "name_required" };
  if (!input.family_id) return { ok: false, error: "family_required" };
  const dob = input.dob && /^\d{4}-\d{2}-\d{2}$/.test(input.dob) ? input.dob : null;
  const notes = (input.notes || "").trim().slice(0, 500) || null;

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("children")
    .insert({ family_id: input.family_id, name, dob, notes })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  return { ok: true, child_id: (data as { id: string }).id };
}

export async function renameFamily(input: {
  family_id: string;
  name: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAppAdmin())) return { ok: false, error: "forbidden" };
  const name = (input.name || "").trim().slice(0, 80);
  if (!name) return { ok: false, error: "name_required" };
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("families")
    .update({ name })
    .eq("id", input.family_id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}
