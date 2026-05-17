"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    if (password.length < 8) { setErr("Password must be at least 8 characters."); setBusy(false); return; }
    if (!displayName.trim()) { setErr("Add your display name."); setBusy(false); return; }
    if (!inviteCode.trim()) { setErr("Add your invite code."); setBusy(false); return; }

    const supa = supabaseBrowser();
    try {
      const { data, error } = await supa.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?invite=${encodeURIComponent(inviteCode)}&name=${encodeURIComponent(displayName)}`,
        },
      });
      if (error) throw error;
      // If email confirmation is required, there's no session yet — tell the user.
      if (!data.session) {
        setNeedsConfirm(true);
        return;
      }
      // Session exists immediately (email confirmation not required). Send
      // the browser through /auth/callback to apply the invite code; that
      // route handles validation and redirects to /today on success.
      window.location.href = `/auth/callback?invite=${encodeURIComponent(inviteCode)}&name=${encodeURIComponent(displayName)}`;
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (needsConfirm) {
    return (
      <div className="rounded-lg bg-surface p-4 shadow-card space-y-2">
        <p>Check your email and click the confirmation link to finish creating your account.</p>
        <p className="text-xs text-muted">After confirming, your invite code will be applied automatically.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm text-muted">Email</span>
        <input required type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card" />
      </label>
      <label className="block">
        <span className="text-sm text-muted">Password (8+ chars)</span>
        <input required type="password" autoComplete="new-password" minLength={8} value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card" />
      </label>
      <label className="block">
        <span className="text-sm text-muted">Your name (shown on entries)</span>
        <input required maxLength={80} value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card" />
      </label>
      <label className="block">
        <span className="text-sm text-muted">Family invite code</span>
        <input required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card" />
        <span className="text-xs text-muted mt-1 block">
          Parents and the nanny use different codes — the admin will share the right one with you.
        </span>
      </label>
      <button disabled={busy} type="submit"
        className="w-full rounded-lg bg-accent text-black font-semibold py-3 disabled:opacity-50">
        {busy ? "Creating…" : "Create account"}
      </button>
      {err && <p role="alert" className="text-warn text-sm">{err}</p>}
      <p className="text-xs text-muted text-center">
        Already have an account? <Link href="/login" className="underline">Sign in</Link>
      </p>
    </form>
  );
}
