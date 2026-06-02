export function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-prose px-5 py-16 sm:px-8 sm:py-24">
      <h1 className="font-display text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">Last updated: {updated}</p>
      <div className="mt-10 space-y-8">{children}</div>
    </article>
  );
}
