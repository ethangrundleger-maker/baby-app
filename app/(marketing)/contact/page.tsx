import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Mail, MessageSquare, Phone } from "lucide-react";

export const metadata = { title: "Contact" };

export default function Page() {
  return (
    <Section>
      <SectionHeader eyebrow="Contact" title="Get in touch." subtitle="Most questions are faster to answer in the Help center, but we're here if you need a human." />
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <form className="space-y-4 rounded-xl border border-line bg-bg-card p-6 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input placeholder="Your name" /></Field>
            <Field label="Email"><Input type="email" placeholder="you@example.com" /></Field>
          </div>
          <Field label="Topic">
            <Select defaultValue="general">
              <option value="general">General question</option>
              <option value="order">About an order</option>
              <option value="press">Press / partnerships</option>
              <option value="tailor">Tailor application</option>
              <option value="billing">Billing</option>
            </Select>
          </Field>
          <Field label="Message"><Textarea rows={6} placeholder="Tell us what's up…" /></Field>
          <Button variant="brand" size="lg" type="submit">Send message</Button>
        </form>
        <div className="space-y-4">
          <Card icon={<Phone />} t="Text us" b="(833) 555-FIT9 — typically a reply in under 15 minutes, 8am–9pm ET." />
          <Card icon={<Mail />} t="Email" b="hi@tryrefit.com — for press, partnerships, or anything not order-related." />
          <Card icon={<MessageSquare />} t="In-app chat" b="The fastest path if you're already signed in — we route by order automatically." />
        </div>
      </div>
    </Section>
  );
}

function Card({ icon, t, b }: { icon: React.ReactNode; t: string; b: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg-card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-700">{icon}</div>
      <h3 className="mt-3 font-display text-base font-semibold">{t}</h3>
      <p className="mt-1 text-sm text-ink-muted">{b}</p>
    </div>
  );
}
