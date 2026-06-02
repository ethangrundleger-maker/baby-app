"use client";

import { useState } from "react";
import { PageContainer } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { MEMBERSHIP_PLANS } from "@/lib/mock/memberships";
import { formatMoney } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Address", "Measurements", "Payment", "Membership"] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  return (
    <PageContainer className="max-w-xl">
      <div className="mb-3 flex items-center gap-2 text-xs text-brand-700 font-medium">
        <Sparkles className="h-4 w-4" />
        <span>Welcome to Re:Fit — 4 quick steps</span>
      </div>
      <Stepper step={step} />
      <Card className="mt-6">
        <CardBody>
          {step === 0 && <AddressStep />}
          {step === 1 && <MeasurementsStep />}
          {step === 2 && <PaymentStep />}
          {step === 3 && <MembershipStep />}
        </CardBody>
      </Card>
      <div className="mt-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep((s) => Math.min(3, s + 1))}>Skip</Button>
          <Button variant="brand" onClick={() => (step === 3 ? (window.location.href = "/app") : setStep((s) => s + 1))}>{step === 3 ? "Finish" : "Continue"}</Button>
        </div>
      </div>
    </PageContainer>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div>
      <div className="flex h-1 overflow-hidden rounded-full bg-bg-alt">
        <div className="bg-brand-500 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <div className="mt-2 text-xs text-ink-muted">Step {step + 1} of {STEPS.length}: {STEPS[step]}</div>
    </div>
  );
}

function AddressStep() {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold">Where should we come?</h2>
      <p className="mt-1 text-sm text-ink-muted">For pickups, drop-offs, and pinning visits.</p>
      <div className="mt-5 space-y-4">
        <Field label="Label"><Input placeholder="Home" defaultValue="Home" /></Field>
        <Field label="Address"><Input placeholder="224 Carroll St, Apt 3" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City"><Input placeholder="Brooklyn" /></Field>
          <Field label="ZIP"><Input inputMode="numeric" maxLength={5} placeholder="11231" /></Field>
        </div>
        <Field label="Access notes (optional)"><Input placeholder="Buzzer #3W, friendly dog" /></Field>
      </div>
    </>
  );
}

function MeasurementsStep() {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold">Measurements</h2>
      <p className="mt-1 text-sm text-ink-muted">Optional now — your pinner can take them at your first visit.</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {["Chest", "Waist", "Hips", "Inseam", "Shoulder", "Sleeve"].map((l) => (
          <Field key={l} label={l}><Input inputMode="decimal" placeholder='inches' /></Field>
        ))}
      </div>
    </>
  );
}

function PaymentStep() {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold">Add a payment method</h2>
      <p className="mt-1 text-sm text-ink-muted">Charged only at booking / checkout. Stored as a secure token.</p>
      <div className="mt-5 space-y-4">
        <Field label="Card number"><Input placeholder="4242 4242 4242 4242" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Exp"><Input placeholder="09/27" /></Field>
          <Field label="CVC"><Input placeholder="123" /></Field>
          <Field label="ZIP"><Input placeholder="11231" /></Field>
        </div>
        <p className="text-xs text-ink-subtle">In production this is the Stripe Payment Element. We never see your card number.</p>
      </div>
    </>
  );
}

function MembershipStep() {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold">Save 10–25% with a membership</h2>
      <p className="mt-1 text-sm text-ink-muted">Optional — most people start without one and add later.</p>
      <div className="mt-5 space-y-3">
        {MEMBERSHIP_PLANS.slice(0, 2).map((p, i) => (
          <label key={p.id} className={cn("flex cursor-pointer items-start justify-between gap-3 rounded-lg border p-4", i === 0 ? "border-line" : "border-brand-400 bg-brand-50/40")}>
            <div>
              <input type="radio" name="plan" defaultChecked={i === 1} className="mr-2 align-middle" />
              <span className="font-medium">{p.name}</span>
              <div className="text-xs text-ink-muted ml-6">{p.discount_pct}% off every alteration</div>
            </div>
            <span className="font-medium">{formatMoney(p.price)}/mo</span>
          </label>
        ))}
        <label className="flex items-center gap-2 rounded-lg border border-line p-4">
          <input type="radio" name="plan" />
          <span className="text-sm text-ink-muted">Skip — pay as I go</span>
        </label>
      </div>
    </>
  );
}
