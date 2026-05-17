"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Mode = "password" | "magic" | "reset";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<"magic" | "reset" | null>(null);
  const [err, setErr] = useState("");
  const [suggestMagic, setSuggestMagic] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(""); setSent(null); setSuggestMagic(false);
    const supa = supabaseBrowser();
    try {
      if (mode === "password") {
        const { error } = await supa.auth.signInWithPassword({ email, password });
        if (error) {
          // Most likely cause for households migrating from magic-link only.
          if (/invalid login credentials/i.test(error.message)) setSuggestMagic(true);
          throw error;
        }
        router.replace("/today");
        router.refresh();
        return;
      }
      if (mode === "magic") {
        const { error } = await supa.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setSent("magic");
        return;
      }
      // reset
      const { error } = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?reset=1`,
      });
      if (error) throw error;
      setSent("reset");
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (sent === "magic") {
    return <div className="rounded-lg bg-surface p-4 shadow-card"><p>Check your email for the sign-in link.</p></div>;
  }
  if (sent === "reset") {
    return <div className="rounded-lg bg-surface p-4 shadow-card"><p>Password reset link sent. Open it from your inbox to choose a new password.</p></div>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm text-muted">Email</span>
        <input required type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card" />
      </label>

      {mode === "password" && (
        <label className="block">
          <span className="text-sm text-muted">Password</span>
          <input required type="password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card" />
        </label>
      )}

      <button disabled={busy} type="submit"
        className="w-full rounded-lg bg-accent text-black font-semibold py-3 disabled:opacity-50">
        {busy ? "…" : mode === "password" ? "Sign in" : mode === "magic" ? "Send magic link" : "Send reset link"}
      </button>

      {err && <p role="alert" className="text-warn text-sm">{err}</p>}
      {suggestMagic && (
        <p className="text-xs text-muted">
          If you signed up via a magic link, click <button type="button" onClick={() => { setMode("magic"); setErr(""); setSuggestMagic(false); }} className="underline">use a magic link</button> or <button type="button" onClick={() => { setMode("reset"); setErr(""); setSuggestMagic(false); }} className="underline">forgot password</button> to set one.
        </p>
      )}

      <div className="text-xs text-muted text-center space-y-1">
        {mode === "password" && (
          <>
            <p><button type="button" onClick={() => { setMode("reset"); setErr(""); }} className="underline">Forgot password?</button></p>
            <p>or <button type="button" onClick={() => { setMode("magic"); setErr(""); }} className="underline">use a magic link</button></p>
          </>
        )}
        {mode !== "password" && (
          <p><button type="button" onClick={() => { setMode("password"); setErr(""); }} className="underline">Use password instead</button></p>
        )}
        <p>No account? <Link href="/signup" className="underline">Create one</Link></p>
      </div>
    </form>
  );
}
