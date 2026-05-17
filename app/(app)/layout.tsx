import Link from "next/link";
import { requireUser, getCurrentFamily, getCurrentChild, getMyChildren } from "@/lib/auth";
import { Settings } from "lucide-react";
import { EnablePushButton } from "@/components/enable-push-button";
import { ChildPicker } from "@/components/child-picker";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const fam = await getCurrentFamily();
  const current = await getCurrentChild();
  const allChildren = await getMyChildren();
  const pickerOptions = allChildren.map((c) => ({
    id: c.id,
    name: c.name,
    family_name: c.family.name,
  }));

  return (
    <div className="min-h-screen pb-24" style={{ paddingTop: "var(--safe-top)" }}>
      <header className="px-4 pt-3 pb-2 flex items-center justify-between sticky top-0 bg-bg/80 backdrop-blur z-10">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">James-Day</h1>
          {fam && <p className="text-xs text-muted truncate">{fam.display_name} · {fam.role} · {fam.family.name}</p>}
        </div>
        <div className="flex items-center gap-2">
          {current && pickerOptions.length > 1 && (
            <ChildPicker current_id={current.id} options={pickerOptions} />
          )}
          <EnablePushButton />
          <Link href="/settings" aria-label="Settings"
            className="inline-flex items-center justify-center rounded-full min-h-11 min-w-11 bg-surface text-ink"
          ><Settings size={20} /></Link>
        </div>
      </header>
      <main className="px-4">{children}</main>
      <nav aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-white/5"
        style={{ paddingBottom: "var(--safe-bottom)" }}>
        <ul className="flex justify-around">
          {[
            { href: "/today", label: "Today" },
            { href: "/stats", label: "Stats" },
          ].map((t) => (
            <li key={t.href}>
              <Link href={t.href} role="button"
                className="inline-flex items-center justify-center min-h-12 px-5 text-sm">
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
