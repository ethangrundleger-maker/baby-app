import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";

export const metadata = { title: "Pinning parties" };

export default function Page() {
  return (
    <>
      <Section>
        <SectionHeader eyebrow="Pinning parties" title="Host a pinning party." subtitle="Gather 4+ friends, we pin everyone in one visit, and the group saves up to 30%. Great for bridal parties, wedding suits, and seasonal closet edits." />
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <Card t="What it is" b="A 2-hour visit at your home where one of our senior pinners marks up every guest's garments. We bring everything we need, you bring the wine." />
            <Card t="Group discount" b="4–6 guests: 15% off. 7–10: 20%. 10+: 25%. The host gets an extra $50 credit when their party places ≥4 paid orders." />
            <Card t="How to host" b="Submit the form, pick a date, share an invite link with your friends. Each guest places their own order — billing stays separate." />
            <Card t="What to expect" b="Two hours, one pinner, full attention on each garment, fitted-coffee-table vibes. Garments are picked up afterward and back in 5–7 days." />
          </div>
          <form className="rounded-xl border border-line bg-bg-card p-6 shadow-card">
            <h3 className="font-display text-xl font-semibold">Request a party</h3>
            <p className="mt-1 text-sm text-ink-muted">We'll text you to confirm date & details.</p>
            <div className="mt-5 space-y-4">
              <Field label="Your name"><Input placeholder="Jamie Hayes" /></Field>
              <Field label="Phone"><Input inputMode="tel" placeholder="(555) 555-0123" /></Field>
              <Field label="Email (optional)"><Input type="email" placeholder="you@example.com" /></Field>
              <Field label="ZIP"><Input inputMode="numeric" maxLength={5} placeholder="11215" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Preferred date"><Input type="date" /></Field>
                <Field label="Guests"><Select defaultValue="4"><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>10+</option></Select></Field>
              </div>
              <Button variant="brand" size="lg" className="w-full" type="submit">Request a party</Button>
              <p className="text-xs text-ink-subtle">We'll text you to confirm — message + data rates may apply.</p>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}

function Card({ t, b }: { t: string; b: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg-card p-5">
      <div className="font-display text-lg font-semibold">{t}</div>
      <p className="mt-2 text-sm text-ink-muted leading-relaxed">{b}</p>
    </div>
  );
}
