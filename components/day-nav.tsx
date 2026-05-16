"use client";
import { useRouter } from "next/navigation";

interface Props {
  dateISO: string;
  todayISO: string;
}

function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

function pathFor(iso: string, todayISO: string): string {
  return iso === todayISO ? "/today" : `/history/${iso}`;
}

export function DayNav({ dateISO, todayISO }: Props) {
  const router = useRouter();
  const prev = addDays(dateISO, -1);
  const next = addDays(dateISO, 1);
  const isToday = dateISO === todayISO;
  const canGoNext = dateISO < todayISO;

  return (
    <nav aria-label="Day navigation" className="flex items-center gap-2">
      <a
        href={pathFor(prev, todayISO)}
        className="rounded-lg bg-surface px-3 py-2 text-sm shadow-card hover:bg-surface2"
        aria-label="Previous day"
      >
        ←
      </a>
      <input
        type="date"
        value={dateISO}
        max={todayISO}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return;
          router.push(pathFor(v, todayISO));
        }}
        className="flex-1 rounded-lg bg-surface px-3 py-2 text-sm text-ink shadow-card"
      />
      <a
        href={canGoNext ? pathFor(next, todayISO) : "#"}
        aria-disabled={!canGoNext}
        className={`rounded-lg bg-surface px-3 py-2 text-sm shadow-card ${canGoNext ? "hover:bg-surface2" : "opacity-30 pointer-events-none"}`}
        aria-label="Next day"
      >
        →
      </a>
      {!isToday && (
        <a href="/today" className="rounded-lg bg-surface px-3 py-2 text-sm shadow-card hover:bg-surface2">
          Today
        </a>
      )}
    </nav>
  );
}
