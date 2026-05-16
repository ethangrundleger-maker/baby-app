"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  childId: string;
  todayISO: string;
  defaultSource: "nanny_paste" | "parent_paste";
}

export default function PasteForm({ childId, todayISO, defaultSource }: Props) {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [date, setDate] = useState(todayISO);
  const [source, setSource] = useState<"nanny_paste" | "parent_paste" | "manual">(defaultSource);
  const [handoff, setHandoff] = useState("");
  const [status, setStatus] = useState<"idle"|"previewing"|"saving"|"saved"|"error">("idle");
  const [errMsg, setErrMsg] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [preview, setPreview] = useState<any>(null);

  async function previewParse(e: React.FormEvent) {
    e.preventDefault();
    setStatus("previewing"); setErrMsg("");
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw, report_date: date, source, child_id: childId, preview: true }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "parse failed");
      if (handoff.trim()) j.parsed.handoff_note = handoff.trim();
      setPreview(j);
      setStatus("idle");
    } catch (err) {
      setStatus("error"); setErrMsg((err as Error).message);
    }
  }

  async function save() {
    setStatus("saving"); setErrMsg("");
    try {
      const fullRaw = handoff.trim() ? `${raw}\n\n[Handoff]\n${handoff.trim()}` : raw;
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: fullRaw, report_date: date, source, child_id: childId, preview: false }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "save failed");
      setStatus("saved");
      router.push("/today");
      router.refresh();
    } catch (err) {
      setStatus("error"); setErrMsg((err as Error).message);
    }
  }

  return (
    <form onSubmit={previewParse} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-muted">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card" />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Source</span>
          <select value={source} onChange={(e) => setSource(e.target.value as typeof source)}
            className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card">
            <option value="nanny_paste">Nanny</option>
            <option value="parent_paste">Parent</option>
            <option value="manual">Manual</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm text-muted">Notes (paste here)</span>
        <textarea required value={raw} onChange={(e) => setRaw(e.target.value)} rows={12}
          placeholder={`5/15\n(6:30/5oz & nursed)\n8:07 wet\n8:17 down; 9:03 up\n9:16 6.5 oz breastmilk\n...\nDevelopment skills worked on: tummy time\nSongs/music: wheels on the bus\nBooks: brown bear\nSensory: blessing box\nSigns: sleep, walk`}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card font-mono text-sm" />
      </label>
      <label className="block">
        <span className="text-sm text-muted">Handoff note (optional)</span>
        <textarea value={handoff} onChange={(e) => setHandoff(e.target.value)} rows={3}
          placeholder="e.g. He was a bit fussy after the second nap — extra burping helped."
          className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card text-sm" />
      </label>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={save} disabled={status==="saving"}
          className="rounded-lg bg-accent text-black font-semibold px-4 py-3 disabled:opacity-50">
          {status === "saving" ? "Saving…" : "Save report"}
        </button>
        <p className="text-xs text-muted">Parses the notes, saves events to the day, and sends a push to family.</p>
        <button type="submit" disabled={status==="previewing"}
          className="self-start text-xs text-muted underline underline-offset-2 disabled:opacity-50">
          {status === "previewing" ? "Parsing…" : "Preview only (don't save)"}
        </button>
      </div>
      {errMsg && <p role="alert" className="text-warn text-sm">{errMsg}</p>}

      {preview && (
        <section aria-label="Preview" className="rounded-xl bg-surface2 p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Parse preview</h3>
            <span className="text-xs text-muted">
              {preview.source} · confidence {Math.round((preview.parsed.confidence ?? 0) * 100)}%
              {preview.parsed.flags?.length > 0 ? ` · flags: ${preview.parsed.flags.join(", ")}` : ""}
            </span>
          </div>
          {preview.summary && <p className="text-sm text-ink mb-2">{preview.summary}</p>}
          <details className="text-xs text-muted">
            <summary className="cursor-pointer">View structured JSON ({preview.parsed.events.length} events)</summary>
            <pre className="overflow-auto mt-2 max-h-80 text-[10px]">{JSON.stringify(preview.parsed, null, 2)}</pre>
          </details>
        </section>
      )}
    </form>
  );
}
