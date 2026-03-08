import Link from "next/link";
import {
  GripVertical,
  GitBranch,
  Palette,
  BarChart3,
  Layers,
  Users,
  ArrowRight,
  FileText,
  Shield,
  Zap,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: GripVertical,
    title: "Glisser-Déposer",
    description:
      "Construisez vos formulaires intuitivement en glissant-déposant les champs. Réorganisez et personnalisez en toute simplicité.",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: GitBranch,
    title: "Logique conditionnelle",
    description:
      "Créez des formulaires dynamiques qui s'adaptent selon les réponses. Affichez ou masquez des champs avec des règles intelligentes.",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    icon: Palette,
    title: "Thèmes élégants",
    description:
      "Choisissez parmi des thèmes professionnels ou créez le vôtre. Chaque formulaire reflète votre identité visuelle.",
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  },
  {
    icon: BarChart3,
    title: "Analytiques en temps réel",
    description:
      "Suivez les soumissions, taux de complétion et tendances grâce à un tableau de bord analytique en direct.",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    icon: Layers,
    title: "Formulaires multi-pages",
    description:
      "Découpez les longs formulaires en pages claires avec des indicateurs de progression et des transitions fluides.",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    icon: Users,
    title: "Collaboration d'équipe",
    description:
      "Travaillez ensemble avec votre équipe. Partagez des espaces, attribuez des rôles et collaborez en temps réel.",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
];

const stats = [
  { label: "Formulaires créés", value: "10K+" },
  { label: "Réponses collectées", value: "500K+" },
  { label: "Équipes actives", value: "2K+" },
];

