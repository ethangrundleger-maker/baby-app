import { Section, SectionHeader } from "@/components/ui/section";

export const metadata = { title: "About" };

export default function Page() {
  return (
    <>
      <Section>
        <SectionHeader eyebrow="About Re:Fit" title="Better-fitting clothes shouldn't be an errand." subtitle="We're rebuilding the most important part of how clothes work — the fit — for the way people actually live now." />
        <div className="prose-rf max-w-prose text-ink-muted text-base leading-relaxed space-y-5">
          <p>Most people own clothes that don't quite fit. Most tailors are an out-of-the-way errand. We're rebuilding the relationship: a vetted network of master tailors, a logistics layer that handles every pickup and return, and a stylist who marks up your garments in your own home.</p>
          <p>Re:Fit was founded in 2025 by a team out of fashion, software, and operations. We launched in Brooklyn, added Manhattan, the SF Bay, and LA over the next year, and now serve thousands of orders a month. Our tailors typically have 15+ years of experience and are paid materially above market — we believe the craft deserves it.</p>
        </div>
      </Section>
      <Section bg="alt">
        <SectionHeader title="How we vet tailors" />
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { t: "Capability-tested", b: "Every tailor demonstrates each service before it's added to their profile. We only assign work they've proven." },
            { t: "Quality-checked", b: "Every garment passes a QC review before it ships back to you — measurements verified against the pin." },
            { t: "Reviewed openly", b: "Tailors are rated per adjustment. A persistent negative pattern means a re-onboarding (or off-boarding)." },
          ].map((x) => (
            <div key={x.t} className="rounded-lg border border-line bg-bg-card p-5">
              <h3 className="font-display text-base font-semibold">{x.t}</h3>
              <p className="mt-2 text-sm text-ink-muted">{x.b}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeader title="Our standards" />
        <ul className="grid gap-4 sm:grid-cols-2 text-sm text-ink-muted">
          <li className="rounded-lg border border-line bg-bg-card p-5"><strong className="block text-ink font-display text-base">Honest pricing.</strong> Prices on the menu are what we charge. Members save 10–25%. Any change is itemized and re-quoted.</li>
          <li className="rounded-lg border border-line bg-bg-card p-5"><strong className="block text-ink font-display text-base">Fit guarantee.</strong> If we got it wrong, we redo on us. No bickering.</li>
          <li className="rounded-lg border border-line bg-bg-card p-5"><strong className="block text-ink font-display text-base">Real names, real reviews.</strong> Your pinner and tailor both appear in the app with photos.</li>
          <li className="rounded-lg border border-line bg-bg-card p-5"><strong className="block text-ink font-display text-base">Data, not vibes.</strong> Every order is tracked end-to-end. We share the timeline with you, always.</li>
        </ul>
      </Section>
    </>
  );
}
