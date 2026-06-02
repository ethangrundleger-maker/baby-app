"use client";

import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { CATALOG } from "@/lib/mock/catalog";
import { formatMoney, cn } from "@/lib/utils";
import { ChevronLeft, Plus, Trash2, X } from "lucide-react";

type GarmentDraft = { id: string; type: string; description: string; serviceIds: string[] };

export default function SelfPin() {
  const [garments, setGarments] = useState<GarmentDraft[]>([]);
  const [step, setStep] = useState<"build" | "review">("build");

  const subtotal = garments.reduce((sum, g) => sum + g.serviceIds.reduce((s, sid) => s + (CATALOG.find((c) => c.id === sid)?.default_price ?? 0), 0), 0);
  const memberDiscount = subtotal * 0.2;
  const total = subtotal - memberDiscount;

  function addGarment() {
    setGarments((g) => [...g, { id: `tmp_${Date.now()}`, type: "", description: "", serviceIds: [] }]);
  }
  function updateGarment(id: string, patch: Partial<GarmentDraft>) {
    setGarments((g) => g.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function removeGarment(id: string) {
    setGarments((g) => g.filter((x) => x.id !== id));
  }

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title={step === "build" ? "Self-pin builder" : "Review your order"} subtitle={step === "build" ? "Add each garment, mark what to alter, write notes. We'll pick everything up." : "Confirm and pay the initial charge."} />

      {step === "build" ? (
        <>
          <div className="mt-6 space-y-4">
            {garments.length === 0 && (
              <Card className="px-5 py-12 text-center">
                <p className="text-ink-muted mb-3">Add your first garment to start.</p>
                <Button variant="brand" onClick={addGarment}><Plus className="h-4 w-4" /> Add garment</Button>
              </Card>
            )}
            {garments.map((g, idx) => (
              <Card key={g.id}>
                <CardBody>
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-display text-base font-semibold">Garment {idx + 1}</div>
                    <Button size="sm" variant="ghost" onClick={() => removeGarment(g.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Type"><Input placeholder="e.g. suit pants, linen dress" value={g.type} onChange={(e) => updateGarment(g.id, { type: e.target.value })} /></Field>
                    <Field label="Description"><Input placeholder="brand, color, anything specific" value={g.description} onChange={(e) => updateGarment(g.id, { description: e.target.value })} /></Field>
                  </div>
                  <div className="mt-4">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-muted">What to alter</label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {CATALOG.map((s) => {
                        const on = g.serviceIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            onClick={() =>
                              updateGarment(g.id, { serviceIds: on ? g.serviceIds.filter((i) => i !== s.id) : [...g.serviceIds, s.id] })
                            }
                            className={cn("flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm", on ? "border-brand-500 bg-brand-50/50" : "border-line hover:border-line-strong bg-bg-card")}
                          >
                            <span>
                              <span className="block font-medium">{s.name}</span>
                              <span className="block text-xs text-ink-muted">{s.standard_minutes}m</span>
                            </span>
                            <span className="font-medium">{formatMoney(s.default_price)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-3">
                    <Field label="Notes (optional)"><Textarea rows={2} placeholder="e.g. crop to 28&quot;, keep original hem" /></Field>
                  </div>
                </CardBody>
              </Card>
            ))}
            {garments.length > 0 && (
              <Button variant="outline" onClick={addGarment}><Plus className="h-4 w-4" /> Add another garment</Button>
            )}
          </div>

          {garments.length > 0 && (
            <SummarySidebar subtotal={subtotal} memberDiscount={memberDiscount} total={total} onContinue={() => setStep("review")} />
          )}
        </>
      ) : (
        <ReviewStep subtotal={subtotal} memberDiscount={memberDiscount} total={total} garments={garments} onBack={() => setStep("build")} />
      )}
    </PageContainer>
  );
}

function SummarySidebar({ subtotal, memberDiscount, total, onContinue }: { subtotal: number; memberDiscount: number; total: number; onContinue: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg-card lg:sticky lg:bottom-auto lg:top-4 lg:mt-6 lg:rounded-lg lg:border">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="text-sm">
          <div className="text-ink-muted">Subtotal: {formatMoney(subtotal)} {memberDiscount > 0 && <span className="text-success">· − {formatMoney(memberDiscount)} member</span>}</div>
          <div className="font-display text-xl font-semibold">{formatMoney(total)}</div>
        </div>
        <Button variant="brand" onClick={onContinue}>Continue to checkout</Button>
      </div>
    </div>
  );
}

function ReviewStep({ subtotal, memberDiscount, total, garments, onBack }: { subtotal: number; memberDiscount: number; total: number; garments: GarmentDraft[]; onBack: () => void }) {
  return (
    <>
      <Button variant="ghost" className="mt-2" onClick={onBack}><ChevronLeft className="h-4 w-4" /> Back to builder</Button>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardBody>
            <h3 className="font-display text-lg font-semibold">Order summary</h3>
            <div className="mt-4 space-y-4">
              {garments.map((g, i) => (
                <div key={g.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                  <div className="font-medium">{g.type || `Garment ${i + 1}`}</div>
                  {g.description && <div className="text-xs text-ink-muted">{g.description}</div>}
                  <ul className="mt-2 space-y-1 text-sm">
                    {g.serviceIds.map((sid) => {
                      const s = CATALOG.find((c) => c.id === sid)!;
                      return (
                        <li key={sid} className="flex justify-between">
                          <span>{s.name}</span><span className="font-medium">{formatMoney(s.default_price)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="font-display text-lg font-semibold">Charge today</h3>
            <div className="mt-4 space-y-1 text-sm">
              <Line l="Subtotal" v={formatMoney(subtotal)} />
              <Line l="Member discount (20%)" v={`-${formatMoney(memberDiscount)}`} />
              <div className="my-2 border-t border-line" />
              <Line l="Total" v={formatMoney(total)} strong />
            </div>
            <Field label="Payment method" className="mt-5">
              <Select><option>Visa •4242 (default)</option><option>Amex •1003</option></Select>
            </Field>
            <Button variant="brand" size="lg" className="mt-5 w-full">Pay {formatMoney(total)} & schedule pickup</Button>
            <p className="mt-2 text-xs text-ink-subtle">Picked up at your preferred address. Free for Signature members.</p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Line({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return <div className="flex justify-between"><span className={strong ? "font-display text-base font-semibold" : "text-ink-muted"}>{l}</span><span className={strong ? "font-display text-base font-semibold" : "font-medium"}>{v}</span></div>;
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</label>
      {children}
    </div>
  );
}
