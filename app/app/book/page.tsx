"use client";

import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { ADDRESSES, SLOTS, ME } from "@/lib/mock/seed";
import { formatDate, formatMoney, formatTime, cn } from "@/lib/utils";
import { Check, Calendar, MapPin, CreditCard } from "lucide-react";

const STEPS = ["Date & slot", "Address", "Payment", "Confirm"] as const;

export default function BookPage() {
  const [step, setStep] = useState(0);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(ADDRESSES.find((a) => a.is_preferred)?.id ?? null);
  const initialCharge = 75;

  const slotsByDate = SLOTS.reduce<Record<string, typeof SLOTS>>((acc, s) => {
    const d = formatDate(s.starts_at, { month: "short", day: "numeric", weekday: "short" });
    acc[d] = acc[d] || [];
    acc[d].push(s);
    return acc;
  }, {});

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Book a pinning visit" subtitle="A stylist comes to you. 30–60 minutes. We confirm everything before anything leaves." />

      <Stepper step={step} />

      {step === 0 && (
        <Card className="mt-6">
          <CardBody>
            <div className="space-y-6">
              {Object.entries(slotsByDate).slice(0, 4).map(([date, slots]) => (
                <div key={date}>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Calendar className="h-4 w-4 text-ink-muted" />{date}</div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {slots.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSlotId(s.id)}
                        className={cn("rounded-md border px-3 py-2 text-sm", slotId === s.id ? "border-brand-500 bg-brand-50 font-medium" : "border-line bg-bg-card hover:border-line-strong")}
                      >
                        {formatTime(s.starts_at)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {step === 1 && (
        <Card className="mt-6">
          <CardBody>
            <div className="space-y-3">
              {ADDRESSES.map((a) => (
                <label key={a.id} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-4", addressId === a.id ? "border-brand-500 bg-brand-50/40" : "border-line hover:border-line-strong")}>
                  <input type="radio" name="addr" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1" />
                  <div>
                    <div className="font-medium">{a.label} {a.is_preferred && <span className="text-xs text-ink-muted">(preferred)</span>}</div>
                    <div className="text-sm text-ink-muted">{a.line1}, {a.city} {a.zip}</div>
                    {a.access_notes && <div className="text-xs text-ink-muted mt-1">Notes: {a.access_notes}</div>}
                  </div>
                </label>
              ))}
              <Button variant="outline" size="sm">+ Add another address</Button>
            </div>
            <div className="mt-6">
              <Field label="Promo code (optional)"><Input placeholder="e.g. WELCOME15" /></Field>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-6">
          <CardBody>
            <Field label="Payment method">
              <Select defaultValue="pm_1">
                <option value="pm_1">Visa •4242 (default)</option>
                <option value="pm_2">Amex •1003</option>
                <option value="new">+ Add new card</option>
              </Select>
            </Field>
            <div className="mt-6 rounded-md border border-line bg-bg-alt p-4 text-sm">
              <div className="flex justify-between"><span className="text-ink-muted">Initial charge today</span><span className="font-medium">{formatMoney(initialCharge)}</span></div>
              <div className="mt-1 text-xs text-ink-muted">Covers the pinning visit + estimated alterations. Adjusted up or down once the pin confirms scope.</div>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 3 && (
        <Card className="mt-6">
          <CardBody>
            <h3 className="font-display text-lg font-semibold">You're all set</h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              <li><strong className="text-ink">Slot:</strong> {SLOTS.find((s) => s.id === slotId)?.starts_at && formatDate(SLOTS.find((s) => s.id === slotId)!.starts_at, { weekday: "long", month: "long", day: "numeric" })} at {SLOTS.find((s) => s.id === slotId)?.starts_at && formatTime(SLOTS.find((s) => s.id === slotId)!.starts_at)}</li>
              <li><strong className="text-ink">Address:</strong> {ADDRESSES.find((a) => a.id === addressId)?.line1}</li>
              <li><strong className="text-ink">Initial charge:</strong> {formatMoney(initialCharge)}</li>
            </ul>
            <p className="mt-5 text-sm text-ink-muted">You'll get an SMS confirmation with our pinner's name and a tracking link.</p>
          </CardBody>
        </Card>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
        <Button
          variant="brand"
          onClick={() => {
            if (step === 3) {
              window.location.href = "/app";
              return;
            }
            setStep((s) => Math.min(3, s + 1));
          }}
          disabled={(step === 0 && !slotId) || (step === 1 && !addressId)}
        >
          {step === 3 ? "Confirm booking" : step === 2 ? `Pay ${formatMoney(initialCharge)} & confirm` : "Continue"}
        </Button>
      </div>
    </PageContainer>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mt-6 flex items-center gap-2 text-xs">
      {STEPS.map((label, i) => (
        <li key={label} className={cn("flex flex-1 items-center gap-2", i < step && "text-success", i === step && "text-ink font-medium", i > step && "text-ink-muted")}>
          <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border", i < step ? "border-success bg-success/10" : i === step ? "border-brand-500 bg-brand-100" : "border-line")}>
            {i < step ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          <span className="hidden sm:inline">{label}</span>
        </li>
      ))}
    </ol>
  );
}
