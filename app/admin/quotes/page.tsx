import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ALL_ORDERS } from "@/lib/mock/seed";
import { formatDate, formatMoney } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";

export default function QuotesPage() {
  const ordersToQuote = ALL_ORDERS.filter((o) => o.quote_status === "pending_approval" || o.quote_status === "quoted");
  return (
    <AdminPage>
      <AdminPageHeader title="Quotes" subtitle="Orders pending pricing or client approval." />
      <div className="space-y-3">
        {ordersToQuote.map((o) => (
          <Card key={o.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="warn">{o.quote_status?.replace(/_/g, " ")}</Badge>
                  <span className="font-mono text-xs text-ink-muted">#{o.id.slice(-4)}</span>
                </div>
                <div className="mt-1 font-display text-base font-semibold">{o.client_name}</div>
                <div className="text-xs text-ink-muted">{o.garments.length} garments · est. {formatMoney(o.estimated_total)} · current {formatMoney(o.current_total)} · {formatDate(o.created_at)}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit pricing</Button>
                <ButtonLink href={`/admin/orders/${o.id}`} variant="primary" size="sm">Open</ButtonLink>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
