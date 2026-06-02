import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { MY_MEMBERSHIP } from "@/lib/mock/seed";
import { MEMBERSHIP_PLANS } from "@/lib/mock/memberships";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/utils";
import { Check } from "lucide-react";

export default function MembershipPage() {
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === MY_MEMBERSHIP?.plan_id);
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Membership" />
      {MY_MEMBERSHIP && plan ? (
        <Card className="mt-6">
          <CardBody>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge tone="brand">active</Badge>
                <h2 className="mt-2 font-display text-2xl font-semibold">{plan.name}</h2>
                <p className="mt-1 text-sm text-ink-muted">{formatMoney(plan.price)}/{plan.billing_cycle === "monthly" ? "mo" : "yr"} · renews {formatDate(MY_MEMBERSHIP.renews_at)}</p>
              </div>
              <Button variant="outline" size="sm">Cancel</Button>
            </div>
            <ul className="mt-6 grid gap-2 text-sm">
              {plan.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 shrink-0 text-success" /><span>{b}</span></li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : (
        <Card className="mt-6 px-5 py-12 text-center">
          <p className="text-ink-muted">You're on pay-as-you-go.</p>
          <ButtonLink href="/memberships" variant="brand" className="mt-4">See plans</ButtonLink>
        </Card>
      )}

      <h2 className="mt-10 mb-3 font-display text-lg font-semibold">Change plan</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {MEMBERSHIP_PLANS.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="font-display text-lg font-semibold">{p.name}</div>
            <div className="mt-1 text-sm text-ink-muted">{formatMoney(p.price)}/{p.billing_cycle === "monthly" ? "mo" : "yr"}</div>
            <div className="mt-3 text-xs text-brand-700 font-medium">{p.discount_pct}% off alterations</div>
            <Button variant={p.id === MY_MEMBERSHIP?.plan_id ? "outline" : "brand"} size="sm" className="mt-5 w-full" disabled={p.id === MY_MEMBERSHIP?.plan_id}>
              {p.id === MY_MEMBERSHIP?.plan_id ? "Current plan" : "Switch"}
            </Button>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
