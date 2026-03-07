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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: GripVertical,
    title: "Drag & Drop Builder",
    description:
      "Intuitively build forms by dragging and dropping fields. Reorder, nest, and customize with ease.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: GitBranch,
    title: "Conditional Logic",
    description:
      "Create dynamic forms that adapt based on user responses. Show or hide fields with smart rules.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Palette,
    title: "Beautiful Themes",
    description:
      "Choose from professionally designed themes or create your own. Make every form on-brand.",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track submissions, completion rates, and response patterns with a live analytics dashboard.",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: Layers,
    title: "Multi-page Forms",
    description:
      "Break long forms into manageable pages with progress indicators and smooth transitions.",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Work together with your team. Share workspaces, assign roles, and collaborate in real time.",
    color: "bg-cyan-500/10 text-cyan-600",
  },
];

const stats = [
  { label: "Forms Created", value: "10K+" },
  { label: "Responses Collected", value: "500K+" },
  { label: "Active Teams", value: "2K+" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Navigation - sticky with backdrop blur */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border))]/60 bg-[hsl(var(--background))]/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] transition-transform duration-200 group-hover:scale-105">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">ATGForm</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="active-press">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary))]/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[hsl(var(--primary))]/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                <Zap className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                Powerful form builder for modern teams
              </div>
            </div>
            <h1 className="animate-fade-in-up animate-stagger-1 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Build{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--primary))] via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                Beautiful Forms
              </span>
              <br />
              <span className="text-[hsl(var(--muted-foreground))]">in minutes</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-[hsl(var(--muted-foreground))] animate-fade-in-up animate-stagger-2 max-w-2xl mx-auto">
              Create stunning, interactive forms with our drag-and-drop builder.
              Collect responses, analyze data, and collaborate with your team &mdash; all
              in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animate-stagger-3">
              <Button size="lg" asChild className="w-full sm:w-auto text-base px-8 hover-lift active-press shadow-lg shadow-[hsl(var(--primary))]/20">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto text-base px-8 hover-lift">
                <Link href="/login">Sign In</Link>
              </Button>
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

      {/* Features Section */}
      <section className="bg-[hsl(var(--muted))]/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to create great forms
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              Powerful features that make form building a breeze.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 hover-lift animate-scale-in animate-stagger-${i + 1} transition-colors duration-200 hover:border-[hsl(var(--primary))]/30`}
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

      {/* Highlights */}
      <section className="border-t border-[hsl(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed. Your forms load instantly and respond to every interaction." },
              { icon: Shield, title: "Secure by Default", desc: "Enterprise-grade security with row-level policies and encrypted data at rest." },
              { icon: BarChart3, title: "Insightful Analytics", desc: "Understand your audience with real-time dashboards and exportable reports." },
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

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-[hsl(var(--border))]">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[hsl(var(--primary))]/5 via-purple-500/5 to-pink-500/5" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to build your first form?
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              Get started for free. No credit card required.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="text-base px-8 hover-lift active-press shadow-lg shadow-[hsl(var(--primary))]/20">
                <Link href="/signup">
                  Start Building
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
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--primary))]">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">ATGForm</span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              &copy; {new Date().getFullYear()} ATGForm. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
