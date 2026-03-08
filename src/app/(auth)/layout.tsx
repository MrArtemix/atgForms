import Link from "next/link";
import {
  FileText,
  Layers,
  BarChart3,
  Users,
  Zap,
  Shield,
  MousePointerClick,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding (hidden on mobile, visible on md+) */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col items-center justify-center p-8 lg:p-12 overflow-hidden">

        {/* === Decorative background layers === */}

        {/* Radial glows */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-indigo-400/15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-blue-300/10 blur-[80px]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large ring — top left */}
          <div className="landing-shape landing-shape-float absolute -top-8 -left-8 w-40 h-40 rounded-full border-2 border-white/[0.07]" />
          {/* Morphing blob — bottom right */}
          <div className="landing-shape landing-shape-morph absolute -bottom-12 -right-12 w-56 h-56 bg-white/[0.04]" />
          {/* Dotted ring — center right */}
          <div className="absolute top-1/3 -right-6 w-28 h-28 rounded-full border-2 border-dashed border-white/[0.08] landing-shape landing-shape-float-reverse" />
          {/* Small filled circle — top right */}
          <div className="landing-shape landing-shape-float absolute top-16 right-16 w-5 h-5 rounded-full bg-white/10" />
          {/* Plus sign — bottom left */}
          <div className="landing-shape landing-shape-float-reverse absolute bottom-28 left-12">
            <div className="w-6 h-[2px] bg-white/10 rounded-full" />
            <div className="w-[2px] h-6 bg-white/10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          {/* Diamond — middle left */}
          <div className="landing-shape landing-shape-float absolute top-1/2 left-6 w-4 h-4 rotate-45 border border-white/10" />
          {/* Orbiting dot */}
          <div className="landing-shape landing-shape-orbit absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-blue-300/20" />
          {/* Diagonal lines — top right corner */}
          <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.04]" style={{
            backgroundImage: "repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 12px)",
          }} />
          {/* Dots cluster — bottom left */}
          <div className="absolute bottom-12 left-1/4 grid grid-cols-3 gap-3 opacity-[0.08]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
            ))}
          </div>
        </div>

        {/* === Main content === */}
        <div className="relative z-10 flex flex-col items-center text-white max-w-md w-full">

          {/* Logo */}
          <div className="mb-8 lg:mb-10 flex items-center gap-3 animate-fade-in">
            <img src="/logo_atg.jpeg" alt="ATG" className="h-12 lg:h-14 max-w-[180px] object-contain drop-shadow-lg" />
            <span className="text-2xl lg:text-3xl font-bold tracking-tight">ATGForm</span>
          </div>

          {/* CSS form illustration */}
          <div className="w-full max-w-xs mb-8 lg:mb-10 animate-fade-in-up animate-stagger-1">
            <div className="rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] p-4 shadow-2xl shadow-black/20">
              {/* Window header */}
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                <div className="ml-auto text-[10px] text-white/30 font-mono">form.atg</div>
              </div>
              {/* Progress bar */}
              <div className="h-1 rounded-full bg-white/10 mb-4 overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-300 to-blue-200" style={{ animation: "progress-fill 2s ease-out both" }} />
              </div>
              {/* Fake form fields */}
              <div className="space-y-3">
                <div>
                  <div className="h-1.5 w-14 rounded bg-white/20 mb-1.5" />
                  <div className="h-7 rounded-md bg-white/[0.07] border border-white/10 flex items-center px-2.5">
                    <div className="h-1.5 w-24 rounded bg-white/15" />
                  </div>
                </div>
                <div>
                  <div className="h-1.5 w-10 rounded bg-white/20 mb-1.5" />
                  <div className="h-7 rounded-md bg-white/[0.07] border border-white/10 flex items-center px-2.5">
                    <div className="h-1.5 w-32 rounded bg-white/15" />
                  </div>
                </div>
                {/* Radio options */}
                <div>
                  <div className="h-1.5 w-20 rounded bg-white/20 mb-2" />
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full border border-blue-300/60 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                      </div>
                      <div className="h-1.5 w-10 rounded bg-white/15" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full border border-white/20" />
                      <div className="h-1.5 w-8 rounded bg-white/15" />
                    </div>
                  </div>
                </div>
                {/* Submit button */}
                <div className="h-7 rounded-md bg-gradient-to-r from-blue-400/40 to-blue-300/40 border border-blue-300/20 flex items-center justify-center">
                  <div className="h-1.5 w-14 rounded bg-white/30" />
                </div>
              </div>
              {/* Animated cursor */}
              <div className="relative mt-2">
                <MousePointerClick className="h-4 w-4 text-white/30 ml-auto animate-bounce-subtle" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-lg lg:text-xl font-semibold mb-3 text-center animate-fade-in-up animate-stagger-2 leading-snug">
            Créez des formulaires que vos utilisateurs adorent remplir
          </h2>
          <p className="text-white/60 text-center text-sm leading-relaxed mb-8 animate-fade-in-up animate-stagger-3">
            Drag-and-drop, logique conditionnelle, analytics temps réel — tout en un.
          </p>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-2.5 w-full animate-fade-in-up animate-stagger-4">
            {[
              { icon: Layers, label: "18+ types de champs" },
              { icon: Zap, label: "Logique conditionnelle" },
              { icon: BarChart3, label: "Analytics en direct" },
              { icon: Users, label: "Collaboration" },
              { icon: Shield, label: "Données sécurisées" },
              { icon: MousePointerClick, label: "Drag & Drop" },
            ].map((feat) => (
              <div
                key={feat.label}
                className="flex items-center gap-2.5 rounded-lg bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] px-3 py-2.5 transition-colors hover:bg-white/[0.12]"
              >
                <feat.icon className="h-4 w-4 text-blue-200/80 shrink-0" />
                <span className="text-xs text-white/80 leading-tight">{feat.label}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-8 flex items-center justify-center gap-6 text-center animate-fade-in-up animate-stagger-5">
            {[
              { value: "500+", label: "Formulaires créés" },
              { value: "10k+", label: "Réponses collectées" },
              { value: "99.9%", label: "Disponibilité" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-lg font-bold text-white/90">{s.value}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[hsl(var(--background))] px-4 py-8">
        <div className="w-full max-w-md">
          {/* Mobile logo - shown when left panel is hidden */}
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2 md:hidden animate-fade-in"
          >
            <img src="/logo_atg.jpeg" alt="ATG" className="h-10 max-w-[140px] object-contain" />
            <span className="text-2xl font-bold">ATGForm</span>
          </Link>

          {/* Desktop back link */}
          <Link
            href="/"
            className="mb-6 hidden md:inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            &larr; Retour à l&apos;accueil
          </Link>

          <div className="animate-scale-in">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
