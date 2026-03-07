import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-6 w-6 animate-spin text-muted-foreground", className)} />;
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner className="h-8 w-8" />
    </div>
  );
}
