"use client";

import Link from "next/link";
import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { MY_ORDERS } from "@/lib/mock/seed";
import { formatMoney, relativeDays } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "all" | "active" | "completed" | "cancelled";

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>("all");

  const filtered = MY_ORDERS.filter((o) => {
    if (tab === "all") return true;
    if (tab === "completed") return o.status === "delivered";
    if (tab === "cancelled") return o.status === "cancelled";
    return o.status !== "delivered" && o.status !== "cancelled";
  });

  return (
    <PageContainer>
      <PageHeader title="Orders" />
      <div className="mt-6 flex gap-1 border-b border-line">
        {(["all", "active", "completed", "cancelled"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-t-md px-4 py-2 text-sm capitalize", tab === t ? "border-b-2 border-brand-500 font-medium text-ink" : "text-ink-muted hover:text-ink")}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {filtered.map((o) => {
          const balanceDue = o.invoice.total - o.invoice.payments.reduce((a, p) => a + p.amount, 0);
          return (
            <Link key={o.id} href={`/app/orders/${o.id}`}>
              <Card className="p-5 hover:border-line-strong transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={o.status} />
                      {o.quote_status === "pending_approval" && <Badge tone="warn">approval needed</Badge>}
                    </div>
                    <div className="mt-1.5 font-display text-base font-semibold">Order #{o.id.slice(-4)}</div>
                    <div className="text-xs text-ink-muted">created {relativeDays(o.created_at)} · {o.garments.length} garment{o.garments.length === 1 ? "" : "s"} · {o.garments.map((g) => g.type).join(", ")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-base font-semibold">{formatMoney(o.current_total)}</div>
                    {balanceDue > 0.01 && <div className="text-xs text-warn">{formatMoney(balanceDue)} balance</div>}
                    {o.current_total !== o.estimated_total && <div className="text-xs text-ink-muted">est. {formatMoney(o.estimated_total)}</div>}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && <Card className="px-5 py-12 text-center text-ink-muted">No orders to show.</Card>}
      </div>
    </PageContainer>
  );
}
