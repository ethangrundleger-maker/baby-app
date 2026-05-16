"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Kind = "feed" | "diaper" | "nap" | "medication" | "note";

interface Props {
  childId: string;
  dateISO: string; // family-TZ day this entry belongs to
}

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function AddEventForm({ childId, dateISO }: Props) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("feed");
  const [time, setTime] = useState<string>(nowHHMM);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Feed
  const [feedMethod, setFeedMethod] = useState<"bottle_breastmilk" | "bottle_formula" | "nursed" | "solids">("bottle_breastmilk");
  const [feedOz, setFeedOz] = useState<string>("");
  // Diaper
  const [wet, setWet] = useState(true);
  const [bm, setBm] = useState(false);
  // Nap
  const [endTime, setEndTime] = useState<string>("");
  // Medication
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  // Notes (shared)
  const [notes, setNotes] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");

    // Build occurred_at in UTC from the family-TZ date + time. We can't access
    // date-fns-tz from the client without bloating bundle, so the server route
    // does the TZ conversion. We send the local components and let the server
    // resolve. For now use a UTC ISO derived assuming the browser's TZ matches
    // the family TZ (good enough for our single-family use case; the parse
    // route uses fromZonedTime).
    const [hh, mm] = time.split(":").map(Number);
    const [y, m, d] = dateISO.split("-").map(Number);
    const occurred = new Date(y, m - 1, d, hh, mm).toISOString();
    let ended: string | null = null;
    if (kind === "nap" && endTime) {
      const [eh, em] = endTime.split(":").map(Number);
      ended = new Date(y, m - 1, d, eh, em).toISOString();
    }

    const payload: Record<string, unknown> = {
      child_id: childId,
      type: kind,
      occurred_at: occurred,
      ended_at: ended,
      notes: notes || null,
    };
    if (kind === "feed") {
      payload.feed_method = feedMethod;
      payload.feed_oz = feedOz ? Number(feedOz) : null;
    } else if (kind === "diaper") {
      payload.diaper_wet = wet;
      payload.diaper_bm = bm;
    } else if (kind === "medication") {
      payload.med_name = medName || null;
      payload.med_dose = medDose || null;
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "save failed");
      // Reset and refresh
      setNotes(""); setFeedOz(""); setMedName(""); setMedDose(""); setEndTime("");
      setTime(nowHHMM());
      router.refresh();
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const kinds: { v: Kind; label: string; emoji: string }[] = [
    { v: "feed", label: "Feed", emoji: "🍼" },
    { v: "diaper", label: "Diaper", emoji: "🧷" },
    { v: "nap", label: "Nap", emoji: "😴" },
    { v: "medication", label: "Med", emoji: "💊" },
    { v: "note", label: "Note", emoji: "📝" },
  ];

  return (
    <section aria-label="Add event" className="rounded-xl bg-surface2 p-4 shadow-card">
      <h3 className="text-sm font-medium mb-3">Add an event</h3>
      <div className="flex gap-2 mb-3 flex-wrap">
        {kinds.map((k) => (
          <button
            key={k.v}
            type="button"
            onClick={() => setKind(k.v)}
            className={`rounded-lg px-3 py-2 text-sm shadow-card ${kind === k.v ? "bg-accent text-black font-semibold" : "bg-surface text-ink"}`}
          >
            <span aria-hidden className="mr-1">{k.emoji}</span>{k.label}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs text-muted">Time</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card" />
          </label>
          {kind === "nap" && (
            <label className="block">
              <span className="text-xs text-muted">End time (optional)</span>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card" />
            </label>
          )}
        </div>

        {kind === "feed" && (
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs text-muted">Method</span>
              <select value={feedMethod} onChange={(e) => setFeedMethod(e.target.value as typeof feedMethod)}
                className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card">
                <option value="bottle_breastmilk">Bottle · breast milk</option>
                <option value="bottle_formula">Bottle · formula</option>
                <option value="nursed">Nursed</option>
                <option value="solids">Solids</option>
              </select>
            </label>
            {feedMethod !== "nursed" && feedMethod !== "solids" && (
              <label className="block">
                <span className="text-xs text-muted">Ounces</span>
                <input type="number" min="0" max="20" step="0.1"
                  value={feedOz} onChange={(e) => setFeedOz(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card" />
              </label>
            )}
          </div>
        )}

        {kind === "diaper" && (
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={wet} onChange={(e) => setWet(e.target.checked)} />
              <span>Wet</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={bm} onChange={(e) => setBm(e.target.checked)} />
              <span>BM</span>
            </label>
          </div>
        )}

        {kind === "medication" && (
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs text-muted">Name</span>
              <input type="text" value={medName} onChange={(e) => setMedName(e.target.value)}
                placeholder="Floradacane"
                className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card" />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Dose</span>
              <input type="text" value={medDose} onChange={(e) => setMedDose(e.target.value)}
                placeholder="5 drops"
                className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card" />
            </label>
          </div>
        )}

        <label className="block">
          <span className="text-xs text-muted">Notes (optional)</span>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card text-sm" />
        </label>

        <button type="submit" disabled={busy}
          className="w-full rounded-lg bg-accent text-black font-semibold px-4 py-3 disabled:opacity-50">
          {busy ? "Saving…" : "Add"}
        </button>
        {err && <p role="alert" className="text-warn text-sm">{err}</p>}
      </form>
    </section>
  );
}
