import { supabaseServer } from "./supabase/server";
import { redirect } from "next/navigation";

export interface CurrentFamily {
  family_id: string;
  display_name: string;
  role: "parent" | "nanny" | "viewer";
  family: { id: string; name: string; timezone: string };
}

export async function requireUser() {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

export async function getCurrentFamily(): Promise<CurrentFamily | null> {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return null;
  const { data } = await supa
    .from("family_members")
    .select("family_id, display_name, role, families!inner(id, name, timezone)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  // Supabase types the relation as an array even with !inner; normalize.
  const fams = (data as { families: unknown }).families;
  const fam = Array.isArray(fams) ? fams[0] : fams;
  if (!fam) return null;
  return {
    family_id: (data as { family_id: string }).family_id,
    display_name: (data as { display_name: string }).display_name,
    role: (data as { role: "parent" | "nanny" | "viewer" }).role,
    family: fam as { id: string; name: string; timezone: string },
  };
}

export async function getCurrentChild() {
  const supa = await supabaseServer();
  const fam = await getCurrentFamily();
  if (!fam) return null;
  const { data: child } = await supa
    .from("children")
    .select("*")
    .eq("family_id", fam.family_id)
    .limit(1)
    .maybeSingle();
  return child;
}
