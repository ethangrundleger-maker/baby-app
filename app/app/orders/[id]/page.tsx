import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MessageSquare, Receipt } from "lucide-react";
import { PageContainer } from "@/components/app/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getMyOrder } from "@/lib/mock/seed";
import { formatDate, formatMoney, formatTime } from "@/lib/utils";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getMyOrder(id);
  if (!order) notFound();

  const balanceDue = order.invoice.total - order.invoice.payments.reduce((a, p) => a + p.amount, 0);
  const totalRefunded = order.invoice.refunds.reduce((a, r) => a + r.amount, 0);

  return (
    <PageContainer className="max-w-4xl">
      <Link href="/app/orders" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> All orders</Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            {order.quote_status === "pending_approval" && <Badge tone="warn">approval needed</Badge>}
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight">Order #{order.id.slice(-4)}</h1>
          <p className="mt-1 text-sm text-ink-muted">Created {formatDate(order.created_at)} · {order.type === "self_pin" ? "Self-pin" : "Booked pinning"}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-ink-muted">Current total</div>
          <div className="font-display text-3xl font-semibold">{formatMoney(order.current_total)}</div>
          {order.estimated_total !== order.current_total && (
            <div className="text-xs text-ink-muted">est. {formatMoney(order.estimated_total)}</div>
          )}
        </div>
      </div>

      {/* Quote pending banner */}
      {order.quote_status === "pending_approval" && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-lg font-semibold text-amber-900">Quote ready for your approval</div>
              <p className="mt-1 text-sm text-amber-800">We've finalized the alteration plan. Approve to begin work, or decline and we'll return the garment.</p>
            </div>
            <ButtonLink href={`/app/orders/${order.id}/approve`} variant="primary">Review quote</ButtonLink>
          </div>
        </div>
      )}

      {/* Balance / refund banner */}
      {balanceDue > 0.01 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-base font-semibold text-amber-900">Balance due: {formatMoney(balanceDue)}</div>
              <p className="mt-1 text-sm text-amber-800">Will be charged to your default payment method when the order is complete.</p>
            </div>
            <ButtonLink href="/app/billing/cards" variant="outline">Manage cards</ButtonLink>
          </div>
        </div>
      )}
      {totalRefunded > 0 && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <strong>{formatMoney(totalRefunded)} refunded</strong> back to your original payment method (scope decrease).
        </div>
      )}

      {/* Garments */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold">Garments</h2>
        <div className="space-y-3">
          {order.garments.map((g) => (
            <Card key={g.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={g.status} />
                    {g.tailor_name && <span className="text-xs text-ink-muted">with {g.tailor_name}</span>}
                  </div>
                  <div className="mt-1.5 font-display text-base font-semibold">{g.type}</div>
                  {g.description && <div className="text-xs text-ink-muted">{g.description}</div>}
                </div>
                <div className="text-right text-xs text-ink-muted">
                  est. {g.estimated_minutes}m
                </div>
              </div>
              <div className="mt-3 divide-y divide-line border-t border-line">
                {g.adjustments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div className="flex items-center gap-3">
                      <span className={a.status === "completed" ? "text-success" : "text-ink-subtle"}>
                        {a.status === "completed" ? <Check className="h-4 w-4" /> : <span className="block h-2 w-2 rounded-full bg-current" />}
                      </span>
                      <div>
                        <div>{a.service_name}{a.qty > 1 ? ` × ${a.qty}` : ""}</div>
                        <div className="text-xs text-ink-muted capitalize">{a.status.replace(/_/g, " ")}</div>
                      </div>
                    </div>
                    <div className="font-medium">{formatMoney(a.amount)}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Revisions timeline */}
      {order.revisions.length > 1 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold">Revisions</h2>
          <Card className="divide-y divide-line">
            {order.revisions.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div>
                  <div className="font-medium capitalize">{r.reason.replace(/_/g, " ")}</div>
                  <div className="text-xs text-ink-muted">{formatDate(r.created_at)} · {r.created_by_staff_name ?? "system"}</div>
                </div>
                <div className="text-right">
                  <div className={r.delta < 0 ? "text-emerald-700 font-medium" : "font-medium"}>
                    {r.delta > 0 ? "+" : ""}{formatMoney(r.delta)}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {formatMoney(r.previous_total)} → {formatMoney(r.new_total)}{r.settlement && r.settlement !== "none" ? ` · ${r.settlement}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </section>
      )}

      {/* Delivery tracking */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold">Delivery</h2>
        <Card className="divide-y divide-line">
          {order.deliveries.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div>
                <div className="font-medium capitalize">{d.leg_type.replace(/_/g, " ")}</div>
                <div className="text-xs text-ink-muted">{d.method?.replace(/_/g, " ")} {d.provider && `· ${d.provider}`}</div>
              </div>
              <div className="text-right">
                <Badge tone={d.status === "completed" ? "success" : d.status === "scheduled" ? "info" : "neutral"}>{d.status}</Badge>
                {d.scheduled_at && <div className="mt-1 text-xs text-ink-muted">{formatDate(d.scheduled_at)} · {formatTime(d.scheduled_at)}</div>}
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* Status timeline */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold">History</h2>
        <Card>
          <ol className="divide-y divide-line">
            {order.status_events.map((se) => (
              <li key={se.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div>
                  <div className="font-medium">
                    <span className="capitalize">{se.entity_type}</span> → <span className="capitalize">{se.to_status.replace(/_/g, " ")}</span>
                  </div>
                  <div className="text-xs text-ink-muted">by {se.changed_by ?? "system"}</div>
                </div>
                <div className="text-xs text-ink-muted">{formatDate(se.changed_at)} · {formatTime(se.changed_at)}</div>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* Invoice */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Invoice</h2>
          <ButtonLink href="/app/billing" variant="ghost" size="sm"><Receipt className="h-4 w-4" /> Billing</ButtonLink>
        </div>
        <Card>
          <CardBody>
            <ul className="space-y-2 text-sm">
              {order.invoice.lines.map((l) => (
                <li key={l.id} className="flex justify-between">
                  <span className={l.amount < 0 ? "text-ink-muted" : ""}>{l.description}</span>
                  <span className={l.amount < 0 ? "text-ink-muted" : "font-medium"}>{formatMoney(l.amount)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
              <Row label="Subtotal" value={formatMoney(order.invoice.subtotal)} />
              {order.invoice.discount_total > 0 && <Row label="Discount" value={`-${formatMoney(order.invoice.discount_total)}`} />}
              {order.invoice.credit_applied > 0 && <Row label="Credit applied" value={`-${formatMoney(order.invoice.credit_applied)}`} />}
              {order.invoice.tax > 0 && <Row label="Tax" value={formatMoney(order.invoice.tax)} />}
              <Row label="Total" value={formatMoney(order.invoice.total)} strong />
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="mt-8 rounded-lg border border-line bg-bg-card p-5 flex items-center justify-between gap-4">
        <div>
          <div className="font-display text-base font-semibold">Need help with this order?</div>
          <div className="text-sm text-ink-muted">We'll route directly to the team handling it.</div>
        </div>
        <ButtonLink href="/contact" variant="outline"><MessageSquare className="h-4 w-4" /> Contact us</ButtonLink>
      </section>
    </PageContainer>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={strong ? "font-display text-base font-semibold" : "text-ink-muted"}>{label}</span>
      <span className={strong ? "font-display text-base font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}
