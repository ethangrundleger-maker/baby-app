import Link from "next/link";
import { getCurrentChild, getCurrentFamily } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const fam = await getCurrentFamily();
  const child = await getCurrentChild();
  if (!fam || !child) return <div className="py-8 text-muted">No family/child found.</div>;
  const tz = fam.family.timezone;
  const supa = await supabaseServer();
  const { data: reports } = await supa
    .from("daily_reports").select("id, report_date, author_display_name, summary, source, parse_confidence")
    .eq("child_id", child.id).order("report_date", { ascending: false }).limit(60);

  return (
    <div className="pt-2 pb-24 space-y-3">
      <h2 className="text-2xl font-semibold">History</h2>
      {(!reports || reports.length === 0) && (
        <p className="text-muted">No reports yet.</p>
      )}
      <ul className="space-y-2">
        {(reports ?? []).map(r => (
          <li key={r.id}>
            <Link href={`/history/${r.report_date}`}
              className="block rounded-xl bg-surface p-3 shadow-card hover:bg-surface2">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{fmtDate(`${r.report_date}T12:00:00Z`, tz)}</span>
                <span className="text-xs text-muted">{r.source} · {Math.round((r.parse_confidence ?? 0) * 100)}%</span>
              </div>
              <p className="text-sm text-muted line-clamp-2 mt-1">{r.summary ?? "—"}</p>
              <p className="text-xs text-muted mt-1">By {r.author_display_name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
