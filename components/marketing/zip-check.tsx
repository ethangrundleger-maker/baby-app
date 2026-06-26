"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { checkZip } from "@/lib/mock/geography";
import { Check, X } from "lucide-react";

export function ZipCheck({ compact = false }: { compact?: boolean }) {
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"zip" | "phone" | "otp" | "done">("zip");
  const [result, setResult] = useState<ReturnType<typeof checkZip> | null>(null);

  function onZipSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{5}$/.test(zip)) return;
    setResult(checkZip(zip));
    setStep("phone");
  }

  function onPhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("otp");
  }

  function onOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("done");
  }

  return (
    <div className={compact ? "" : "rounded-xl border border-line bg-bg-card p-5 shadow-card"}>
      {step === "zip" && (
        <form onSubmit={onZipSubmit} className="flex flex-col gap-2 sm:flex-row">
          <Input
            inputMode="numeric"
            placeholder="Enter your ZIP"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, ""))}
            className="sm:flex-1 text-base"
          />
          <Button size="lg" variant="brand" type="submit">
            Check
          </Button>
        </form>
      )}
      {step === "phone" && result && (
        <div>
          {result.in_service_area ? (
            <div className="mb-3 flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>
                We serve <strong>{zip}</strong> ({result.area?.name}). Drop your number — we'll send a one-time code to get you started.
              </span>
            </div>
          ) : (
            <div className="mb-3 flex items-start gap-2 text-sm">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
              <span>
                Not in <strong>{zip}</strong> yet. Drop your number and we'll text you the moment we land in your area.
              </span>
            </div>
          )}
          <form onSubmit={onPhoneSubmit} className="flex flex-col gap-2 sm:flex-row">
            <Input
              inputMode="tel"
              placeholder="(555) 555-0123"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="sm:flex-1"
            />
            <Button size="lg" variant="brand" type="submit">
              {result.in_service_area ? "Get my code" : "Join waitlist"}
            </Button>
          </form>
        </div>
      )}
      {step === "otp" && (
        <form onSubmit={onOtpSubmit} className="flex flex-col gap-2 sm:flex-row">
          <Input inputMode="numeric" placeholder="6-digit code" maxLength={6} className="sm:flex-1" />
          <Button size="lg" variant="brand" type="submit">
            Verify
          </Button>
        </form>
      )}
      {step === "done" && (
        <div className="space-y-3">
          <div className="rounded-md bg-success/10 p-4 text-sm text-success">
            <Check className="mr-2 inline h-4 w-4" />
            {result?.in_service_area ? "You're in! Let's set up your account." : "You're on the list — we'll text the moment we open up your area."}
          </div>
          {result?.in_service_area && (
            <a href="/app/onboarding" className="block w-full rounded-lg bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
              Create account →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
