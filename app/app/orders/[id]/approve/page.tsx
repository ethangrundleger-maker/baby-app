import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMyOrder } from "@/lib/mock/seed";
import { formatMoney } from "@/lib/utils";

export default async function ApprovePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getMyOrder(id);
  if (!order) notFound();

  return (
    <PageContainer className="max-w-2xl">
      <Link href={`/app/orders/${order.id}`} className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Order #{order.id.slice(-4)}</Link>

      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Approve your quote</h1>
      <p className="mt-1 text-sm text-ink-muted">Here's exactly what your tailor will do. Approve to start work, or decline and we'll return the garment unaltered.</p>

      <Card className="mt-6">
        <CardBody>
          {order.garments.map((g) => (
            <div key={g.id} className="mb-5 last:mb-0">
              <div className="mb-2 font-display text-base font-semibold">{g.type}</div>
              <ul className="space-y-2 text-sm">
                {g.adjustments.map((a) => (
                  <li key={a.id} className="flex justify-between border-t border-line pt-2 first:border-t-0 first:pt-0">
                    <span>{a.service_name}{a.qty > 1 ? ` × ${a.qty}` : ""}</span>
                    <span className="font-medium">{formatMoney(a.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatMoney(order.current_total)}</span>
          </div>
          <div className="mt-1 text-xs text-ink-muted text-right">vs. initial estimate {formatMoney(order.estimated_total)}</div>
        </CardBody>
      </Card>

      <div className="mt-6 flex gap-3">
        <Button variant="brand" size="lg" className="flex-1">Approve & charge difference</Button>
        <Button variant="outline" size="lg">Decline</Button>
      </div>
      <p className="mt-3 text-xs text-ink-subtle">Approving charges the balance to your default card. Declining returns the garment unaltered (no charge for the alteration; logistics fee may apply).</p>
    </PageContainer>
  );
}
