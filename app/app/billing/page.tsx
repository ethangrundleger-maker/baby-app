import Link from "next/link";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { MY_ORDERS } from "@/lib/mock/seed";
import { formatDate, formatMoney } from "@/lib/utils";
import { Download } from "lucide-react";

export default function BillingPage() {
  const invoices = MY_ORDERS.map((o) => ({ order: o, invoice: o.invoice }));
  return (
    <PageContainer>
      <PageHeader title="Billing" subtitle="Invoices, receipts, and refunds." action={<ButtonLink href="/app/billing/cards" variant="outline">Manage cards</ButtonLink>} />

      <div className="mt-6 space-y-3">
        {invoices.map(({ order, invoice }) => {
          const paid = invoice.payments.reduce((a, p) => a + p.amount, 0);
          const refunded = invoice.refunds.reduce((a, r) => a + r.amount, 0);
          return (
            <Card key={invoice.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={invoice.status} />
                    <span className="text-xs text-ink-muted">Invoice #{invoice.id.slice(-4)}</span>
                  </div>
                  <Link href={`/app/orders/${order.id}`} className="mt-1.5 block font-display text-base font-semibold hover:underline">
                    Order #{order.id.slice(-4)}
                  </Link>
                  <div className="text-xs text-ink-muted">{formatDate(invoice.issued_at)} · {order.garments.length} garment{order.garments.length === 1 ? "" : "s"}</div>
                  <div className="mt-2 text-xs text-ink-muted">
                    Paid {formatMoney(paid)}{refunded > 0 && <> · Refunded {formatMoney(refunded)}</>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-semibold">{formatMoney(invoice.total)}</div>
                  <button className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"><Download className="h-3.5 w-3.5" /> PDF</button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
