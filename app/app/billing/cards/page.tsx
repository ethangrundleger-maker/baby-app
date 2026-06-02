import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHODS } from "@/lib/mock/seed";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2 } from "lucide-react";

export default function CardsPage() {
  return (
    <PageContainer className="max-w-2xl">
      <PageHeader title="Payment methods" subtitle="Saved cards. Stored as tokens — we never see your card number." action={<Button variant="brand"><Plus className="h-4 w-4" /> Add card</Button>} />
      <div className="mt-6 space-y-3">
        {PAYMENT_METHODS.map((pm) => (
          <Card key={pm.id} className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-14 items-center justify-center rounded-md bg-bg-alt"><CreditCard className="h-5 w-5 text-ink-muted" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{pm.brand} •{pm.last4}</span>
                  {pm.is_default && <Badge tone="brand">default</Badge>}
                </div>
                <div className="text-xs text-ink-muted">Exp 09/27</div>
              </div>
              <div className="flex gap-1">
                {!pm.is_default && <Button variant="ghost" size="sm">Make default</Button>}
                <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
