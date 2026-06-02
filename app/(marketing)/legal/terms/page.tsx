import { LegalShell } from "@/components/marketing/legal-shell";

export const metadata = { title: "Terms of service" };

export default function Page() {
  return (
    <LegalShell title="Terms of service" updated="June 1, 2026">
      <Section title="1. Agreement">
        <p>By using Re:Fit, you agree to these Terms. If you don't agree, please don't use the service.</p>
      </Section>
      <Section title="2. The service">
        <p>Re:Fit is a concierge marketplace connecting clients with vetted independent tailors. We coordinate pinning visits, logistics, and billing. Tailoring work is performed by independent professionals; Re:Fit warrants the result via our fit guarantee.</p>
      </Section>
      <Section title="3. Pricing & payment">
        <p>An initial charge is collected at booking based on the estimated scope. Final price is confirmed in the app and may flex up or down as scope is finalized. All differences are itemized and settled (extra charge, refund, or account credit). Members save 10–25% on every alteration line.</p>
      </Section>
      <Section title="4. Fit guarantee">
        <p>If we got it wrong, we redo on us. Tailor-fault: free redo. Customer-fault changes: re-quoted at cost. Refund or credit available where appropriate. See Help → "How refunds work".</p>
      </Section>
      <Section title="5. Cancellations">
        <p>You may cancel up to 6 hours before a pinning visit at no cost. Late cancellations may incur a service fee.</p>
      </Section>
      <Section title="6. Memberships">
        <p>Memberships renew automatically until canceled. Cancel anytime; annual plans pro-rate.</p>
      </Section>
      <Section title="7. Limitation of liability">
        <p>Re:Fit's liability is limited to the value of the garment at the time of pickup. See Help → "What if a garment is damaged" for the full process.</p>
      </Section>
      <Section title="8. Contact">
        <p>Questions? hi@tryrefit.com.</p>
      </Section>
    </LegalShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 text-ink-muted leading-relaxed">{children}</div>
    </section>
  );
}
