import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { authorizeChildWrite } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  // Look up the event to derive its child, then enforce the same role check
  // as the create endpoint — RLS allows any family_member to delete, but
  // viewers (incl. synthetic admin-viewer in other families) must not be
  // able to wipe events from a household they only watch.
  const { data: ev } = await supa
    .from("events").select("id, child_id").eq("id", id).maybeSingle();
  if (!ev) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const auth = await authorizeChildWrite((ev as { child_id: string }).child_id);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { error } = await supa.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
