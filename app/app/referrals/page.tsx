"use client";

import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ME, CREDITS, REFERRALS } from "@/lib/mock/seed";
import { Check, Copy, Mail, Share2 } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/utils";

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const link = `https://tryrefit.com/r/${ME.referral_code}`;
  function copy() {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  const balance = CREDITS.reduce((a, c) => a + c.amount, 0);

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Refer a friend" subtitle="Share your code — they get $25 off their first order, you get $25 in credit when they place one." />

      <Card className="mt-6 bg-brand-50 border-brand-200">
        <CardBody>
          <div className="text-xs uppercase tracking-widest text-brand-700 font-medium">Your code</div>
          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-semibold tracking-tight font-mono">{ME.referral_code}</span>
            <span className="text-sm text-brand-800">/r/{ME.referral_code}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={copy} variant="brand"><Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy link"}</Button>
            <Button variant="outline"><Mail className="h-4 w-4" /> Email</Button>
            <Button variant="outline"><Share2 className="h-4 w-4" /> Share</Button>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-ink-muted">Credit balance</div>
          <div className="mt-2 font-display text-3xl font-semibold">{formatMoney(balance)}</div>
          <div className="text-xs text-ink-muted">Auto-applied to your next order.</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-ink-muted">Total referred</div>
          <div className="mt-2 font-display text-3xl font-semibold">{REFERRALS.length}</div>
          <div className="text-xs text-ink-muted">{REFERRALS.filter((r) => r.status === "rewarded").length} rewarded · {REFERRALS.filter((r) => r.status === "pending").length} pending</div>
        </Card>
      </div>

      <h2 className="mt-10 mb-3 font-display text-lg font-semibold">Referrals</h2>
      <Card className="divide-y divide-line">
        {REFERRALS.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
            <div>
              <div className="font-medium">{r.referred_client_name}</div>
              <div className="text-xs text-ink-muted">{formatDate(r.created_at)}</div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={r.status === "rewarded" ? "success" : r.status === "qualified" ? "info" : "neutral"}>{r.status}</Badge>
              {r.reward_amount && <span className="font-medium">{formatMoney(r.reward_amount)}</span>}
            </div>
          </div>
        ))}
      </Card>

      <h2 className="mt-10 mb-3 font-display text-lg font-semibold">Credit ledger</h2>
      <Card className="divide-y divide-line">
        {CREDITS.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
            <div>
              <div className="font-medium capitalize">{c.type.replace(/_/g, " ")}</div>
              <div className="text-xs text-ink-muted">{formatDate(c.created_at)}</div>
            </div>
            <div className={c.amount < 0 ? "text-ink-muted" : "font-medium text-success"}>
              {c.amount > 0 ? "+" : ""}{formatMoney(c.amount)}
            </div>
          </div>
        ))}
      </Card>
    </PageContainer>
  );
}