const benefits = [
  "18 types de champs différents",
  "Export CSV, Excel et PDF",
  "Intégration Supabase native",
  "Responsive sur tous les écrans",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border))]/60 bg-[hsl(var(--background))]/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo_atg.jpeg" alt="ATG" className="h-9 max-w-[140px] object-contain transition-transform duration-200 group-hover:scale-105" />
            <span className="text-xl font-bold">ATGForm</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild className="active-press">
              <Link href="/signup">Commencer gratuitement</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ============================================
          HERO SECTION — full-width shapes spread edge to edge
          ============================================ */}
      <section className="relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary))]/5 via-transparent to-transparent" />
          <div className="absolute inset-0 landing-grid-bg" />
        </div>

        {/* ---- FAR LEFT edge shapes ---- */}
        {/* Large morphing blob, pinned to far left */}
        <div className="landing-shape landing-shape-morph absolute -left-24 top-8 w-64 h-64 lg:w-96 lg:h-96 bg-[hsl(var(--primary))]/[0.04] -z-[1]" />

        {/* Dotted ring, far left mid */}
        <div className="landing-dotted-ring landing-shape-float-reverse hidden md:block absolute w-36 h-36 lg:w-52 lg:h-52 -left-8 lg:left-4 top-[55%] -z-[1]" />

        {/* Stacked horizontal lines, far left top */}
        <div className="hidden lg:block absolute left-6 top-[22%] -z-[1] opacity-40">
          <div className="space-y-2.5">
            <div className="w-20 h-[2px] bg-[hsl(var(--primary))]/25 rounded-full" />
            <div className="w-14 h-[2px] bg-[hsl(var(--primary))]/18 rounded-full ml-3" />
            <div className="w-24 h-[2px] bg-[hsl(var(--primary))]/12 rounded-full" />
            <div className="w-12 h-[2px] bg-[hsl(var(--primary))]/25 rounded-full ml-5" />
            <div className="w-18 h-[2px] bg-[hsl(var(--primary))]/15 rounded-full ml-1" />
          </div>
        </div>

        {/* Small diamond, far left bottom */}
        <div className="landing-shape landing-shape-float hidden md:block absolute left-8 lg:left-16 bottom-[12%] -z-[1]" style={{ animationDelay: "3s" }}>
          <div className="w-5 h-5 rounded-sm bg-pink-500/[0.1] rotate-45" />
        </div>

        {/* Triangle, far left */}
        <div className="landing-shape landing-shape-float-reverse hidden lg:block absolute left-12 top-[75%] -z-[1]" style={{ animationDelay: "1s" }}>
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[34px] border-b-purple-500/[0.06] rotate-[15deg]" />
        </div>

        {/* Plus/cross, left area */}
        <div className="landing-shape landing-shape-float hidden md:block absolute left-[4%] top-[38%] -z-[1] opacity-25" style={{ animationDelay: "5s" }}>
          <div className="relative w-7 h-7">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[hsl(var(--primary))] -translate-y-1/2 rounded-full" />
            <div className="absolute left-1/2 top-0 h-full w-[2px] bg-[hsl(var(--primary))] -translate-x-1/2 rounded-full" />
          </div>
        </div>

        {/* ---- FAR RIGHT edge shapes ---- */}
        {/* Large circle ring, pinned to far right */}
        <div className="landing-shape landing-shape-float hidden md:block absolute -right-6 lg:right-4 top-[10%] -z-[1]">
          <div className="w-28 h-28 lg:w-44 lg:h-44 rounded-full border-2 border-[hsl(var(--primary))]/[0.08]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 lg:w-16 lg:h-16 rounded-full bg-purple-500/[0.05]" />
        </div>

        {/* Stacked horizontal lines, far right */}
        <div className="hidden lg:block absolute right-6 top-[45%] -z-[1] opacity-35">
          <div className="space-y-2.5 flex flex-col items-end">
            <div className="w-18 h-[2px] bg-purple-500/20 rounded-full" />
            <div className="w-24 h-[2px] bg-purple-500/15 rounded-full" />
            <div className="w-14 h-[2px] bg-purple-500/20 rounded-full" />
            <div className="w-20 h-[2px] bg-purple-500/12 rounded-full" />
          </div>
        </div>

        {/* Orbiting dot, right area */}
        <div className="hidden lg:block absolute right-16 top-[60%] -z-[1]">
          <div className="landing-shape-orbit">
            <div className="w-3.5 h-3.5 rounded-full bg-[hsl(var(--primary))]/[0.15]" />
          </div>
        </div>

        {/* Small square, far right */}
        <div className="landing-shape landing-shape-float hidden md:block absolute right-8 lg:right-12 top-[75%] -z-[1]" style={{ animationDelay: "2s" }}>
          <div className="w-6 h-6 rounded-md bg-emerald-500/[0.08] rotate-12" />
        </div>

        {/* Plus/cross, far right */}
        <div className="landing-shape landing-shape-float-reverse hidden lg:block absolute right-[3%] top-[30%] -z-[1] opacity-20" style={{ animationDelay: "4s" }}>
          <div className="relative w-6 h-6">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-pink-500 -translate-y-1/2 rounded-full" />
            <div className="absolute left-1/2 top-0 h-full w-[2px] bg-pink-500 -translate-x-1/2 rounded-full" />
          </div>
        </div>

        {/* Circle dot, right bottom */}
        <div className="landing-shape landing-shape-float hidden md:block absolute right-[5%] bottom-[8%] -z-[1]" style={{ animationDelay: "6s" }}>
          <div className="w-4 h-4 rounded-full bg-orange-500/[0.1]" />
        </div>

        {/* Large glow on right */}
        <div className="landing-glow absolute w-[500px] h-[500px] bg-purple-500/[0.03] -right-60 top-[20%] -z-[1]" />
        {/* Large glow on left */}
        <div className="landing-glow absolute w-[400px] h-[400px] bg-[hsl(var(--primary))]/[0.04] -left-48 top-[40%] -z-[1]" />

        {/* ---- Hero content: two columns ---- */}
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <div>
              <div className="animate-fade-in-up">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                  <Zap className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                  Le constructeur de formulaires pour les équipes modernes
                </div>
              </div>
              <h1 className="animate-fade-in-up animate-stagger-1 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Créez des{" "}
                <span className="bg-gradient-to-r from-[hsl(var(--primary))] via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                  formulaires magnifiques
                </span>
                <br />
                <span className="text-[hsl(var(--muted-foreground))]">en quelques minutes</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-[hsl(var(--muted-foreground))] animate-fade-in-up animate-stagger-2 max-w-xl">
                Construisez des formulaires interactifs avec notre éditeur glisser-déposer.
                Collectez les réponses, analysez les données et collaborez avec votre équipe &mdash; le tout
                sur une seule plateforme.
              </p>

              {/* Benefits list */}
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 animate-fade-in-up animate-stagger-2">
                {benefits.map((benefit) => (
                  <span key={benefit} className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    {benefit}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-stagger-3">
                <Button size="lg" asChild className="text-base px-8 hover-lift active-press shadow-lg shadow-[hsl(var(--primary))]/20">
                  <Link href="/signup">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="text-base px-8 hover-lift">
                  <Link href="/login">Se connecter</Link>
                </Button>
              </div>
            </div>

            {/* Right: Form illustration */}
            <div className="animate-fade-in-up animate-stagger-4 hidden lg:block">
              <div className="relative">
                {/* Glow behind the card */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))]/10 via-purple-500/5 to-pink-500/5 blur-2xl -z-[1]" />

                <div className="relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 backdrop-blur-sm p-6 shadow-2xl shadow-[hsl(var(--primary))]/10 card-hover-glow">
                  {/* Form window header */}
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[hsl(var(--border))]">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400/50" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400/50" />
                      <div className="h-3 w-3 rounded-full bg-green-400/50" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="h-5 w-48 rounded-md bg-[hsl(var(--muted))]/60 flex items-center justify-center">
                        <div className="h-2 w-28 rounded-full bg-[hsl(var(--muted-foreground))]/15" />
                      </div>
                    </div>
                    <div className="w-12" />
                  </div>

                  {/* Form content */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-9 w-9 rounded-lg bg-[hsl(var(--primary))]/15 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3.5 w-36 rounded-full bg-[hsl(var(--foreground))]/12" />
                      <div className="h-2.5 w-24 rounded-full bg-[hsl(var(--muted-foreground))]/10 mt-2" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-5">
                    <div className="flex justify-between mb-1.5">
                      <div className="h-2 w-16 rounded-full bg-[hsl(var(--foreground))]/8" />
                      <div className="h-2 w-8 rounded-full bg-[hsl(var(--foreground))]/8" />
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[hsl(var(--muted))]">
                      <div className="h-1.5 w-[65%] rounded-full bg-[hsl(var(--primary))] transition-all" />
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="h-2 w-14 rounded-full bg-[hsl(var(--foreground))]/10" />
                        <div className="h-9 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 px-3 flex items-center">
                          <div className="h-2 w-20 rounded-full bg-[hsl(var(--muted-foreground))]/15" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 w-12 rounded-full bg-[hsl(var(--foreground))]/10" />
                        <div className="h-9 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 px-3 flex items-center">
                          <div className="h-2 w-16 rounded-full bg-[hsl(var(--muted-foreground))]/15" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-20 rounded-full bg-[hsl(var(--foreground))]/10" />
                      <div className="h-9 rounded-lg border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/[0.03] shadow-sm shadow-[hsl(var(--primary))]/10 px-3 flex items-center">
                        <div className="h-2 w-32 rounded-full bg-[hsl(var(--primary))]/20" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-24 rounded-full bg-[hsl(var(--foreground))]/10" />
                      <div className="h-20 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-3">
                        <div className="h-2 w-[90%] rounded-full bg-[hsl(var(--muted-foreground))]/10 mb-2" />
                        <div className="h-2 w-[70%] rounded-full bg-[hsl(var(--muted-foreground))]/10 mb-2" />
                        <div className="h-2 w-[40%] rounded-full bg-[hsl(var(--muted-foreground))]/10" />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {["Option A", "Option B", "Option C"].map((opt, i) => (
                        <div key={opt} className="flex items-center gap-1.5">
                          <div className={`h-4 w-4 rounded-full border-2 ${i === 0 ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/20" : "border-[hsl(var(--border))]"}`}>
                            {i === 0 && <div className="h-full w-full rounded-full border-2 border-[hsl(var(--card))] bg-[hsl(var(--primary))]" />}
                          </div>
                          <div className="h-2 w-14 rounded-full bg-[hsl(var(--foreground))]/10" />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <div className="h-9 w-20 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30" />
                      <div className="h-9 w-24 rounded-lg bg-[hsl(var(--primary))]" />
                    </div>
                  </div>

                  {/* Animated cursor */}
                  <div className="absolute bottom-16 right-20 animate-bounce-subtle" style={{ animationDelay: "1s" }}>
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="text-[hsl(var(--primary))] drop-shadow-md">
                      <path d="M3 2L17 10L10 12L7 19L3 2Z" fill="currentColor" opacity="0.7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center animate-fade-in-up animate-stagger-${i + 1}`}
              >
                <div className="text-3xl font-bold tracking-tight text-[hsl(var(--primary))] sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION — shapes pushed to edges
          ============================================ */}
      <section className="relative bg-[hsl(var(--muted))]/30 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 landing-crosshatch -z-[1]" />

        {/* Far left: large ring */}
        <div className="landing-shape landing-shape-float hidden lg:block absolute -left-16 top-[15%] -z-[1]">
          <div className="w-40 h-40 rounded-full border border-[hsl(var(--primary))]/[0.08]" />
        </div>

        {/* Far right: rotated square */}
        <div className="landing-shape landing-shape-float-reverse hidden lg:block absolute -right-8 bottom-[20%] -z-[1]" style={{ animationDelay: "2s" }}>
          <div className="w-28 h-28 rounded-2xl bg-purple-500/[0.03] rotate-12" />
        </div>

        {/* Far left bottom: plus */}
        <div className="landing-shape landing-shape-float hidden md:block absolute left-4 bottom-[10%] -z-[1] opacity-20" style={{ animationDelay: "3s" }}>
          <div className="relative w-8 h-8">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-emerald-500 -translate-y-1/2 rounded-full" />
            <div className="absolute left-1/2 top-0 h-full w-[2px] bg-emerald-500 -translate-x-1/2 rounded-full" />
          </div>
        </div>

        {/* Far right top: dotted ring */}
        <div className="landing-dotted-ring landing-shape-float hidden md:block absolute w-24 h-24 right-6 top-[8%] -z-[1]" style={{ animationDelay: "1s" }} />

        {/* Glows at edges */}
        <div className="landing-glow absolute w-[400px] h-[400px] bg-[hsl(var(--primary))]/[0.03] -right-52 top-[30%] -z-[1]" />
        <div className="landing-glow absolute w-[300px] h-[300px] bg-purple-500/[0.03] -left-40 bottom-[10%] -z-[1]" />

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tout ce dont vous avez besoin pour créer de superbes formulaires
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              Des fonctionnalités puissantes qui rendent la création de formulaires un jeu d&apos;enfant.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 card-hover-glow animate-scale-in animate-stagger-${Math.min(i + 1, 6)}`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.color} transition-transform duration-200 group-hover:scale-110`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HIGHLIGHTS — shapes at edges
          ============================================ */}
      <section className="relative border-t border-[hsl(var(--border))] overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-30 -z-[1]" />

        {/* Far right: dotted ring */}
        <div className="landing-dotted-ring landing-shape-float hidden lg:block absolute w-36 h-36 -right-4 top-[10%] -z-[1]" style={{ animationDelay: "1.5s" }} />

        {/* Far left: diamond */}
        <div className="landing-shape landing-shape-float hidden md:block absolute left-4 top-[30%] -z-[1] opacity-25" style={{ animationDelay: "3s" }}>
          <div className="w-10 h-10 bg-orange-500/10 rotate-45 rounded-sm" />
        </div>

        {/* Far right bottom: small circle */}
        <div className="landing-shape landing-shape-float-reverse hidden md:block absolute right-8 bottom-[15%] -z-[1] opacity-20" style={{ animationDelay: "2s" }}>
          <div className="w-5 h-5 rounded-full bg-[hsl(var(--primary))]/15" />
        </div>

        {/* Far left bottom: lines */}
        <div className="hidden lg:block absolute left-6 bottom-[20%] -z-[1] opacity-30">
          <div className="space-y-2">
            <div className="w-16 h-[2px] bg-orange-500/20 rounded-full" />
            <div className="w-12 h-[2px] bg-orange-500/15 rounded-full ml-2" />
            <div className="w-20 h-[2px] bg-orange-500/10 rounded-full" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            {[
              { icon: Zap, title: "Ultra rapide", desc: "Optimisé pour la performance. Vos formulaires se chargent instantanément et répondent à chaque interaction." },
              { icon: Shield, title: "Sécurisé par défaut", desc: "Sécurité niveau entreprise avec des politiques row-level et des données chiffrées au repos." },
              { icon: BarChart3, title: "Analytiques pertinentes", desc: "Comprenez votre audience grâce à des tableaux de bord en temps réel et des rapports exportables." },
            ].map((item, i) => (
              <div key={item.title} className={`flex flex-col items-center text-center animate-fade-in-up animate-stagger-${i + 1}`}>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/10">
                  <item.icon className="h-7 w-7 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] max-w-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION — shapes at edges
          ============================================ */}
      <section className="relative overflow-hidden border-t border-[hsl(var(--border))]">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[hsl(var(--primary))]/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute inset-0 -z-[1] landing-grid-bg opacity-50" />

        {/* Far left: morphing blob */}
        <div className="landing-shape landing-shape-morph absolute -left-32 top-1/2 -translate-y-1/2 w-72 h-72 bg-[hsl(var(--primary))]/[0.03] -z-[1]" />

        {/* Far right: morphing blob */}
        <div className="landing-shape landing-shape-morph absolute -right-32 top-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/[0.03] -z-[1]" style={{ animationDelay: "6s" }} />

        {/* Far left: circle outline */}
        <div className="landing-shape landing-shape-float hidden md:block absolute left-6 top-[20%] -z-[1] opacity-25">
          <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--primary))]" />
        </div>

        {/* Far right: rotated square */}
        <div className="landing-shape landing-shape-float-reverse hidden md:block absolute right-6 bottom-[20%] -z-[1] opacity-20" style={{ animationDelay: "2s" }}>
          <div className="w-6 h-6 rounded-md bg-pink-500/20 rotate-45" />
        </div>

        {/* Far left bottom: plus */}
        <div className="landing-shape landing-shape-float hidden lg:block absolute left-12 bottom-[15%] -z-[1] opacity-20" style={{ animationDelay: "4s" }}>
          <div className="relative w-6 h-6">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-purple-500 -translate-y-1/2 rounded-full" />
            <div className="absolute left-1/2 top-0 h-full w-[2px] bg-purple-500 -translate-x-1/2 rounded-full" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Prêt à créer votre premier formulaire ?
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              Commencez gratuitement. Aucune carte bancaire requise.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="text-base px-8 hover-lift active-press shadow-lg shadow-[hsl(var(--primary))]/20">
                <Link href="/signup">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo_atg.jpeg" alt="ATG" className="h-7 max-w-[120px] object-contain" />
              <span className="font-semibold">ATGForm</span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              &copy; {new Date().getFullYear()} ATGForm. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
