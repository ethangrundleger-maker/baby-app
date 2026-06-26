import Link from "next/link";
import { SECTIONS, SPINE, TOTAL_TABLES, ALL_TABLES, type Column } from "@/lib/data-model";
import { Database, Key, Link as LinkIcon, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = { title: "Re:Fit — Data model" };

const SPINE_TABLES = ["clients", "orders", "garments", "adjustments", "invoices", "tailor_earnings"];

export default function DataModelPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-line bg-bg-card">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
          <Link href="/" className="text-xs font-medium uppercase tracking-widest text-brand-600 hover:text-brand-700">← Re:Fit</Link>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-semibold tracking-tight">The data model</h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-ink-muted">
            Every table in the Re:Fit database, what it does, and how they relate. {TOTAL_TABLES} tables across {SECTIONS.length} domains — derived directly from <code className="rounded bg-bg-alt px-1.5 py-0.5 text-xs">schema.sql</code>, the single source of truth.
          </p>
          <div className="mt-6 rounded-lg border border-brand-200 bg-brand-50 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
              <div>
                <div className="font-display text-base font-semibold text-brand-900">The spine, in one line</div>
                <p className="mt-1 text-sm text-brand-900 leading-relaxed">{SPINE}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Tables" value={String(TOTAL_TABLES)} />
            <Stat label="Domains" value={String(SECTIONS.length)} />
            <Stat label="Foreign keys" value={String(ALL_TABLES.reduce((a, t) => a + t.columns.filter((c) => c.fk).length, 0))} />
            <Stat label="Enums" value={String(ALL_TABLES.reduce((a, t) => a + t.columns.filter((c) => c.enums).length, 0))} />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-alt px-3 py-1"><Key className="h-3 w-3" /> Primary key</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-alt px-3 py-1"><LinkIcon className="h-3 w-3 text-brand-600" /> Foreign key</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-alt px-3 py-1"><ShieldCheck className="h-3 w-3 text-success" /> Required</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-alt px-3 py-1"><Database className="h-3 w-3" /> Enum</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[220px_1fr]">
        {/* Sidebar nav */}
        <nav className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
          <div className="text-xs font-medium uppercase tracking-widest text-ink-muted mb-3">Sections</div>
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.number}>
                <a href={`#section-${s.number}`} className="block rounded-md px-2 py-1.5 text-sm text-ink-muted hover:bg-bg-alt hover:text-ink">
                  <span className="font-mono text-xs text-ink-subtle mr-2">{String(s.number).padStart(2, "0")}</span>
                  {s.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div className="space-y-16">
          {SECTIONS.map((section) => (
            <section key={section.number} id={`section-${section.number}`} className="scroll-mt-8">
              <div className="mb-6">
                <div className="font-mono text-xs text-brand-600 font-medium">{String(section.number).padStart(2, "0")}</div>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight">{section.heading}</h2>
                <p className="mt-2 text-ink-muted">{section.description}</p>
              </div>
              <div className="space-y-6">
                {section.tables.map((t) => (
                  <TableCard key={t.name} table={t} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <footer className="border-t border-line bg-bg-card">
        <div className="mx-auto max-w-6xl px-5 py-8 text-xs text-ink-muted sm:px-8">
          Generated from <code>schema.sql</code>. Edit the schema, regenerate. Validators (25 schema checks, 27 invariants, event contract) keep this honest in CI.
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg-alt p-3">
      <div className="text-xs uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function TableCard({ table }: { table: { name: string; blurb: string; columns: Column[] } }) {
  const isSpine = SPINE_TABLES.includes(table.name);
  return (
    <div id={`tbl-${table.name}`} className={`scroll-mt-8 rounded-xl border bg-bg-card shadow-card overflow-hidden ${isSpine ? "border-brand-300" : "border-line"}`}>
      <div className={`flex items-start justify-between gap-3 px-5 py-4 border-b ${isSpine ? "bg-brand-50 border-brand-200" : "bg-bg-alt border-line"}`}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono font-semibold tracking-tight text-base">{table.name}</h3>
            {isSpine && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">spine</span>}
          </div>
          <p className="mt-1 text-sm text-ink-muted max-w-2xl">{table.blurb}</p>
        </div>
        <span className="shrink-0 text-xs text-ink-muted">{table.columns.length} cols</span>
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wider text-ink-muted">
          <tr>
            <th className="px-5 py-2 font-medium w-1/4">Column</th>
            <th className="px-5 py-2 font-medium w-20">Type</th>
            <th className="px-5 py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {table.columns.map((c) => (
            <tr key={c.name} className="border-t border-line">
              <td className="px-5 py-2.5 align-top">
                <span className="font-mono text-sm">{c.name}</span>
                {c.pk && <Key className="ml-1.5 inline h-3 w-3 text-ink-subtle" />}
              </td>
              <td className="px-5 py-2.5 align-top">
                <span className="rounded bg-bg-alt px-1.5 py-0.5 text-xs font-mono text-ink-muted">{c.type}</span>
              </td>
              <td className="px-5 py-2.5 align-top">
                <div className="flex flex-wrap gap-1.5">
                  {c.pk && <Pill tone="neutral">primary key</Pill>}
                  {c.required && <Pill tone="success"><ShieldCheck className="h-3 w-3" /> required</Pill>}
                  {c.unique && <Pill tone="info">unique</Pill>}
                  {c.fk && (
                    <a href={`#tbl-${c.fk}`} className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs text-brand-800 hover:bg-brand-100">
                      <LinkIcon className="h-3 w-3" /> → {c.fk}
                    </a>
                  )}
                  {c.enums && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-bg-alt px-2 py-0.5 text-xs text-ink-muted">
                      <Database className="h-3 w-3" />
                      <span className="font-mono">{c.enums.join(" · ")}</span>
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pill({ tone = "neutral", children }: { tone?: "neutral" | "success" | "info"; children: React.ReactNode }) {
  const tones = {
    neutral: "border-line bg-bg-alt text-ink-muted",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
  } as const;
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${tones[tone]}`}>{children}</span>;
}
