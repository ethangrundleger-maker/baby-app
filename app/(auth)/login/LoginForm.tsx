"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending"); setErrMsg("");
    const supa = supabaseBrowser();
    const { error } = await supa.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?invite=${encodeURIComponent(inviteCode)}&name=${encodeURIComponent(displayName)}`,
      },
    });
    if (error) { setStatus("error"); setErrMsg(error.message); return; }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg bg-surface p-4 shadow-card">
        <p className="text-ink">Check your email for the sign-in link.</p>
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
        <span className="text-sm text-muted">Your name (shown on entries)</span>
        <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card" />
      </label>
      <label className="block">
        <span className="text-sm text-muted">Family invite code</span>
        <input required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-3 text-ink shadow-card" />
        <span className="text-xs text-muted mt-1 block">
          Parents and the nanny use different codes — the household will share the right one with you.
        </span>
      </label>
      <button disabled={status==="sending"} type="submit"
        className="w-full rounded-lg bg-accent text-black font-semibold py-3 disabled:opacity-50">
        {status === "sending" ? "Sending…" : "Send magic link"}
      </button>
      {errMsg && <p role="alert" className="text-warn text-sm">{errMsg}</p>}
    </form>
  );
}
