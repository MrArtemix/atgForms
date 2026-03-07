import { FileText } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="animate-pulse-soft">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/10">
          <FileText className="h-8 w-8 text-[hsl(var(--primary))]" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-lg font-semibold text-[hsl(var(--foreground))]">ATGForm</span>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
          <div className="h-full w-full animate-shimmer rounded-full bg-[hsl(var(--primary))]/30" />
        </div>
      </div>
    </div>
  );
}
