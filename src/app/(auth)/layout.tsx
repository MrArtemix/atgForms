import Link from "next/link";
import { FileText, Layers, BarChart3, Users } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding (hidden on mobile, visible on md+) */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex-col items-center justify-center p-8 lg:p-12 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 lg:top-20 lg:left-20 h-48 lg:h-72 w-48 lg:w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 lg:bottom-20 lg:right-20 h-64 lg:h-96 w-64 lg:w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        
        {/* Decorative circles pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border border-white/10" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full border border-white/5" />
          <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full border border-white/5" />
        </div>

        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="mb-6 lg:mb-8 flex items-center justify-center gap-3 animate-fade-in">
            <div className="flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
            </div>
            <span className="text-2xl lg:text-3xl font-bold">ATGForm</span>
          </div>
          
          <h2 className="text-xl lg:text-2xl font-semibold mb-4 animate-fade-in-up animate-stagger-1">
            Créez des formulaires que vos utilisateurs adorent remplir
          </h2>
          <p className="text-white/70 leading-relaxed animate-fade-in-up animate-stagger-2 text-sm lg:text-base">
            Constructeur drag-and-drop, logique conditionnelle, analytics en temps réel et collaboration d'équipe — tout dans une plateforme puissante.
          </p>
          
          <div className="mt-8 lg:mt-12 grid grid-cols-3 gap-3 lg:gap-4 animate-fade-in-up animate-stagger-3">
            {[
              { value: "18+", label: "Types de champs", icon: Layers },
              { value: "Temps réel", label: "Analytics", icon: BarChart3 },
              { value: "Équipes", label: "Collaboration", icon: Users },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 backdrop-blur-sm p-3 lg:p-4">
                <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-2 opacity-80" />
                <div className="text-sm lg:text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">ATGForm</span>
          </Link>

          {/* Desktop back link */}
          <Link
            href="/"
            className="mb-6 hidden md:inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            &larr; Retour à l'accueil
          </Link>

          <div className="animate-scale-in">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
