import Link from "next/link";
import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { ALL_ORDERS } from "@/lib/mock/seed";
import { formatMoney, relativeDays } from "@/lib/utils";
import type { GarmentStatus } from "@/lib/types";

const COLS: { status: GarmentStatus; title: string }[] = [
  { status: "pinned", title: "Pinned" },
  { status: "in_transit_to_tailor", title: "To tailor" },
  { status: "in_alteration", title: "In alteration" },
  { status: "completed", title: "Done · awaiting return" },
  { status: "in_transit_to_customer", title: "Out for return" },
];

export default function AdminOrdersBoard() {
  // Flatten all garments across all open orders
  const garments = ALL_ORDERS.flatMap((o) =>
    o.garments
      .filter((g) => COLS.some((c) => c.status === g.status))
      .map((g) => ({ g, o })),
  );

  return (
    <AdminPage>
      <AdminPageHeader title="Orders board" subtitle="Every garment, capability-routed to the right tailor." />
      <div className="grid gap-3 lg:grid-cols-5">
        {COLS.map((c) => {
          const items = garments.filter(({ g }) => g.status === c.status);
          return (
            <div key={c.status} className="rounded-lg bg-bg-alt p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink">{c.title}</span>
                <span className="text-xs text-ink-muted">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(({ g, o }) => (
                  <Link key={g.id} href={`/admin/orders/${o.id}`}>
                    <Card className="p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] text-ink-muted">#{o.id.slice(-4)}</div>
                          <div className="truncate font-medium">{g.type}</div>
                          <div className="truncate text-xs text-ink-muted">{o.client_name}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                        <span className="truncate">{g.tailor_name ?? "Unassigned"}</span>
                        <span>{g.estimated_minutes}m</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {g.adjustments.slice(0, 3).map((a) => (
                          <span key={a.id} className="rounded-full bg-bg-alt px-2 py-0.5 text-[10px] text-ink-soft border border-line">{a.service_name.length > 14 ? a.service_name.slice(0, 14) + "…" : a.service_name}</span>
                        ))}
                        {g.adjustments.length > 3 && <span className="text-[10px] text-ink-muted">+{g.adjustments.length - 3}</span>}
                      </div>
                    </Card>
                  </Link>
                ))}
                {items.length === 0 && <div className="rounded-md border border-dashed border-line p-3 text-center text-xs text-ink-muted">Nothing here</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-display text-lg font-semibold">All orders</h2>
        <Card>
          <table className="w-full text-sm">
            <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Order</th>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Garments</th>
                <th className="px-4 py-2.5 font-medium text-right">Total</th>
                <th className="px-4 py-2.5 font-medium text-right">Created</th>
              </tr>
            </thead>
            <tbody>
              {ALL_ORDERS.map((o) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono text-xs hover:underline">#{o.id.slice(-4)}</Link></td>
                  <td className="px-4 py-3">{o.client_name}</td>
                  <td className="px-4 py-3 capitalize text-ink-muted">{o.type.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} />{o.quote_status === "pending_approval" && <Badge tone="warn" className="ml-1">approval</Badge>}</td>
                  <td className="px-4 py-3 text-ink-muted">{o.garments.length}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatMoney(o.current_total)}</td>
                  <td className="px-4 py-3 text-right text-xs text-ink-muted">{relativeDays(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminPage>
  );
}
