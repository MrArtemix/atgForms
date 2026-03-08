import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Inbox,
  Signal,
  Building2,
  ChevronRight,
  LayoutGrid,
  TrendingUp,
  History,
  PackageOpen,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { PageShell } from "@/components/layout/page-shell";
import { StatCard } from "@/components/common/stat-card";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

const statusColors: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  closed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  archived: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  published: "Actif",
  closed: "Fermé",
  archived: "Archivé",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName =
    user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";
  const firstName = fullName.split(" ")[0];

  const [formsResult, responsesResult, recentResponsesResult] = await Promise.all([
    supabase
      .from("forms")
      .select("id, title, status, response_count, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("form_responses")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("form_responses")
      .select("id, form_id, created_at, respondent_name, respondent_email, is_complete, forms!inner(title)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const forms = formsResult.data || [];
  const totalResponses = responsesResult.count || 0;
  const activeForms = forms.filter((f) => f.status === "published").length;
  const recentForms = forms.slice(0, 5);
  const recentActivity = recentResponsesResult.data || [];

  const greeting = getGreeting();

  return (
    <PageShell>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 p-6 md:p-8 text-white animate-fade-in">
        {/* Decorative CSS shapes */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 animate-breathe" />
        <div className="absolute -right-4 bottom-0 h-20 w-20 rounded-full bg-white/5" />
        <div className="absolute right-20 top-4 h-12 w-12 rounded-full bg-white/[0.08]" />

        <div className="relative z-10">
          <p className="text-sm font-medium text-white/80 mb-1">{greeting}</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            {firstName} !
          </h1>
          <p className="text-sm text-white/70 max-w-md">
            Voici un aperçu de vos formulaires et de l&apos;activité récente.
          </p>
          <div className="mt-4">
            <Button asChild variant="secondary" className="active-press hover-lift bg-white text-[hsl(var(--primary))] hover:bg-white/90">
              <Link href="/filiales">
                <Building2 className="mr-2 h-4 w-4" />
                Explorer les filiales
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="animate-fade-in-up animate-stagger-1">
          <StatCard
            label="Formulaires"
            value={forms.length}
            description="Total créés"
            icon={<ClipboardList className="h-5 w-5" />}
            variant="blue"
            trend={12}
          />
        </div>
        <div className="animate-fade-in-up animate-stagger-2">
          <StatCard
            label="Réponses"
            value={totalResponses}
            description="Total reçues"
            icon={<Inbox className="h-5 w-5" />}
            variant="green"
            trend={8}
          />
        </div>
        <div className="animate-fade-in-up animate-stagger-3">
          <StatCard
            label="Actifs"
            value={activeForms}
            description="En ligne maintenant"
            icon={<Signal className="h-5 w-5" />}
            variant="violet"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/filiales" className="animate-fade-in-up animate-stagger-1">
          <Card className="cursor-pointer card-hover-glow group h-full">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">Mes filiales</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Gérer projets et formulaires</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/templates" className="animate-fade-in-up animate-stagger-2">
          <Card className="cursor-pointer card-hover-glow group h-full">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">Utiliser un template</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Formulaires prédéfinis</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard" className="animate-fade-in-up animate-stagger-3">
          <Card className="cursor-pointer card-hover-glow group h-full">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">Voir les analytiques</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Statistiques détaillées</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Forms - 3 cols */}
        <Card className="lg:col-span-3 animate-fade-in-up animate-stagger-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Formulaires récents</CardTitle>
              <CardDescription>Vos derniers formulaires modifiés</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/filiales">
                Voir tout
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentForms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/10 animate-breathe">
                  <ClipboardList className="h-8 w-8 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="text-lg font-semibold">Aucun formulaire</h3>
                <p className="mb-4 mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  Créez votre premier formulaire pour commencer.
                </p>
                <Button asChild className="active-press">
                  <Link href="/filiales">
                    <Building2 className="mr-2 h-4 w-4" />
                    Explorer les filiales
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentForms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] p-3 transition-all duration-200 hover:bg-[hsl(var(--muted))]/50 hover:border-[hsl(var(--primary))]/20 group"
                  >
                    <Link
                      href={`/forms/${form.id}/edit`}
                      className="flex flex-1 items-center gap-3 min-w-0"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 shrink-0">
                        <ClipboardList className="h-4 w-4 text-[hsl(var(--primary))]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium truncate">{form.title || "Sans titre"}</h4>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {form.response_count} réponse{form.response_count !== 1 ? "s" : ""} · {formatRelative(form.updated_at)}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", statusColors[form.status])}
                      >
                        {statusLabels[form.status] || form.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 md:opacity-0 md:group-hover:opacity-100 transition-opacity" asChild>
                        <Link href={`/forms/${form.id}/edit`}>
                          <PenLine className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed - 2 cols */}
        <Card className="lg:col-span-2 animate-fade-in-up animate-stagger-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              Activité récente
            </CardTitle>
            <CardDescription>Dernières soumissions reçues</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
                  <PackageOpen className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Aucune activité récente
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[hsl(var(--border))]" />

                <div className="space-y-4">
                  {recentActivity.map((activity: Record<string, unknown>) => (
                    <div key={activity.id as string} className="relative flex gap-3 pl-1">
                      {/* Timeline dot */}
                      <div className={cn(
                        "relative z-10 mt-1.5 h-[10px] w-[10px] rounded-full border-2 shrink-0",
                        activity.is_complete
                          ? "bg-emerald-500 border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-500 border-amber-200 dark:border-amber-800"
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {(activity.forms as Record<string, unknown>)?.title as string || "Formulaire"}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {(activity.respondent_name as string) || (activity.respondent_email as string) || "Anonyme"} · {formatRelative(activity.created_at as string)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0 self-start mt-0.5">
                        {activity.is_complete ? "Complète" : "Partielle"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
