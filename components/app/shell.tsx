"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarPlus, ClipboardList, CreditCard, Home, LogOut, Package, Plus, Scissors, Settings, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ME } from "@/lib/mock/seed";

const navItems = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/orders", label: "Orders", icon: Package },
  { href: "/app/book", label: "Book", icon: CalendarPlus },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
  { href: "/app/account", label: "Account", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line bg-bg-card sticky top-0 h-screen">
        <div className="flex h-16 items-center gap-2 border-b border-line px-5">
          <Link href="/app" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-white">
              <Scissors className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Re:Fit</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                  active ? "bg-bg-alt text-ink font-medium" : "text-ink-muted hover:bg-bg-alt hover:text-ink",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="my-3 h-px bg-line" />
          <Link href="/app/self-pin" className="flex items-center gap-3 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600">
            <Plus className="h-4 w-4" />
            Start a self-pin
          </Link>
        </nav>
        <div className="border-t border-line p-3">
          <Link href="/app/account" className="flex items-center gap-3 rounded-md p-2 hover:bg-bg-alt">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700">{ME.name[0]}</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{ME.name}</div>
              <div className="truncate text-xs text-ink-muted">{ME.phone}</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Top bar — mobile */}
      <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg-card px-4">
        <Link href="/app" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-white">
            <Scissors className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-semibold">Re:Fit</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/app/account" className="rounded-full bg-brand-100 px-2 py-1 text-xs font-medium text-brand-700">
            {ME.name[0]}
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      {/* Bottom nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex justify-around border-t border-line bg-bg-card pb-safe">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 text-xs", active ? "text-brand-600 font-medium" : "text-ink-muted")}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
