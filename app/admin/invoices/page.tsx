import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ALL_ORDERS } from "@/lib/mock/seed";
import { formatDate, formatMoney } from "@/lib/utils";
import Link from "next/link";

export default function InvoicesPage() {
  return (
    <AdminPage>
      <AdminPageHeader title="Invoices" subtitle="Every invoice, its payments, and any refunds." />
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-2.5 font-medium">Invoice</th>
              <th className="px-5 py-2.5 font-medium">Order</th>
              <th className="px-5 py-2.5 font-medium">Client</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium text-right">Total</th>
              <th className="px-5 py-2.5 font-medium text-right">Paid</th>
              <th className="px-5 py-2.5 font-medium text-right">Refunded</th>
              <th className="px-5 py-2.5 font-medium">Issued</th>
            </tr>
          </thead>
          <tbody>
            {ALL_ORDERS.map((o) => {
              const paid = o.invoice.payments.reduce((a, p) => a + p.amount, 0);
              const refunded = o.invoice.refunds.reduce((a, r) => a + r.amount, 0);
              return (
                <tr key={o.invoice.id} className="border-t border-line">
                  <td className="px-5 py-3 font-mono text-xs">#{o.invoice.id.slice(-4)}</td>
                  <td className="px-5 py-3 font-mono text-xs"><Link href={`/admin/orders/${o.id}`} className="hover:underline">#{o.id.slice(-4)}</Link></td>
                  <td className="px-5 py-3">{o.client_name}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.invoice.status} /></td>
                  <td className="px-5 py-3 text-right font-medium">{formatMoney(o.invoice.total)}</td>
                  <td className="px-5 py-3 text-right">{formatMoney(paid)}</td>
                  <td className="px-5 py-3 text-right">{refunded > 0 ? formatMoney(refunded) : "—"}</td>
                  <td className="px-5 py-3 text-xs text-ink-muted">{formatDate(o.invoice.issued_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </AdminPage>
  );
}
