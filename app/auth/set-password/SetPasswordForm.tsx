"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setErr("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setErr("Passwords don't match."); return; }
    setBusy(true); setErr("");
    const supa = supabaseBrowser();
    const { error } = await supa.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.replace("/today");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm text-muted">New password (8+ chars)</span>
        <input required type="password" autoComplete="new-password" minLength={8} value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card" />
      </label>
      <label className="block">
        <span className="text-sm text-muted">Confirm password</span>
        <input required type="password" autoComplete="new-password" minLength={8} value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card" />
      </label>
      <button disabled={busy} type="submit"
        className="w-full rounded-lg bg-accent text-black font-semibold py-3 disabled:opacity-50">
        {busy ? "Saving…" : "Save password"}
      </button>
      {err && <p role="alert" className="text-warn text-sm">{err}</p>}
    </form>
  );
}
