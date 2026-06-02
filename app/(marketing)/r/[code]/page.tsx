import { Section } from "@/components/ui/section";
import { ZipCheck } from "@/components/marketing/zip-check";

export const metadata = { title: "You're invited", robots: { index: false } };

export default async function ReferralLanding({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <Section>
      <div className="mx-auto max-w-xl rounded-2xl border border-brand-300 bg-brand-50 p-8 text-center">
        <div className="text-xs font-medium uppercase tracking-widest text-brand-700">A friend invited you</div>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">$25 off your first order with Re:Fit</h1>
        <p className="mt-3 text-ink-muted">Code <span className="font-mono font-semibold text-ink">{code}</span> is pre-applied when you sign up.</p>
        <div className="mt-6 text-left">
          <ZipCheck />
        </div>
      </div>
      <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-3 text-sm">
        {["The tailor comes to you", "Pin in 30–60 min", "Back in 5–7 days"].map((b) => (
          <div key={b} className="rounded-lg border border-line bg-bg-card p-4 text-center text-ink-soft">{b}</div>
        ))}
      </div>
    </Section>
  );
}
