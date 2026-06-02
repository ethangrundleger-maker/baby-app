import Link from "next/link";
import { ArrowRight, CalendarPlus, ChevronRight, Plus, Sparkles } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ME, MY_ORDERS, CREDITS, MY_MEMBERSHIP, ADDRESSES } from "@/lib/mock/seed";
import { formatMoney, formatDate, relativeDays } from "@/lib/utils";

export default function AppHome() {
  const active = MY_ORDERS.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const balance = CREDITS.reduce((a, c) => a + c.amount, 0);
  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${ME.name.split(" ")[0]}`}
        subtitle={MY_MEMBERSHIP ? `${MY_MEMBERSHIP.plan_name} member · renews ${formatDate(MY_MEMBERSHIP.renews_at)}` : "Pay-as-you-go"}
        action={
          <>
            <ButtonLink href="/app/book" variant="outline"><CalendarPlus className="h-4 w-4" /> Book pinning</ButtonLink>
            <ButtonLink href="/app/self-pin" variant="brand"><Plus className="h-4 w-4" /> Start self-pin</ButtonLink>
          </>
        }
      />

      {/* Active orders */}
      <section className="mt-8">
        <SectionTitle title="Active orders" href="/app/orders" />
        {active.length === 0 ? (
          <Card className="px-5 py-10 text-center text-ink-muted">No active orders. Start one above.</Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((o) => {
              const balanceDue = o.invoice.total - o.invoice.payments.reduce((a, p) => a + p.amount, 0);
              return (
                <Link key={o.id} href={`/app/orders/${o.id}`} className="block">
                  <Card className="p-5 hover:border-line-strong transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={o.status} />
                          {o.quote_status === "pending_approval" && <Badge tone="warn">approval needed</Badge>}
                        </div>
                        <div className="mt-2 font-display text-lg font-semibold">Order #{o.id.slice(-4)}</div>
                        <div className="text-xs text-ink-muted">{o.garments.length} garment{o.garments.length === 1 ? "" : "s"} · created {relativeDays(o.created_at)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-lg font-semibold">{formatMoney(o.current_total)}</div>
                        {balanceDue > 0.01 && <div className="text-xs text-warn">{formatMoney(balanceDue)} balance</div>}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-ink-muted">
                      <span className="flex-1 truncate">{o.garments.map((g) => g.type).join(" · ")}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Right rail cards */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-ink-muted">Credit balance</div>
          <div className="mt-2 font-display text-3xl font-semibold">{formatMoney(balance)}</div>
          <Link href="/app/referrals" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
            Share your code <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-ink-muted">Membership</div>
          <div className="mt-2 font-display text-2xl font-semibold">{MY_MEMBERSHIP?.plan_name ?? "None"}</div>
          {MY_MEMBERSHIP && <div className="text-xs text-ink-muted">renews {formatDate(MY_MEMBERSHIP.renews_at)}</div>}
          <Link href="/app/membership" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-ink-muted">Preferred address</div>
          <div className="mt-2 font-display text-base font-semibold">{ADDRESSES.find((a) => a.is_preferred)?.label}</div>
          <div className="text-xs text-ink-muted">{ADDRESSES.find((a) => a.is_preferred)?.line1}</div>
          <Link href="/app/addresses" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
            Edit <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </section>

      {/* Hero CTA strip */}
      <section className="mt-10">
        <Card className="overflow-hidden">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] items-center p-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-600 font-medium">
                <Sparkles className="h-3.5 w-3.5" /> Member tip
              </div>
              <div className="mt-2 font-display text-xl font-semibold">A new season is a good time for a closet edit.</div>
              <p className="mt-1 text-sm text-ink-muted">Members get a quarterly in-home audit — bundled in your plan.</p>
            </div>
            <ButtonLink href="/app/book" variant="brand">Schedule</ButtonLink>
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}

function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {href && <Link href={href} className="text-xs font-medium text-brand-600 hover:text-brand-700">View all</Link>}
    </div>
  );
}
