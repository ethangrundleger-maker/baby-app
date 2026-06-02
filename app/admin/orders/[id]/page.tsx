import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, RefreshCcw, Send } from "lucide-react";
import { AdminPage } from "@/components/admin/page";
import { Card, CardBody } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrder, STAFF } from "@/lib/mock/seed";
import { formatDate, formatMoney, formatTime } from "@/lib/utils";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();

  const tailors = STAFF.filter((s) => s.role === "tailor" && s.active);
  const balanceDue = order.invoice.total - order.invoice.payments.reduce((a, p) => a + p.amount, 0);

  return (
    <AdminPage>
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Orders</Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            {order.quote_status === "pending_approval" && <Badge tone="warn">approval pending</Badge>}
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">Order #{order.id.slice(-4)}</h1>
          <p className="text-sm text-ink-muted">{order.client_name} · Created {formatDate(order.created_at)} · {order.type === "self_pin" ? "Self-pin" : "Booked"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><MessageSquare className="h-4 w-4" /> Message client</Button>
          <Button variant="outline" size="sm"><RefreshCcw className="h-4 w-4" /> Add revision</Button>
          <Button variant="primary" size="sm"><Send className="h-4 w-4" /> Send quote</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody>
              <h2 className="font-display text-lg font-semibold mb-4">Garments & adjustments</h2>
              <div className="space-y-4">
                {order.garments.map((g) => (
                  <div key={g.id} className="rounded-lg border border-line p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{g.type}</div>
                        <div className="text-xs text-ink-muted">{g.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={g.status} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="text-ink-muted">Tailor:</span>
                      <select className="rounded-md border border-line bg-bg-card px-2 py-1" defaultValue={g.tailor_id ?? ""}>
                        <option value="">— unassigned —</option>
                        {tailors.map((t) => {
                          const canDoAll = g.adjustments.every((a) => t.capabilities?.includes(a.service_id));
                          return (
                            <option key={t.id} value={t.id} disabled={!canDoAll}>
                              {t.name} {canDoAll ? "" : " — missing capability"}
                            </option>
                          );
                        })}
                      </select>
                      <span className="text-ink-muted">·</span>
                      <span className="text-ink-muted">est. {g.estimated_minutes}m</span>
                    </div>
                    <ul className="mt-3 divide-y divide-line text-sm">
                      {g.adjustments.map((a) => (
                        <li key={a.id} className="flex items-center justify-between py-2">
                          <div>
                            <div>{a.service_name}{a.qty > 1 ? ` × ${a.qty}` : ""}</div>
                            <div className="text-xs text-ink-muted">payout {formatMoney(a.payout_amount)} · status: {a.status}</div>
                          </div>
                          <div className="font-medium">{formatMoney(a.amount)}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="font-display text-lg font-semibold mb-4">Order revisions</h2>
              <ul className="divide-y divide-line text-sm">
                {order.revisions.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium capitalize">{r.reason.replace(/_/g, " ")}</div>
                      <div className="text-xs text-ink-muted">{formatDate(r.created_at)} · {r.created_by_staff_name ?? "system"}</div>
                    </div>
                    <div className="text-right">
                      <div className={r.delta < 0 ? "text-emerald-700 font-medium" : "font-medium"}>{r.delta > 0 ? "+" : ""}{formatMoney(r.delta)}</div>
                      <div className="text-xs text-ink-muted">{formatMoney(r.previous_total)} → {formatMoney(r.new_total)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="font-display text-lg font-semibold mb-4">History</h2>
              <ol className="divide-y divide-line text-sm">
                {order.status_events.map((se) => (
                  <li key={se.id} className="flex justify-between py-2">
                    <div>
                      <div><span className="capitalize">{se.entity_type}</span> → <span className="capitalize">{se.to_status.replace(/_/g, " ")}</span></div>
                      <div className="text-xs text-ink-muted">by {se.changed_by}</div>
                    </div>
                    <div className="text-xs text-ink-muted">{formatDate(se.changed_at)} · {formatTime(se.changed_at)}</div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody>
              <h2 className="font-display text-base font-semibold">Money</h2>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex justify-between"><span className="text-ink-muted">Estimated</span><span className="font-medium">{formatMoney(order.estimated_total)}</span></li>
                <li className="flex justify-between"><span className="text-ink-muted">Current</span><span className="font-medium">{formatMoney(order.current_total)}</span></li>
                <li className="flex justify-between border-t border-line pt-2"><span className="text-ink-muted">Paid</span><span className="font-medium">{formatMoney(order.invoice.payments.reduce((a, p) => a + p.amount, 0))}</span></li>
                {order.invoice.refunds.reduce((a, r) => a + r.amount, 0) > 0 && (
                  <li className="flex justify-between"><span className="text-ink-muted">Refunded</span><span className="font-medium">{formatMoney(order.invoice.refunds.reduce((a, r) => a + r.amount, 0))}</span></li>
                )}
                <li className="flex justify-between"><span className="text-ink-muted">Balance</span><span className="font-medium">{formatMoney(balanceDue)}</span></li>
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="font-display text-base font-semibold">Logistics</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {order.deliveries.map((d) => (
                  <li key={d.id} className="rounded-md border border-line p-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium capitalize">{d.leg_type.replace(/_/g, " ")}</div>
                      <Badge tone={d.status === "completed" ? "success" : d.status === "scheduled" ? "info" : "neutral"}>{d.status}</Badge>
                    </div>
                    <div className="text-xs text-ink-muted">{d.method?.replace(/_/g, " ")} · {d.provider}</div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminPage>
  );
}
