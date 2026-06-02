import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md border border-line-strong bg-bg-card px-3.5 py-2.5 text-sm placeholder:text-ink-subtle focus:border-brand-400 focus:ring-2 focus:ring-brand-200 focus:outline-none",
          className,
        )}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-md border border-line-strong bg-bg-card px-3.5 py-2.5 text-sm placeholder:text-ink-subtle focus:border-brand-400 focus:ring-2 focus:ring-brand-200 focus:outline-none",
          className,
        )}
        {...props}
      />
    );
  },
);

export function Label({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-muted", className)}>
      {children}
    </label>
  );
}

export function Field({ label, hint, error, children }: { label?: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-md border border-line-strong bg-bg-card px-3.5 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-200 focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
