import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-bg-alt">
      <div className="mx-auto max-w-page px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3v18M18 3v18M6 8h12M6 16h12" />
                </svg>
              </span>
              <span className="font-display text-lg font-semibold">Re:Fit</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-ink-muted">Concierge mobile tailoring. We come to you, your clothes come back fitting better.</p>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["How it works", "/how-it-works"],
              ["Services & pricing", "/services"],
              ["Memberships", "/memberships"],
              ["Pinning parties", "/parties"],
              ["Check my area", "/check-area"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["About", "/about"],
              ["Help", "/help"],
              ["Contact", "/contact"],
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              ["Terms", "/legal/terms"],
              ["Privacy", "/legal/privacy"],
              ["Cookies", "/legal/cookies"],
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink-muted">© {new Date().getFullYear()} Re:Fit, Inc. All rights reserved.</p>
          <p className="text-xs text-ink-muted">Serving New York, San Francisco Bay, and Los Angeles.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold tracking-tight">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-ink-muted hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
