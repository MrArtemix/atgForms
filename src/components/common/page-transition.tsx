import { cn } from "@/lib/utils/cn";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn("animate-fade-in-up", className)}>
      {children}
    </div>
  );
}
