import { LegalShell } from "@/components/marketing/legal-shell";

export const metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <LegalShell title="Privacy policy" updated="June 1, 2026">
      <Section title="The short version">
        <p>We collect what we need to fulfill orders — your phone, address, garment notes, photos, and payment tokens. We don't sell your data. We share only what's necessary with the tailor doing your work, the courier delivering it, and the payment processor charging your card.</p>
      </Section>
      <Section title="What we collect">
        <ul className="list-disc pl-5 space-y-1">
          <li>Identity & contact: phone, name, email (optional), gender (optional, for sizing).</li>
          <li>Order data: addresses, measurements, garment photos and notes, order history.</li>
          <li>Payment: tokens from Stripe — we never see card numbers.</li>
          <li>Usage: pages viewed, events fired (see Cookies policy). No third-party advertising on app/admin surfaces.</li>
        </ul>
      </Section>
      <Section title="How we use it">
        <p>To fulfill orders, coordinate logistics, charge & refund, support customers, improve quality, and meet legal obligations.</p>
      </Section>
      <Section title="Your rights">
        <p>You can export or delete your data anytime in Account → Privacy. We honor GDPR/CCPA opt-outs end-to-end (suppressed from ad CAPIs too).</p>
      </Section>
      <Section title="Contact">
        <p>privacy@tryrefit.com</p>
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
