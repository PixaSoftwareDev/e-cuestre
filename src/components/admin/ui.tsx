import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  kicker,
  action,
}: {
  title: string;
  description?: string;
  kicker?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <p className="kicker mb-1 text-accent">{kicker}</p>}
        <h1 className="font-heading text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "hover-lift rounded-brand border border-border bg-card p-5 shadow-[var(--shadow-soft)]",
        accent && "border-accent/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="kicker text-muted">{label}</p>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <p className="mt-3 font-heading text-3xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-brand border border-border bg-card p-6 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {title && <h2 className="mb-4 font-heading text-lg">{title}</h2>}
      {children}
    </div>
  );
}
