export function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="animate-pulse-soft">
        <img src="/logo_atg.jpeg" alt="ATG" className="h-14 max-w-[180px] object-contain" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="h-1 w-32 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
          <div className="h-full w-full animate-shimmer rounded-full bg-[hsl(var(--primary))]/30" />
        </div>
      </div>
    </div>
  );
}
