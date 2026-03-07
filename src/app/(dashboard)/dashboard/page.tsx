import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layout,
  BarChart3,
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
import { PageHeader, PageShell } from "@/components/layout/page-shell";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: number;
}

function StatCard({ title, value, description, icon, iconBg, trend }: StatCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <Card className="border-l-4 border-l-[hsl(var(--primary))]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          {title}
        </CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconBg)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</div>
            {trend !== undefined && (
            <div className={cn(
              "flex items-center text-xs font-medium",
              isPositive && "text-green-600 dark:text-green-400",
              isNegative && "text-red-600 dark:text-red-400",
              !isPositive && !isNegative && "text-[hsl(var(--muted-foreground))]"
            )}>
              {isPositive && <TrendingUp className="h-3 w-3 mr-1" />}
              {isNegative && <TrendingDown className="h-3 w-3 mr-1" />}
              {isPositive && "+"}{trend}%
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

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

  const [formsResult, responsesResult] = await Promise.all([
    supabase
      .from("forms")
      .select("id, title, status, response_count, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("form_responses")
      .select("id", { count: "exact", head: true }),
  ]);

  const forms = formsResult.data || [];
  const totalResponses = responsesResult.count || 0;
  const activeForms = forms.filter((f) => f.status === "published").length;
  const recentForms = forms.slice(0, 5);

  const greeting = getGreeting();

  return (
    <PageShell>
      <PageHeader
        eyebrow={greeting}
        title={`${firstName} ! 👋`}
        description="Voici ce qui se passe avec vos formulaires aujourd'hui."
        primaryAction={
          <Button asChild>
            <Link href="/forms">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau formulaire
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Formulaires"
          value={forms.length}
          description="Total créés"
          icon={<FileText className="h-4 w-4 text-[hsl(var(--primary))]" />}
          iconBg="bg-[hsl(var(--primary))]/10"
          trend={12}
        />
        <StatCard
          title="Réponses"
          value={totalResponses}
          description="Reçues aujourd'hui"
          icon={<MessageSquare className="h-4 w-4 text-[hsl(var(--primary))]" />}
          iconBg="bg-[hsl(var(--primary))]/10"
          trend={8}
        />
        <StatCard
          title="Actifs"
          value={activeForms}
          description="En ligne maintenant"
          icon={<Activity className="h-4 w-4 text-[hsl(var(--primary))]" />}
          iconBg="bg-[hsl(var(--primary))]/10"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/forms">
          <Card className="cursor-pointer transition-colors hover:border-[hsl(var(--primary))]/40 hover:bg-[hsl(var(--muted))]/30 group">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                <Plus className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium">Nouveau formulaire</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Créer depuis zéro</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] group-hover:translate-x-0.5 transition-transform" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/templates">
          <Card className="cursor-pointer transition-colors hover:border-[hsl(var(--primary))]/40 hover:bg-[hsl(var(--muted))]/30 group">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                <Layout className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium">Utiliser un template</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Formulaires prédéfinis</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] group-hover:translate-x-0.5 transition-transform" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard">
          <Card className="cursor-pointer transition-colors hover:border-[hsl(var(--primary))]/40 hover:bg-[hsl(var(--muted))]/30 group">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium">Voir les analytics</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Statistiques détaillées</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] group-hover:translate-x-0.5 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Forms */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Formulaires récents</CardTitle>
            <CardDescription>Vos derniers formulaires modifiés</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/forms">
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentForms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/10">
                <FileText className="h-8 w-8 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-lg font-semibold">Aucun formulaire</h3>
              <p className="mb-4 mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Créez votre premier formulaire pour commencer.
              </p>
              <Button asChild>
                <Link href="/forms">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau formulaire
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentForms.map((form, _i) => (
                <div
                  key={form.id}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4 transition-colors hover:bg-[hsl(var(--muted))]/50"
                >
                  <Link
                    href={`/forms/${form.id}/edit`}
                    className="flex flex-1 items-center gap-4 min-w-0"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 shrink-0">
                      <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">{form.title || "Sans titre"}</h4>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {form.response_count} réponses · Modifié {formatRelative(form.updated_at)}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", statusColors[form.status])}
                    >
                      {form.status === "published" ? "Actif" : form.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/forms/${form.id}/edit`}>Modifier</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
