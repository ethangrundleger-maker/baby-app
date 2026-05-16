import type { DBEvent } from "@/lib/supabase/types";
import { fmtTime, fmtDuration } from "@/lib/utils";

const TYPE_META: Record<string, { label: string; cls: string; emoji: string }> = {
  nap: { label: "Nap", cls: "border-sleep/40 bg-sleep/10", emoji: "😴" },
  feed: { label: "Feed", cls: "border-feed/40 bg-feed/10", emoji: "🍼" },
  diaper: { label: "Diaper", cls: "border-diaper/40 bg-diaper/10", emoji: "🧷" },
  outing: { label: "Outing", cls: "border-outing/40 bg-outing/10", emoji: "🚶" },
  medication: { label: "Medication", cls: "border-warn/40 bg-warn/10", emoji: "💊" },
  milestone: { label: "Milestone", cls: "border-accent/40 bg-accent/10", emoji: "🌟" },
  song: { label: "Songs", cls: "border-accent/30 bg-accent/5", emoji: "🎵" },
  book: { label: "Books", cls: "border-accent/30 bg-accent/5", emoji: "📖" },
  sensory: { label: "Sensory", cls: "border-accent/30 bg-accent/5", emoji: "✨" },
  sign: { label: "Signs", cls: "border-accent/30 bg-accent/5", emoji: "👋" },
  mood: { label: "Mood", cls: "border-accent/30 bg-accent/5", emoji: "🫶" },
  note: { label: "Note", cls: "border-white/10 bg-surface", emoji: "📝" },
  handoff_note: { label: "Handoff", cls: "border-accent/40 bg-accent/10", emoji: "🤝" },
};

function describeEvent(e: DBEvent): string {
  switch (e.type) {
    case "nap": {
      const dur = e.ended_at ? fmtDuration(new Date(e.ended_at).getTime() - new Date(e.occurred_at).getTime()) : "still down";
      return `Nap · ${dur}${e.notes ? ` — ${e.notes}` : ""}`;
    }
    case "feed":
      return e.feed_method === "nursed"
        ? "Nursed"
        : `${e.feed_oz ?? "?"} oz ${e.feed_method?.replace("bottle_", "").replace("_", " ") ?? ""}`.trim();
    case "diaper":
      return [e.diaper_wet && "wet", e.diaper_bm && "bm", e.diaper_dry && "dry"].filter(Boolean).join(" + ") || "diaper";
    case "outing": return e.notes ?? "outing";
    case "medication": return [e.med_name, e.med_dose].filter(Boolean).join(" · ");
    default: return e.notes ?? TYPE_META[e.type]?.label ?? e.type;
  }
}

export function Timeline({ events, timezone }: { events: DBEvent[]; timezone: string }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl bg-surface p-6 text-center text-muted shadow-card">
        No events yet for this day. Paste a report from the Paste tab.
      </div>
    );
  }
  // Group consecutive footer-style events
  const footerTypes = new Set(["song", "book", "sensory", "sign", "milestone", "mood"]);
  const timeline = events.filter(e => !footerTypes.has(e.type));
  const footers = events.filter(e => footerTypes.has(e.type));

  return (
    <div className="space-y-2">
      <ol className="space-y-2" aria-label="Day timeline">
        {timeline.map((e) => {
          const meta = TYPE_META[e.type] ?? TYPE_META.note;
          return (
            <li key={e.id} className={`flex gap-3 items-start rounded-xl border px-3 py-2 ${meta.cls}`}>
              <span className="w-16 shrink-0 text-sm tabular-nums text-muted pt-1">
                {fmtTime(e.occurred_at, timezone)}
              </span>
              <span aria-hidden className="text-xl leading-7">{meta.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm">
                  <span className="font-medium">{meta.label}</span>{" "}
                  <span className="text-ink/90">{describeEvent(e)}</span>
                </div>
                {e.flagged_for_review && (
                  <p className="text-xs text-warn mt-1">⚠ Flagged for review (low parser confidence)</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {footers.length > 0 && (
        <section aria-label="Activities" className="mt-4">
          <h3 className="text-xs uppercase tracking-widest text-muted mb-2">Activities & development</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {footers.map((e) => {
              const meta = TYPE_META[e.type] ?? TYPE_META.note;
              return (
                <li key={e.id} className={`rounded-xl border px-3 py-2 text-sm ${meta.cls}`}>
                  <span aria-hidden className="mr-2">{meta.emoji}</span>
                  <span className="font-medium">{meta.label}:</span>{" "}
                  <span className="text-ink/90">{e.notes ?? "—"}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
