import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import Link from "next/link";

type Variant = "primary" | "brand" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-bg hover:bg-ink-soft",
  brand: "bg-brand-500 text-white hover:bg-brand-600",
  ghost: "text-ink hover:bg-bg-alt",
  outline: "border border-line-strong bg-bg-card text-ink hover:bg-bg-alt",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

const base = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

export const Button = forwardRef<HTMLButtonElement, BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function Button({ variant = "primary", size = "md", className, children, ...props }, ref) {
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    );
  }
);

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...props
}: BaseProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
