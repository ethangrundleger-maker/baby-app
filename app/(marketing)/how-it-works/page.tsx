import { Section, SectionHeader } from "@/components/ui/section";
import { ZipCheck } from "@/components/marketing/zip-check";
import { Calendar, Home, Scissors, ShieldCheck, Truck } from "lucide-react";

export const metadata = { title: "How Re:Fit works" };

export default function Page() {
  const steps = [
    { icon: <Home />, title: "1. Book or self-pin", body: "Pick a 30–60 minute slot at home (we travel up to 60 mi from each hub), or use the self-pin builder to mark up your own garments and we'll arrange pickup." },
    { icon: <Calendar />, title: "2. We pin it", body: "A trained stylist comes to you — marks every adjustment, takes your measurements if you'd like, and confirms a transparent estimate before anything leaves the house." },
    { icon: <Scissors />, title: "3. Our tailors alter it", body: "We route each garment to a vetted tailor with proven capability for that exact alteration. Time-budgeted, tracked, and quality-checked before it ships back." },
    { icon: <Truck />, title: "4. It comes back to you", body: "Most orders are back in 5–7 days. You'll see every status — pickup, tailor, return — in the app. Members get same-week priority." },
  ];
  return (
    <>
      <Section>
        <SectionHeader eyebrow="How it works" title="The tailor visit, the alteration, and the return — coordinated for you." subtitle="No more dropping things off and forgetting them. Re:Fit handles every step from your closet, back to your closet." />
      </Section>
      <Section bg="alt" className="!pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          {steps.map((s, i) => (
            <div key={i} className="rounded-xl border border-line bg-bg-card p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-brand-700">{s.icon}</div>
              <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeader title="Pricing & approval, simply" subtitle="You see the quote before any tailor starts cutting. If scope changes, we re-quote — we never bill silently." />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-700"><ShieldCheck /></div>
            <h3 className="mt-4 font-display text-lg font-semibold">Initial charge, then transparent flex</h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">You pay an initial estimate at booking. If we find more work at the pin (or you add a garment), the difference is settled with a clear, itemized adjustment in your invoice. If scope shrinks, you get the difference back.</p>
          </div>
          <div className="rounded-lg border border-line bg-bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 text-amber-700"><ShieldCheck /></div>
            <h3 className="mt-4 font-display text-lg font-semibold">Our fit guarantee</h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">If something isn't right, we re-pin and redo on us. Tailor-fault: free redo. Customer-fault: we'll re-quote at cost. Either way, you stay informed every step.</p>
          </div>
        </div>
      </Section>
      <Section bg="tint">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Try us out</h2>
          <p className="mt-3 text-ink-muted">Check your ZIP to get started.</p>
          <div className="mt-6"><ZipCheck /></div>
        </div>
      </Section>
    </>
  );
}
