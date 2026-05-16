import Link from "next/link";
import { requireUser, getCurrentFamily } from "@/lib/auth";
import { Bell } from "lucide-react";
import { EnablePushButton } from "@/components/enable-push-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const fam = await getCurrentFamily();

  return (
    <div className="min-h-screen pb-24" style={{ paddingTop: "var(--safe-top)" }}>
      <header className="px-4 pt-3 pb-2 flex items-center justify-between sticky top-0 bg-bg/80 backdrop-blur z-10">
        <div>
          <h1 className="text-lg font-semibold">James-Day</h1>
          {fam && <p className="text-xs text-muted">{fam.display_name} · {fam.role}</p>}
        </div>
        <div className="flex items-center gap-2">
          <EnablePushButton />
          <Link href="/settings" aria-label="Settings"
            className="rounded-full p-2 bg-surface text-ink"><Bell size={20} /></Link>
        </div>
      </header>
      <main className="px-4">{children}</main>
      <nav aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-white/5"
        style={{ paddingBottom: "var(--safe-bottom)" }}>
        <ul className="flex justify-around">
          {[
            { href: "/today", label: "Today" },
            { href: "/paste", label: "Paste" },
            { href: "/stats", label: "Stats" },
            { href: "/history", label: "History" },
          ].map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="block py-3 px-4 text-sm">{t.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
