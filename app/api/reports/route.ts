import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const childId = url.searchParams.get("child_id");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!childId) return NextResponse.json({ error: "child_id required" }, { status: 400 });

  let q = supa.from("daily_reports").select("*").eq("child_id", childId).order("report_date", { ascending: false });
  if (from) q = q.gte("report_date", from);
  if (to) q = q.lte("report_date", to);
  const { data, error } = await q.limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data });
}
