import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center animate-fade-in-up", className)}>
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] animate-float">
        {icon}
      </div>
      <h3 className="text-xl font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-md leading-relaxed">{description}</p>
      {action && <div className="animate-fade-in animate-stagger-2">{action}</div>}
    </div>
  );
}
