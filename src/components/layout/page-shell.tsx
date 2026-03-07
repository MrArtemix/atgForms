import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  eyebrow?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  primaryAction,
  secondaryAction,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[hsl(var(--border))] pb-6 mb-6",
        className
      )}
    >
      <div className="space-y-2">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </div>
  );
}

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-8",
        className
      )}
    >
      {children}
    </section>
  );
}

