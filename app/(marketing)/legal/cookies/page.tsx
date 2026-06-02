import { LegalShell } from "@/components/marketing/legal-shell";

export const metadata = { title: "Cookies policy" };

export default function Page() {
  return (
    <LegalShell title="Cookies policy" updated="June 1, 2026">
      <p className="text-ink-muted leading-relaxed">We use a small number of first-party cookies for analytics (anonymous usage) and ad attribution (only on the marketing surface). You can manage consent via Google Consent Mode v2 prompts. No cookies are set on the customer app or admin portal.</p>
    </LegalShell>
  );
}
