import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  bg = "default",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  bg?: "default" | "alt" | "tint" | "ink";
  id?: string;
}) {
  const bgs = {
    default: "bg-bg",
    alt: "bg-bg-alt",
    tint: "bg-bg-tint",
    ink: "bg-ink text-bg",
  };
  return (
    <section id={id} className={cn("py-16 sm:py-24", bgs[bg], className)}>
      <div className="mx-auto w-full max-w-page px-5 sm:px-8">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("mb-12 max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <div className="mb-3 text-xs font-medium uppercase tracking-widest text-brand-600">{eyebrow}</div>}
      <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-ink-muted leading-relaxed">{subtitle}</p>}
    </div>
  );
}
