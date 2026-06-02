"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Activity,
  Banknote,
  Boxes,
  BriefcaseBusiness,
  Calendar,
  CreditCard,
  Hammer,
  Home,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Package,
  PieChart,
  Receipt,
  ScrollText,
  Search,
  Shield,
  Sparkles,
  Tag,
  Truck,
  Users,
  UserCircle,
  Wrench,
} from "lucide-react";

const sections: { heading: string; items: { href: string; label: string; icon: any }[] }[] = [
  {
    heading: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: Home },
      { href: "/admin/reports", label: "Reports", icon: PieChart },
      { href: "/admin/audit", label: "Audit log", icon: Activity },
    ],
  },
  {
    heading: "Operations",
    items: [
      { href: "/admin/orders", label: "Orders", icon: LayoutGrid },
      { href: "/admin/work", label: "Tailor queue", icon: Hammer },
      { href: "/admin/calendar", label: "Calendar", icon: Calendar },
      { href: "/admin/deliveries", label: "Deliveries", icon: Truck },
      { href: "/admin/quotes", label: "Quotes", icon: ScrollText },
    ],
  },
  {
    heading: "Money",
    items: [
      { href: "/admin/invoices", label: "Invoices", icon: Receipt },
      { href: "/admin/payouts", label: "Payouts", icon: Banknote },
      { href: "/admin/promotions", label: "Promotions", icon: Tag },
    ],
  },
  {
    heading: "Catalog & people",
    items: [
      { href: "/admin/catalog", label: "Services", icon: Boxes },
      { href: "/admin/tailors", label: "Tailors", icon: Wrench },
      { href: "/admin/clients", label: "Clients", icon: Users },
      { href: "/admin/leads", label: "Leads", icon: UserCircle },
      { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
      { href: "/admin/geography", label: "Geography", icon: MapPin },
      { href: "/admin/users", label: "Staff", icon: Shield },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-bg-alt flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line bg-ink text-bg/90 sticky top-0 h-screen">
        <div className="flex h-16 items-center gap-2 border-b border-bg/10 px-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-white">
            <BriefcaseBusiness className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-semibold">Re:Fit · Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {sections.map((s) => (
            <div key={s.heading} className="mb-4 px-3">
              <div className="px-3 pb-1.5 pt-1 text-[10px] font-medium uppercase tracking-widest text-bg/40">{s.heading}</div>
              <div className="space-y-0.5">
                {s.items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn("flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm", active ? "bg-bg/10 text-bg font-medium" : "text-bg/70 hover:bg-bg/5 hover:text-bg")}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-bg/10 px-3 py-3">
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white text-sm font-medium">A</div>
            <div>
              <div className="text-sm font-medium text-bg">Avery Chen</div>
              <div className="text-xs text-bg/50">Admin · NYC</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-bg-card px-4 sm:px-8">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input placeholder="Search orders, clients, tailors…" className="w-full rounded-md border border-line bg-bg-alt pl-10 pr-3 py-2 text-sm placeholder:text-ink-subtle focus:bg-bg-card focus:outline-none focus:border-line-strong" />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-ink-muted"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> NYC hub</div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
