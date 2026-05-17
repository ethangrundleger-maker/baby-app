"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { selectChild } from "@/app/actions/child";

interface ChildOption {
  id: string;
  name: string;
  family_name: string;
}

interface Props {
  current_id: string;
  options: ChildOption[];
}

export function ChildPicker({ current_id, options }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (options.length <= 1) return null;

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (id === current_id) return;
    startTransition(async () => {
      const res = await selectChild(id);
      if (res.ok) router.refresh();
    });
  }

  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">Baby</span>
      <select
        aria-label="Choose baby"
        value={current_id}
        onChange={onChange}
        disabled={pending}
        className="min-h-11 rounded-lg bg-surface px-3 py-2 text-sm text-ink shadow-card disabled:opacity-60"
      >
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} · {c.family_name}
          </option>
        ))}
      </select>
    </label>
  );
}
