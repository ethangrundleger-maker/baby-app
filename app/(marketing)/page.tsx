import Link from "next/link";
import { ZipCheck } from "@/components/marketing/zip-check";
import { Section, SectionHeader } from "@/components/ui/section";
import { ArrowRight, CheckCircle2, Clock, Home as HomeIcon, Sparkles, Star, Truck } from "lucide-react";
import { CATALOG } from "@/lib/mock/catalog";
import { formatMoney } from "@/lib/utils";

export default function Home() {
  return (
    <>
      <Hero />
      <SocialProof />
      <HowItWorks />
      <PopularServices />
      <Memberships />
      <AreasServed />
      <FAQTeaser />
      <FinalCTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg pt-12 sm:pt-20">
      <div className="absolute inset-x-0 top-0 -z-10 h-[40rem] bg-gradient-to-b from-brand-50 via-bg to-bg" />
      <div className="mx-auto max-w-page px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center pb-10 sm:pb-16">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-bg-card px-3 py-1 text-xs font-medium text-ink-soft">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" /> Concierge tailoring, in your home
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              The tailor <span className="text-brand-500">comes to you.</span>
            </h1>
            <p className="mt-5 max-w-prose text-lg text-ink-muted leading-relaxed">
              A stylist pins your garments at home. Our vetted tailors do the work. We return them, ready to wear — usually in 5–7 days.
            </p>
            <div className="mt-7 max-w-md">
              <ZipCheck />
              <p className="mt-2 text-xs text-ink-subtle">By submitting your number you agree to receive SMS — message + data rates may apply. Reply STOP anytime.</p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-brand-400 text-brand-400" /> 4.9 / 5 — 2,140 reviews</span>
              <span>Serving NYC, SF, LA</span>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-bg-tint shadow-pop">
              <HeroIllustration />
            </div>
            <FloatingStat top="6%" right="-4%" label="avg turnaround" value="5.2d" />
            <FloatingStat top="60%" left="-6%" label="Re-order rate" value="68%" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingStat({ top, left, right, label, value }: { top?: string; left?: string; right?: string; label: string; value: string }) {
  return (
    <div className="absolute hidden rounded-xl border border-line bg-bg-card px-4 py-3 shadow-pop sm:block" style={{ top, left, right }}>
      <div className="font-display text-2xl font-semibold leading-none">{value}</div>
      <div className="mt-1 text-xs text-ink-muted">{label}</div>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-brand-100 via-brand-50 to-bg-tint">
      <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#824721" stopOpacity="0.18" />
            <stop offset="1" stopColor="#824721" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <rect width="400" height="500" fill="url(#g1)" />
        <g stroke="#824721" strokeOpacity="0.4" fill="none" strokeWidth="1.4">
          <path d="M120 80 L200 50 L280 80 L260 200 L280 360 L240 470 L200 460 L160 470 L120 360 L140 200 Z" />
          <path d="M200 50 L200 460" />
          <path d="M160 110 L240 110" strokeDasharray="3 4" />
          <path d="M150 220 L250 220" strokeDasharray="3 4" />
          <path d="M155 350 L245 350" strokeDasharray="3 4" />
        </g>
        <g fill="#c4742a">
          <circle cx="160" cy="110" r="3" />
          <circle cx="240" cy="110" r="3" />
          <circle cx="150" cy="220" r="3" />
          <circle cx="250" cy="220" r="3" />
          <circle cx="155" cy="350" r="3" />
          <circle cx="245" cy="350" r="3" />
        </g>
      </svg>
    </div>
  );
}

function SocialProof() {
  return (
    <div className="border-y border-line bg-bg-card">
      <div className="mx-auto max-w-page px-5 py-10 sm:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-ink-muted">As featured in</p>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-center font-display text-lg text-ink-subtle sm:grid-cols-5">
          <span>Vogue</span>
          <span>The Cut</span>
          <span>WWD</span>
          <span>NY Mag</span>
          <span>Refinery29</span>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: <HomeIcon className="h-5 w-5" />, title: "Book or self-pin", body: "Pick a 30–60 min slot in your home, or mark up your garments yourself and we'll pick them up." },
    { icon: <Sparkles className="h-5 w-5" />, title: "We tailor", body: "A vetted, capability-matched tailor does the work in a tracked, time-budgeted alteration." },
    { icon: <Truck className="h-5 w-5" />, title: "Comes back ready", body: "Usually 5–7 days. You'll see every status — pickup, alteration, return — in the app." },
  ];
  return (
    <Section>
      <SectionHeader eyebrow="How Re:Fit works" title="Three steps. One fit." subtitle="No more dropping things off, no more clogged dry cleaners. The tailor visit, alterations, and return — all coordinated for you." />
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div key={i} className="rounded-xl border border-line bg-bg-card p-6 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-brand-700">{s.icon}</div>
            <div className="mt-4 text-xs font-medium uppercase tracking-widest text-ink-muted">Step {i + 1}</div>
            <h3 className="mt-1 font-display text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Link href="/how-it-works" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
          Read more about the process <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}

function PopularServices() {
  const popular = ["svc_hem_pants", "svc_taper_pants", "svc_take_in_dress", "svc_jacket_take_in", "svc_zipper_replace", "svc_hem_jeans"];
  const services = CATALOG.filter((s) => popular.includes(s.id));
  return (
    <Section bg="alt">
      <SectionHeader eyebrow="What we alter" title="Pricing, plainly stated." subtitle="From-prices are real prices, not bait. Members save 10–25% on every line." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className="flex items-start justify-between gap-4 rounded-lg border border-line bg-bg-card p-5">
            <div>
              <div className="font-display text-base font-semibold">{s.name}</div>
              <p className="mt-1 text-sm text-ink-muted">{s.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs text-ink-muted">from</div>
              <div className="font-display text-lg font-semibold">{formatMoney(s.default_price)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/services" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
          See the full menu <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}

function Memberships() {
  return (
    <Section>
      <div className="rounded-2xl border border-line bg-ink p-8 text-bg sm:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <div className="mb-3 text-xs font-medium uppercase tracking-widest text-brand-200">Memberships</div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Save 10–25% on every alteration.</h2>
            <p className="mt-3 max-w-prose text-bg/80">Free pickup & return, priority slots, monthly hem credits, and a dedicated stylist concierge.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/memberships" className="rounded-md bg-bg px-4 py-2.5 text-sm font-medium text-ink hover:bg-bg-alt">
                See plans
              </Link>
              <Link href="/how-it-works" className="rounded-md border border-bg/20 px-4 py-2.5 text-sm font-medium text-bg hover:bg-white/5">
                How it works
              </Link>
            </div>
          </div>
          <ul className="grid gap-2 text-sm">
            {["10–25% off every line", "Free pickup & return", "Priority pinning slots", "Monthly hem credits", "Stylist concierge"].map((b) => (
              <li key={b} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function AreasServed() {
  return (
    <Section bg="tint">
      <SectionHeader eyebrow="Where we work" title="Now serving" subtitle="We launch slowly so the tailor network is right. More cities coming." />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { city: "New York", areas: "Manhattan, Brooklyn" },
          { city: "San Francisco Bay", areas: "SF, Oakland, Berkeley" },
          { city: "Los Angeles", areas: "West LA, Silver Lake, Echo Park" },
        ].map((c) => (
          <div key={c.city} className="rounded-lg border border-line bg-bg-card p-5">
            <div className="font-display text-lg font-semibold">{c.city}</div>
            <div className="mt-1 text-sm text-ink-muted">{c.areas}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FAQTeaser() {
  const faqs = [
    { q: "How fast is turnaround?", a: "Most orders come back in 5–7 days. Members get priority routing — typically 3–5 days." },
    { q: "What if my fit isn't right?", a: "Re-pin is free. If we got it wrong, we redo it on us; if scope changed, we'll re-quote transparently." },
    { q: "Is there a minimum order?", a: "Nope. One hem is fine. Members get free pickup/return; non-members pay flat $9 round-trip." },
    { q: "Do you do men's, women's, and unisex?", a: "Yes — everyone, every closet. Our network spans wedding suits, dresses, denim, repairs, knits." },
  ];
  return (
    <Section>
      <SectionHeader eyebrow="FAQ" title="Frequently asked" />
      <div className="grid gap-4 lg:grid-cols-2">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-lg border border-line bg-bg-card p-5">
            <div className="font-display text-base font-semibold">{f.q}</div>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/help" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
          See all FAQs <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}

function FinalCTA() {
  return (
    <Section bg="alt">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">A better fit, without the errand.</h2>
        <p className="mt-3 text-lg text-ink-muted">Check your ZIP — we'll text you a code and get you scheduled.</p>
        <div className="mx-auto mt-7 max-w-md">
          <ZipCheck />
        </div>
      </div>
    </Section>
  );
}
