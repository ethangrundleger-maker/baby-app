import Link from "next/link";

export const metadata = { robots: { index: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="px-5 py-5 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3v18M18 3v18M6 8h12M6 16h12" />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Re:Fit</span>
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-5 pt-8 pb-16 sm:px-8 sm:pt-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
