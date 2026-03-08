"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type StatVariant = "blue" | "green" | "violet" | "orange";

interface StatCardProps {
  label: string;
  value: number;
  description?: string;
  icon: ReactNode;
  variant?: StatVariant;
  trend?: number;
  className?: string;
}

const variantStyles: Record<StatVariant, { bg: string; iconBg: string; text: string; gradient: string }> = {
  blue: {
    bg: "from-blue-50 to-blue-50/30 dark:from-blue-950/30 dark:to-blue-950/10",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-blue-600",
  },
  green: {
    bg: "from-emerald-50 to-emerald-50/30 dark:from-emerald-950/30 dark:to-emerald-950/10",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500 to-emerald-600",
  },
  violet: {
    bg: "from-violet-50 to-violet-50/30 dark:from-violet-950/30 dark:to-violet-950/10",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    text: "text-violet-600 dark:text-violet-400",
    gradient: "from-violet-500 to-violet-600",
  },
  orange: {
    bg: "from-orange-50 to-orange-50/30 dark:from-orange-950/30 dark:to-orange-950/10",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    text: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500 to-orange-600",
  },
};

export function StatCard({
  label,
  value,
  description,
  icon,
  variant = "blue",
  trend,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border bg-gradient-to-br card-hover-glow",
        styles.bg,
        className
      )}
    >
      {/* Subtle gradient accent at top */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          styles.gradient
        )}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight animate-count-up-glow">
                {value.toLocaleString("fr-FR")}
              </span>
              {trend !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-1.5 py-0.5",
                    isPositive && "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40",
                    isNegative && "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40",
                    !isPositive && !isNegative && "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]"
                  )}
                >
                  {isPositive && <TrendingUp className="h-3 w-3" />}
                  {isNegative && <TrendingDown className="h-3 w-3" />}
                  {isPositive && "+"}{trend}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {description}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              styles.iconBg
            )}
          >
            <div className={styles.text}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
