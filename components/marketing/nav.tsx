"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/services", label: "Services & pricing" },
  { href: "/memberships", label: "Memberships" },
  { href: "/parties", label: "Pinning parties" },
  { href: "/help", label: "Help" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-lg font-semibold tracking-tight">Re:Fit</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-bg-alt hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/check-area" className="rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-bg-alt">
            Check my area
          </Link>
          <Link href="/app" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-bg hover:bg-ink-soft">
            Sign in
          </Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line bg-bg md:hidden">
          <div className="mx-auto max-w-page px-5 py-4 sm:px-8">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-md px-3 py-2.5 text-sm text-ink-soft hover:bg-bg-alt" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2 border-t border-line pt-3">
              <Link href="/check-area" className="flex-1 rounded-md border border-line-strong px-3 py-2.5 text-center text-sm font-medium" onClick={() => setOpen(false)}>
                Check my area
              </Link>
              <Link href="/app" className="flex-1 rounded-md bg-ink px-3 py-2.5 text-center text-sm font-medium text-bg" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Logo() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-white">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3v18M18 3v18M6 8h12M6 16h12" />
      </svg>
    </span>
  );
}
