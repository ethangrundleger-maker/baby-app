import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { ALL_ORDERS, CLIENTS } from "@/lib/mock/seed";
import { formatDate, formatMoney } from "@/lib/utils";
import Link from "next/link";

export default function ClientsPage() {
  return (
    <AdminPage>
      <AdminPageHeader title="Clients" subtitle="Every customer account, with lifetime value and order history." />
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-2.5 font-medium">Name</th>
              <th className="px-5 py-2.5 font-medium">Phone</th>
              <th className="px-5 py-2.5 font-medium">Email</th>
              <th className="px-5 py-2.5 font-medium">Hub</th>
              <th className="px-5 py-2.5 font-medium text-right">Orders</th>
              <th className="px-5 py-2.5 font-medium text-right">LTV</th>
              <th className="px-5 py-2.5 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {CLIENTS.map((c) => {
              const myOrders = ALL_ORDERS.filter((o) => o.client_id === c.id);
              const ltv = myOrders.reduce((a, o) => a + o.current_total, 0);
              return (
                <tr key={c.id} className="border-t border-line">
                  <td className="px-5 py-3"><Link href="#" className="font-medium hover:underline">{c.name}</Link></td>
                  <td className="px-5 py-3 font-mono text-xs">{c.phone}</td>
                  <td className="px-5 py-3 text-ink-muted">{c.email}</td>
                  <td className="px-5 py-3 text-xs uppercase tracking-wider text-ink-muted">{c.hub_id.replace("hub_", "")}</td>
                  <td className="px-5 py-3 text-right">{myOrders.length}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatMoney(ltv)}</td>
                  <td className="px-5 py-3 text-xs text-ink-muted">{formatDate(c.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </AdminPage>
  );
}
