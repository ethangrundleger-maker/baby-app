"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  return (
    <Card>
      <CardBody>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Sign in to Re:Fit</h1>
        <p className="mt-1 text-sm text-ink-muted">We text you a one-time code. No passwords.</p>
        {step === "phone" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep("otp");
            }}
            className="mt-6 space-y-4"
          >
            <Field label="Phone number"><Input inputMode="tel" placeholder="(555) 555-0123" /></Field>
            <Button variant="brand" size="lg" className="w-full" type="submit">Text me a code <ArrowRight className="h-4 w-4" /></Button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/app";
            }}
            className="mt-6 space-y-4"
          >
            <Field label="6-digit code" hint="Demo: any 6 digits"><Input inputMode="numeric" maxLength={6} placeholder="123456" /></Field>
            <Button variant="brand" size="lg" className="w-full" type="submit">Verify & sign in</Button>
            <button type="button" onClick={() => setStep("phone")} className="block w-full text-center text-xs text-ink-muted hover:text-ink">Wrong number?</button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-ink-muted">
          New here? <Link href="/check-area" className="font-medium text-brand-700 hover:text-brand-800">Check your area to start</Link>
        </p>
      </CardBody>
    </Card>
  );
}
