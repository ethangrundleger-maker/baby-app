"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ActivityKind = "song" | "book" | "sensory" | "sign" | "milestone" | "mood";

interface Props {
  childId: string;
  dateISO: string;
}

const KINDS: { v: ActivityKind; label: string; emoji: string; placeholder: string }[] = [
  { v: "song", label: "Songs", emoji: "🎵", placeholder: "Wheels on the bus, Twinkle twinkle…" },
  { v: "book", label: "Books", emoji: "📖", placeholder: "Brown Bear, Goodnight Moon…" },
  { v: "sensory", label: "Sensory", emoji: "✨", placeholder: "Crinkle book, water play…" },
  { v: "sign", label: "Signs", emoji: "👋", placeholder: "Milk, more, sleep…" },
  { v: "milestone", label: "Milestone", emoji: "🌟", placeholder: "Rolled over, first laugh…" },
  { v: "mood", label: "Mood", emoji: "🫶", placeholder: "Happy, fussy, content…" },
];

export function AddActivityForm({ childId, dateISO }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [kind, setKind] = useState<ActivityKind>("song");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [okFlash, setOkFlash] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) { setErr("Add a note."); return; }
    setBusy(true); setErr(""); setOkFlash(false);
    try {
      // 8pm in family TZ is conventional for footer-style entries; we send the
      // day's date plus a 20:00 anchor and let the server resolve to UTC.
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: childId,
          type: kind,
          date: dateISO,
          time: "20:00",
          notes: notes.trim(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "save failed");
      setNotes("");
      setOkFlash(true);
      startTransition(() => router.refresh());
      setTimeout(() => setOkFlash(false), 1500);
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const active = KINDS.find(k => k.v === kind)!;

  return (
    <section aria-label="Add activity" className="rounded-xl bg-surface2 p-4 shadow-card">
      <h3 className="text-sm font-medium mb-3">Add an activity</h3>
      <div className="flex gap-2 mb-3 flex-wrap">
        {KINDS.map((k) => (
          <button key={k.v} type="button" onClick={() => setKind(k.v)}
            className={`min-h-11 rounded-lg px-3 py-2 text-sm shadow-card ${kind === k.v ? "bg-accent text-black font-semibold" : "bg-surface text-ink"}`}>
            <span aria-hidden className="mr-1">{k.emoji}</span>{k.label}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-xs text-muted">{active.label}</span>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder={active.placeholder}
            className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card" />
        </label>
        <button type="submit" disabled={busy}
          className="w-full rounded-lg bg-accent text-black font-semibold px-4 py-3 disabled:opacity-50">
          {busy ? "Saving…" : okFlash ? "Saved ✓" : "Add"}
        </button>
        {err && <p role="alert" className="text-warn text-sm">{err}</p>}
      </form>
    </section>
  );
}
