"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinFamily } from "@/app/actions/child";

export default function JoinFamilyForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(""); setOk(false);
    const res = await joinFamily({ invite_code: code, display_name: name });
    setBusy(false);
    if (!res.ok) {
      setErr(res.error === "invalid_invite" ? "That invite code didn't match a family." : res.error ?? "failed");
      return;
    }
    setCode(""); setOk(true);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm underline text-muted">
        + Join another family
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="rounded-lg bg-surface2 p-3 space-y-2">
      <h4 className="text-xs uppercase tracking-widest text-muted">Join another family</h4>
      <label className="block">
        <span className="text-xs text-muted">Invite code</span>
        <input required value={code} onChange={(e) => setCode(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card text-sm" />
      </label>
      <label className="block">
        <span className="text-xs text-muted">Your name in this family (shown on entries)</span>
        <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card text-sm" />
      </label>
      <div className="flex gap-2">
        <button disabled={busy} type="submit" className="rounded-lg bg-accent text-black font-semibold px-3 py-2 text-sm disabled:opacity-50">
          {busy ? "Joining…" : "Join"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-surface px-3 py-2 text-sm">Cancel</button>
      </div>
      {err && <p role="alert" className="text-warn text-sm">{err}</p>}
      {ok && <p className="text-sm text-accent">Joined ✓</p>}
    </form>
  );
}
