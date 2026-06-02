import { Section, SectionHeader } from "@/components/ui/section";
import { MEMBERSHIP_PLANS } from "@/lib/mock/memberships";
import { formatMoney } from "@/lib/utils";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "Memberships" };

export default function Page() {
  return (
    <>
      <Section>
        <SectionHeader eyebrow="Memberships" title="Tailored, on tap." subtitle="A Re:Fit membership pays for itself in 2–3 alterations. Free pickup & return, monthly hem credits, priority slots, and 10–25% off every line." align="center" />
        <div className="grid gap-6 lg:grid-cols-3">
          {MEMBERSHIP_PLANS.map((p, i) => (
            <div key={p.id} className={`relative rounded-2xl border bg-bg-card p-7 ${i === 1 ? "border-brand-400 shadow-pop" : "border-line shadow-card"}`}>
              {i === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">Most popular</span>
              )}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold tracking-tight">{formatMoney(p.price)}</span>
                <span className="text-sm text-ink-muted">/ {p.billing_cycle === "monthly" ? "mo" : "yr"}</span>
              </div>
              <p className="mt-2 text-sm text-brand-700 font-medium">{p.discount_pct}% off every alteration</p>
              <ul className="mt-6 space-y-3 text-sm">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> <span>{b}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/app" variant={i === 1 ? "brand" : "outline"} className="mt-7 w-full" size="lg">
                Choose {p.name}
              </ButtonLink>
            </div>
          ))}
        </div>
      </Section>
      <Section bg="alt">
        <SectionHeader title="How it works with orders" />
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { t: "Discount auto-applies", b: "Every alteration gets your member price the moment it's added to your cart or proposed in a pin." },
            { t: "Free pickup & return", b: "Couriers covered — you never pay shipping again. (Up to 60mi from each hub.)" },
            { t: "Priority routing", b: "Signature members get same-week scheduling and first pick of slots." },
          ].map((x) => (
            <div key={x.t} className="rounded-lg border border-line bg-bg-card p-5">
              <div className="font-display text-base font-semibold">{x.t}</div>
              <p className="mt-2 text-sm text-ink-muted">{x.b}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
