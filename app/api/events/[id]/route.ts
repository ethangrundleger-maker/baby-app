import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await supa.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
