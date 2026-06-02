"use client";

import { useState } from "react";
import Link from "next/link";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ME } from "@/lib/mock/seed";
import { cn } from "@/lib/utils";
import { Bell, KeyRound, Lock, Shield, Smartphone, User } from "lucide-react";

const TABS = ["profile", "security", "notifications", "privacy"] as const;
type Tab = (typeof TABS)[number];

export default function AccountPage() {
  const [tab, setTab] = useState<Tab>("profile");
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Account" />
      <div className="mt-6 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-t-md px-4 py-2 text-sm capitalize", tab === t ? "border-b-2 border-brand-500 font-medium text-ink" : "text-ink-muted hover:text-ink")}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "profile" && (
          <Card>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name"><Input defaultValue={ME.name} /></Field>
                <Field label="Phone (verified)"><Input defaultValue={ME.phone} disabled /></Field>
                <Field label="Email"><Input defaultValue={ME.email} /></Field>
                <Field label="Gender (optional, for sizing)">
                  <select defaultValue={ME.gender} className="w-full rounded-md border border-line-strong bg-bg-card px-3.5 py-2.5 text-sm">
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="self_described">Self-described</option>
                    <option value="undisclosed">Prefer not to say</option>
                  </select>
                </Field>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button variant="brand">Save</Button>
              </div>
            </CardBody>
          </Card>
        )}
        {tab === "security" && (
          <div className="space-y-4">
            <Card>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-brand-600" /> <span className="font-medium">SMS one-time code</span> <Badge tone="success">primary</Badge></div>
                    <p className="mt-1 text-sm text-ink-muted">{ME.phone}</p>
                  </div>
                  <Button variant="outline" size="sm">Change number</Button>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-brand-600" /> <span className="font-medium">Passkeys</span></div>
                    <p className="mt-1 text-sm text-ink-muted">Faster sign-ins from this device with Face ID / Touch ID.</p>
                  </div>
                  <Button variant="brand" size="sm">Add passkey</Button>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-brand-600" /> <span className="font-medium">Two-factor</span> <Badge tone="info">off</Badge></div>
                    <p className="mt-1 text-sm text-ink-muted">Add a second factor (authenticator app).</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="font-medium">Active sessions</div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex justify-between"><span>iPhone 15 · Brooklyn, NY</span><span className="text-xs text-ink-muted">now</span></li>
                  <li className="flex justify-between"><span>MacBook Pro · Brooklyn, NY</span><span className="text-xs text-ink-muted">2d ago</span></li>
                </ul>
              </CardBody>
            </Card>
          </div>
        )}
        {tab === "notifications" && (
          <Card>
            <CardBody className="space-y-4">
              {["SMS — order updates", "SMS — promos & tips", "Email — receipts", "Email — newsletter"].map((label, i) => (
                <label key={label} className="flex items-center justify-between gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-ink-muted">{i % 2 === 0 ? "Required for transactional updates" : "You can opt out anytime"}</div>
                  </div>
                  <input type="checkbox" defaultChecked={i !== 3} className="h-5 w-5 rounded border-line-strong text-brand-600 focus:ring-brand-400" />
                </label>
              ))}
            </CardBody>
          </Card>
        )}
        {tab === "privacy" && (
          <div className="space-y-4">
            <Card>
              <CardBody>
                <div className="font-medium">Export your data</div>
                <p className="mt-1 text-sm text-ink-muted">Download everything Re:Fit has on you (orders, measurements, photos, billing).</p>
                <Button variant="outline" size="sm" className="mt-3">Request export</Button>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="font-medium text-danger">Delete account</div>
                <p className="mt-1 text-sm text-ink-muted">Permanent. We'll keep tax records as required by law.</p>
                <Button variant="danger" size="sm" className="mt-3"><Lock className="h-4 w-4" /> Delete account</Button>
              </CardBody>
            </Card>
            <Link href="/" className="block text-center text-sm text-ink-muted hover:text-ink">Sign out</Link>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
