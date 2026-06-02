import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "success" | "warn" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-bg-alt text-ink-soft border-line",
  brand: "bg-brand-100 text-brand-800 border-brand-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  danger: "bg-red-50 text-red-800 border-red-200",
  info: "bg-sky-50 text-sky-800 border-sky-200",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

const statusMap: Record<string, Tone> = {
  // orders
  awaiting_pickup: "warn",
  scheduled: "info",
  in_progress: "info",
  ready_for_return: "brand",
  delivered: "success",
  cancelled: "danger",
  // garments
  pinned: "info",
  in_alteration: "info",
  in_transit_to_tailor: "neutral",
  in_transit_to_customer: "neutral",
  completed: "success",
  declined_by_tailor: "danger",
  reassigning: "warn",
  returned_unaltered: "warn",
  on_hold: "warn",
  // invoices
  draft: "neutral",
  open: "info",
  partial: "warn",
  paid: "success",
  overdue: "danger",
  void: "neutral",
  // appointments
  confirmed: "success",
  requested: "warn",
  en_route: "info",
  no_show: "danger",
  canceled: "danger",
  rescheduled: "warn",
  // leads
  new: "info",
  waitlisted: "warn",
  contacted: "info",
  converted: "success",
  lost: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusMap[status] ?? "neutral"}>{status.replace(/_/g, " ")}</Badge>;
}
