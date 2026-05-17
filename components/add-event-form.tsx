"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";

type Kind = "feed" | "diaper" | "nap" | "medication" | "outing" | "note";
type BottleMilk = "bottle_breastmilk" | "bottle_formula" | "bottle_mixed";
type FeedKind = "bottle" | "nursed" | "solids";

interface Props {
  childId: string;
  dateISO: string;
  // When set, the form is in "live today" mode: at submit time it recomputes
  // the date in this timezone, so a tab open across midnight still writes to
  // the correct day. Omit on history pages so writes stay on the chosen date.
  timezone?: string;
}

function nowHHMM(tz?: string): string {
  const d = new Date();
  if (tz) return formatInTimeZone(d, tz, "HH:mm");
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function AddEventForm({ childId, dateISO, timezone }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [kind, setKind] = useState<Kind>("feed");
  const [time, setTime] = useState<string>(() => nowHHMM(timezone));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [okFlash, setOkFlash] = useState(false);

  // Feed
  const [feedKind, setFeedKind] = useState<FeedKind>("bottle");
  const [bottleMilk, setBottleMilk] = useState<BottleMilk>("bottle_breastmilk");
  const [feedOz, setFeedOz] = useState<string>("");
  // Diaper
  const [wet, setWet] = useState(true);
  const [bm, setBm] = useState(false);
  // Nap
  const [endTime, setEndTime] = useState<string>("");
  // Medication
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  // Shared notes
  const [notes, setNotes] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (kind === "nap" && endTime && endTime <= time) {
      setErr("Nap end time must be after the start time.");
      return;
    }
    setBusy(true); setErr(""); setOkFlash(false);

    // In live-today mode, recompute the date in family TZ at submit time so
    // a tab open across midnight still books on the current day.
    const effectiveDate = timezone ? formatInTimeZone(new Date(), timezone, "yyyy-MM-dd") : dateISO;

    const payload: Record<string, unknown> = {
      child_id: childId,
      type: kind,
      date: effectiveDate,
      time,
      notes: notes || null,
    };
    if (kind === "feed") {
      if (feedKind === "bottle") {
        payload.feed_method = bottleMilk;
        payload.feed_oz = feedOz ? Number(feedOz) : null;
      } else if (feedKind === "nursed") {
        payload.feed_method = "nursed";
      } else {
        payload.feed_method = "solids";
      }
    } else if (kind === "diaper") {
      payload.diaper_wet = wet;
      payload.diaper_bm = bm;
    } else if (kind === "nap" && endTime) {
      payload.end_time = endTime;
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

      setNotes(""); setFeedOz(""); setMedName(""); setMedDose(""); setEndTime("");
      setWet(true); setBm(false);
      setTime(nowHHMM(timezone));
      setOkFlash(true);
      // router.refresh() refetches the RSC; wrap in a transition so React
      // shows the new server data without a hard reload.
      startTransition(() => router.refresh());
      setTimeout(() => setOkFlash(false), 1500);
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
    { v: "outing", label: "Outing", emoji: "🚶" },
    { v: "note", label: "Note", emoji: "📝" },
  ];

  const ozPresets = [2, 4, 5, 6];

  return (
    <section aria-label="Add event" className="rounded-xl bg-surface2 p-4 shadow-card">
      <h3 className="text-sm font-medium mb-3">Add an event</h3>
      <div className="flex gap-2 mb-3 flex-wrap">
        {kinds.map((k) => (
          <button
            key={k.v}
            type="button"
            onClick={() => setKind(k.v)}
            className={`min-h-11 rounded-lg px-3 py-2 text-sm shadow-card ${kind === k.v ? "bg-accent text-black font-semibold" : "bg-surface text-ink"}`}
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
          <div className="space-y-2">
            <div className="flex gap-2">
              {(["bottle", "nursed", "solids"] as FeedKind[]).map((fk) => (
                <button key={fk} type="button" onClick={() => setFeedKind(fk)}
                  className={`flex-1 min-h-11 rounded-lg px-3 py-2 text-sm shadow-card ${feedKind === fk ? "bg-accent/80 text-black font-semibold" : "bg-surface text-ink"}`}>
                  {fk === "bottle" ? "Bottle" : fk === "nursed" ? "Nursed" : "Solids"}
                </button>
              ))}
            </div>
            {feedKind === "bottle" && (
              <>
                <label className="block">
                  <span className="text-xs text-muted">Milk</span>
                  <select value={bottleMilk} onChange={(e) => setBottleMilk(e.target.value as BottleMilk)}
                    className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card">
                    <option value="bottle_breastmilk">Breast milk</option>
                    <option value="bottle_formula">Formula</option>
                    <option value="bottle_mixed">Mixed</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-muted">Ounces</span>
                  <div className="mt-1 flex gap-2 items-center">
                    <input type="number" min="0" max="20" step="0.1" inputMode="decimal"
                      value={feedOz} onChange={(e) => setFeedOz(e.target.value)}
                      placeholder="oz"
                      className="flex-1 rounded-lg bg-surface px-3 py-2 text-ink shadow-card" />
                    {ozPresets.map((n) => (
                      <button key={n} type="button" onClick={() => setFeedOz(String(n))}
                        className="min-h-11 min-w-11 rounded-lg bg-surface px-3 py-2 text-sm shadow-card">
                        {n}
                      </button>
                    ))}
                  </div>
                </label>
              </>
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
          <span className="text-xs text-muted">Notes (optional) — what they ate, mood, anything</span>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card text-sm" />
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
