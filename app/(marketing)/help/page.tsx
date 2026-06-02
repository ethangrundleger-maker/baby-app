"use client";

import { useMemo, useState } from "react";
import { Section, SectionHeader } from "@/components/ui/section";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";

type FAQ = { q: string; a: string };
const FAQS: { topic: string; items: FAQ[] }[] = [
  {
    topic: "Getting started",
    items: [
      { q: "How do I sign up?", a: "Enter your ZIP, drop your number, and confirm the SMS code. You're in. We launch slowly so every area has the right pinner / tailor coverage." },
      { q: "Do I need to download an app?", a: "Not for V1. The whole experience is mobile-web — you can add it to your home screen for one-tap access." },
      { q: "What does it cost to try?", a: "There's no membership required. Pay-as-you-go starts at $22 for a hem. Pickup & return is $9 round-trip for non-members." },
    ],
  },
  {
    topic: "Pinning",
    items: [
      { q: "What happens at a pinning visit?", a: "Our pinner arrives at your scheduled time, marks every adjustment, photographs each garment, and confirms a quote before anything leaves. Usually 30–60 minutes." },
      { q: "Can I self-pin instead?", a: "Yes — use the self-pin builder in the app. You'll select services, add notes/photos per garment, and we'll pick everything up at your address." },
      { q: "Can multiple people share a pin?", a: "Yes — that's a 'pinning party' (4+ guests). The host gets a credit and the group gets 15–25% off." },
    ],
  },
  {
    topic: "Pricing & payment",
    items: [
      { q: "How is the order priced?", a: "You pay an initial estimate at booking. Real scope is confirmed at the pin; if it changes, the diff is itemized and settled (extra charge or refund/credit)." },
      { q: "What's a member discount?", a: "10% (Essentials), 20% (Signature), 25% (Signature Annual) on every alteration & repair, plus free pickup/return." },
      { q: "How do refunds work?", a: "If we did less work than estimated, the difference refunds to your original method by default — or you can convert to account credit for instant use." },
    ],
  },
  {
    topic: "Turnaround & delivery",
    items: [
      { q: "How fast?", a: "Most orders return in 5–7 days from pickup. Members get same-week priority — typically 3–5 days." },
      { q: "Who picks up my garments?", a: "Either a Re:Fit driver or a vetted local courier (Veho, etc.). You'll see live status in the app." },
      { q: "Can I reschedule?", a: "Yes — up to 6 hours before your pin slot, free. After that, a small fee may apply." },
    ],
  },
  {
    topic: "Memberships",
    items: [
      { q: "Can I cancel anytime?", a: "Yes — no commitment. Annual plans pro-rate." },
      { q: "Do credits roll over?", a: "Yes, indefinitely, while your membership is active." },
    ],
  },
  {
    topic: "Account",
    items: [
      { q: "How do I update my address?", a: "Account → Addresses. You can have multiple and set a default." },
      { q: "Where are my measurements stored?", a: "Securely in your account — only you and your assigned tailor can see them. Re-used across all orders." },
    ],
  },
];

export default function Page() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return FAQS;
    const q = query.toLowerCase();
    return FAQS.map((t) => ({ ...t, items: t.items.filter((it) => (it.q + " " + it.a).toLowerCase().includes(q)) })).filter((t) => t.items.length);
  }, [query]);

  return (
    <Section>
      <SectionHeader eyebrow="Help" title="Frequently asked." subtitle="Can't find what you need? Drop us a line — we usually reply in under an hour during business hours." />
      <div className="mb-10 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <Input className="pl-10" placeholder="Search FAQs" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      <div className="space-y-12">
        {filtered.map((topic) => (
          <div key={topic.topic}>
            <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">{topic.topic}</h2>
            <div className="rounded-lg border border-line bg-bg-card">
              {topic.items.map((item, i) => (
                <details key={i} className="group border-t border-line first:border-t-0">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="font-medium">{item.q}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-ink-muted leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
