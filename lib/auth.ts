import { supabaseServer, supabaseAdmin } from "./supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { cache } from "react";

export interface FamilyInfo {
  id: string;
  name: string;
  timezone: string;
  invite_code: string;
  nanny_invite_code: string | null;
}

export interface MembershipInfo {
  family: FamilyInfo;
  display_name: string;
  role: "parent" | "nanny" | "viewer";
}

export interface CurrentFamily {
  family_id: string;
  display_name: string;
  role: "parent" | "nanny" | "viewer";
  family: { id: string; name: string; timezone: string };
}

export interface ChildInfo {
  id: string;
  family_id: string;
  name: string;
  dob: string | null;
  notes: string | null;
}

export interface ChildWithFamily extends ChildInfo {
  family: FamilyInfo;
}

const SELECTED_CHILD_COOKIE = "selected_child_id";

export async function requireUser() {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

export async function isAppAdmin(): Promise<boolean> {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  // app_metadata is service-role-only — users cannot self-elevate.
  return user?.app_metadata?.is_admin === true;
}

export const getMyMemberships = cache(async function _getMyMemberships(): Promise<MembershipInfo[]> {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return [];
  const { data } = await supa
    .from("family_members")
    .select("display_name, role, families!inner(id, name, timezone, invite_code, nanny_invite_code)")
    .eq("user_id", user.id);
  const real: MembershipInfo[] = (data ?? []).map((row) => {
    const fams = (row as { families: unknown }).families;
    const fam = Array.isArray(fams) ? fams[0] : fams;
    return {
      family: fam as FamilyInfo,
      display_name: (row as { display_name: string }).display_name,
      role: (row as { role: "parent" | "nanny" | "viewer" }).role,
    };
  });

  // Admins should see every family/baby they manage. To keep RLS-bound
  // queries (events, daily_reports) returning data for those families, we
  // upsert real "viewer" memberships for the admin in any family they're
  // not already a member of. Idempotent on (family_id, user_id).
  if (user.app_metadata?.is_admin === true) {
    const admin = supabaseAdmin();
    const { data: allFams } = await admin
      .from("families")
      .select("id, name, timezone, invite_code, nanny_invite_code");
    const realIds = new Set(real.map((m) => m.family.id));
    const adminName = (user.user_metadata?.display_name as string | undefined) || user.email?.split("@")[0] || "Admin";
    const missing = (allFams ?? []).filter((f) => !realIds.has((f as FamilyInfo).id));
    if (missing.length > 0) {
      await admin.from("family_members").upsert(
        missing.map((f) => ({
          family_id: (f as FamilyInfo).id,
          user_id: user.id,
          display_name: adminName,
          role: "viewer" as const,
        })),
        { onConflict: "family_id,user_id", ignoreDuplicates: true },
      );
      missing.forEach((f) => {
        real.push({ family: f as FamilyInfo, display_name: adminName, role: "viewer" });
      });
    }
  }

  return real;
});

export const getMyChildren = cache(async function _getMyChildren(): Promise<ChildWithFamily[]> {
  const memberships = await getMyMemberships();
  if (memberships.length === 0) return [];
  const familyIds = memberships.map((m) => m.family.id);

  const supa = await supabaseServer();
  const { data } = await supa
    .from("children")
    .select("id, family_id, name, dob, notes")
    .in("family_id", familyIds)
    .order("created_at", { ascending: true });
  if (!data) return [];
  const famById = new Map(memberships.map((m) => [m.family.id, m.family]));
  return data
    .map((c) => ({
      ...(c as ChildInfo),
      family: famById.get((c as ChildInfo).family_id)!,
    }))
    .filter((c) => c.family);
});

/** Currently-selected child, validated against the user's memberships.
 *  Falls back to the first available child if no cookie or stale cookie. */
export const getCurrentChild = cache(async function _getCurrentChild(): Promise<ChildWithFamily | null> {
  const children = await getMyChildren();
  if (children.length === 0) return null;
  const cookieStore = await cookies();
  const selected = cookieStore.get(SELECTED_CHILD_COOKIE)?.value;
  const match = selected ? children.find((c) => c.id === selected) : null;
  return match ?? children[0];
});

export const getCurrentFamily = cache(async function _getCurrentFamily(): Promise<CurrentFamily | null> {
  const child = await getCurrentChild();
  if (!child) return null;
  const memberships = await getMyMemberships();
  const m = memberships.find((mm) => mm.family.id === child.family_id);
  if (!m) return null;
  return {
    family_id: m.family.id,
    display_name: m.display_name,
    role: m.role,
    family: { id: m.family.id, name: m.family.name, timezone: m.family.timezone },
  };
});

/** Used by API routes to authorize a write against a specific child:
 *  the user must be a member of that child's family with a writing role. */
export async function authorizeChildWrite(childId: string): Promise<
  | { ok: true; familyId: string; tz: string; role: "parent" | "nanny" }
  | { ok: false; status: number; error: string }
> {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false, status: 401, error: "unauthorized" };

  const { data: child } = await supa
    .from("children")
    .select("id, family_id, families!inner(timezone)")
    .eq("id", childId)
    .maybeSingle();
  if (!child) return { ok: false, status: 403, error: "forbidden" };

  const { data: mem } = await supa
    .from("family_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("family_id", (child as { family_id: string }).family_id)
    .maybeSingle();
  if (!mem) return { ok: false, status: 403, error: "forbidden" };
  if ((mem as { role: string }).role === "viewer") {
    return { ok: false, status: 403, error: "forbidden" };
  }

  const fams = (child as { families: unknown }).families;
  const famObj = Array.isArray(fams) ? fams[0] : fams;
  const tz = (famObj && typeof famObj === "object" && "timezone" in famObj
    ? (famObj as { timezone: string }).timezone : null) || "America/New_York";

  return {
    ok: true,
    familyId: (child as { family_id: string }).family_id,
    tz,
    role: (mem as { role: "parent" | "nanny" }).role,
  };
}
