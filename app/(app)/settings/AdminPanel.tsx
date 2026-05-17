"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFamily, createChild, renameFamily } from "@/app/actions/admin";

interface FamilyRow {
  id: string;
  name: string;
  timezone: string;
  invite_code: string;
  nanny_invite_code: string | null;
}

interface ChildRow {
  id: string;
  family_id: string;
  name: string;
  dob: string | null;
}

interface Props {
  families: FamilyRow[];
  children: ChildRow[];
}

export default function AdminPanel({ families, children }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <section aria-label="Admin" className="rounded-xl bg-surface p-4 shadow-card space-y-6">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Admin</h3>
        <span className="text-xs text-muted">Visible only to you.</span>
      </header>

      <FamiliesList families={families} childrenByFam={groupByFam(children)} onChange={() => startTransition(() => router.refresh())} />

      <AddFamily onCreated={() => startTransition(() => router.refresh())} />

      <AddChild families={families} onCreated={() => startTransition(() => router.refresh())} />
    </section>
  );
}

function groupByFam(rows: ChildRow[]) {
  const out = new Map<string, ChildRow[]>();
  rows.forEach((r) => {
    const arr = out.get(r.family_id) ?? [];
    arr.push(r);
    out.set(r.family_id, arr);
  });
  return out;
}

function FamiliesList({
  families, childrenByFam, onChange,
}: {
  families: FamilyRow[];
  childrenByFam: Map<string, ChildRow[]>;
  onChange: () => void;
}) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-widest text-muted mb-2">Families</h4>
      <ul className="space-y-3">
        {families.map((f) => (
          <FamilyRowView key={f.id} family={f} children={childrenByFam.get(f.id) ?? []} onChange={onChange} />
        ))}
      </ul>
    </div>
  );
}

function FamilyRowView({
  family, children, onChange,
}: {
  family: FamilyRow;
  children: ChildRow[];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(family.name);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await renameFamily({ family_id: family.id, name });
    setBusy(false);
    if (res.ok) { setEditing(false); onChange(); }
  }

  return (
    <li className="rounded-lg bg-surface2 p-3 space-y-2">
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-lg bg-surface px-3 py-2 text-ink shadow-card text-sm" />
            <button onClick={save} disabled={busy} className="rounded-lg bg-accent text-black font-semibold px-3 py-2 text-sm disabled:opacity-50">Save</button>
            <button onClick={() => { setEditing(false); setName(family.name); }} className="rounded-lg bg-surface px-3 py-2 text-sm">Cancel</button>
          </>
        ) : (
          <>
            <p className="flex-1 font-medium">{family.name}</p>
            <button onClick={() => setEditing(true)} className="text-xs underline text-muted">Rename</button>
          </>
        )}
      </div>
      <p className="text-xs text-muted">TZ: {family.timezone}</p>
      <div className="text-xs space-y-1">
        <p><span className="text-muted">Parent invite code:</span> <code className="text-ink">{family.invite_code}</code></p>
        {family.nanny_invite_code && (
          <p><span className="text-muted">Nanny invite code:</span> <code className="text-ink">{family.nanny_invite_code}</code></p>
        )}
      </div>
      <div className="text-xs text-muted">
        Children: {children.length === 0 ? "(none)" : children.map((c) => c.name).join(", ")}
      </div>
    </li>
  );
}

function AddFamily({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tz, setTz] = useState("America/New_York");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const res = await createFamily({ name, timezone: tz });
    setBusy(false);
    if (!res.ok) { setErr(res.error ?? "failed"); return; }
    setName(""); setOpen(false);
    onCreated();
  }

  if (!open) return <button onClick={() => setOpen(true)} className="text-sm underline text-muted">+ Add a family</button>;
  return (
    <form onSubmit={submit} className="rounded-lg bg-surface2 p-3 space-y-2">
      <h4 className="text-xs uppercase tracking-widest text-muted">New family</h4>
      <label className="block">
        <span className="text-xs text-muted">Family name</span>
        <input required value={name} onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card text-sm" />
      </label>
      <label className="block">
        <span className="text-xs text-muted">Timezone (e.g. America/New_York)</span>
        <input required value={tz} onChange={(e) => setTz(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card text-sm" />
      </label>
      <div className="flex gap-2">
        <button disabled={busy} type="submit" className="rounded-lg bg-accent text-black font-semibold px-3 py-2 text-sm disabled:opacity-50">
          {busy ? "Creating…" : "Create"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-surface px-3 py-2 text-sm">Cancel</button>
      </div>
      {err && <p role="alert" className="text-warn text-sm">{err}</p>}
    </form>
  );
}

function AddChild({ families, onCreated }: { families: FamilyRow[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [familyId, setFamilyId] = useState(families[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const res = await createChild({ family_id: familyId, name, dob: dob || null });
    setBusy(false);
    if (!res.ok) { setErr(res.error ?? "failed"); return; }
    setName(""); setDob(""); setOpen(false);
    onCreated();
  }

  if (!open) return <button onClick={() => setOpen(true)} className="text-sm underline text-muted">+ Add a baby</button>;
  return (
    <form onSubmit={submit} className="rounded-lg bg-surface2 p-3 space-y-2">
      <h4 className="text-xs uppercase tracking-widest text-muted">New baby</h4>
      <label className="block">
        <span className="text-xs text-muted">Baby name</span>
        <input required value={name} onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card text-sm" />
      </label>
      <label className="block">
        <span className="text-xs text-muted">Family</span>
        <select required value={familyId} onChange={(e) => setFamilyId(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card text-sm">
          {families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="text-xs text-muted">Date of birth (optional)</span>
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
          className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-ink shadow-card text-sm" />
      </label>
      <div className="flex gap-2">
        <button disabled={busy} type="submit" className="rounded-lg bg-accent text-black font-semibold px-3 py-2 text-sm disabled:opacity-50">
          {busy ? "Adding…" : "Add baby"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-surface px-3 py-2 text-sm">Cancel</button>
      </div>
      {err && <p role="alert" className="text-warn text-sm">{err}</p>}
    </form>
  );
}
