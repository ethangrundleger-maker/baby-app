import { Section, SectionHeader } from "@/components/ui/section";
import { CATALOG } from "@/lib/mock/catalog";
import { formatMoney } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "Services & pricing" };

export default function Page() {
  const alterations = CATALOG.filter((s) => s.category === "alteration");
  const repairs = CATALOG.filter((s) => s.category === "repair");
  return (
    <>
      <Section>
        <SectionHeader eyebrow="Services & pricing" title="Alterations & repairs we do." subtitle="Real prices — not bait. Members save 10–25% on every line. Final price is confirmed at the pin." />
        <div className="mb-12 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
          <strong>Pricing is hub-aware.</strong> Defaults shown here are NYC; SF & LA pricing is comparable but verified at booking based on your service area.
        </div>
        <Table title="Alterations" items={alterations} />
        <div className="h-12" />
        <Table title="Repairs" items={repairs} />
      </Section>
      <Section bg="alt">
        <div className="rounded-2xl bg-bg-card border border-line p-8 sm:p-12">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] items-center">
            <div>
              <h3 className="font-display text-2xl font-semibold">Don't see your alteration?</h3>
              <p className="mt-2 text-ink-muted">Custom pieces, wedding gowns, leather, restoration — our tailors handle it. Book a pin and we'll quote at the visit.</p>
            </div>
            <div className="flex gap-3">
              <ButtonLink href="/app/book" variant="brand" size="lg">Book a pinning</ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg">Contact us</ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Table({ title, items }: { title: string; items: typeof CATALOG }) {
  return (
    <div>
      <h3 className="mb-4 font-display text-2xl font-semibold">{title}</h3>
      <div className="overflow-hidden rounded-lg border border-line bg-bg-card">
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Standard time</th>
              <th className="px-5 py-3 font-medium text-right">From</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-5 py-4">
                  <div className="font-medium">{s.name}</div>
                  {s.description && <div className="text-ink-muted text-xs mt-1">{s.description}</div>}
                </td>
                <td className="px-5 py-4 hidden md:table-cell text-ink-muted">{s.standard_minutes} min</td>
                <td className="px-5 py-4 text-right font-semibold">{formatMoney(s.default_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
