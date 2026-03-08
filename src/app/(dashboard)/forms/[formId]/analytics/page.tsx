"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useForm } from "@/lib/hooks/use-form";
import { useFormAnalytics, useFieldsAnalytics, useFormFunnel } from "@/lib/hooks/use-responses";
import {
  AnalyticsSummary,
  ResponseTimeline,
  FieldAnalyticsCard,
  CompletionFunnel,
  DateRangePicker,
} from "@/components/responses/response-charts";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, CheckCircle, History, TrendingUp, Signal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FieldType } from "@/types/field-types";

type Period = "7d" | "30d" | "90d" | "all" | "custom";

const periodLabels: Record<Period, string> = {
  "7d": "7 jours",
  "30d": "30 jours",
  "90d": "90 jours",
  all: "Tout",
  custom: "Personnalisé",
};

const LAYOUT_TYPES: FieldType[] = [
  "section_header",
  "form_header",
  "paragraph_text",
  "divider",
  "spacer",
  "columns_2",
  "columns_3",
  "columns_4",
  "image",
  "video",
  "accordion",
];

function computeTrend(
  dailyData: { date: string; count: number }[],
  days: number
): { totalCurrent: number; totalPrevious: number; trend: number | undefined } {
  const now = new Date();
  const currentCutoff = new Date();
  currentCutoff.setDate(now.getDate() - days);
  const previousCutoff = new Date();
  previousCutoff.setDate(now.getDate() - days * 2);

  let totalCurrent = 0;
  let totalPrevious = 0;

  for (const d of dailyData) {
    const date = new Date(d.date);
    if (date >= currentCutoff && date <= now) {
      totalCurrent += d.count;
    } else if (date >= previousCutoff && date < currentCutoff) {
      totalPrevious += d.count;
    }
  }

  const trend =
    totalPrevious > 0
      ? Math.round(((totalCurrent - totalPrevious) / totalPrevious) * 100)
      : undefined;

  return { totalCurrent, totalPrevious, trend };
}

export default function AnalyticsPage() {
  const params = useParams();
  const formId = params.formId as string;
  const { form, loading: formLoading } = useForm(formId);
  const { analytics, loading: analyticsLoading } = useFormAnalytics(formId);
  const { funnel, loading: funnelLoading } = useFormFunnel(formId);
  const [period, setPeriod] = useState<Period>("30d");
  const [customRange, setCustomRange] = useState({
    from: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  // Compute data field IDs (exclude layout types)
  const dataFieldIds = useMemo(() => {
    if (!form?.fields) return [];
    return form.fields
      .filter((f) => !LAYOUT_TYPES.includes(f.type))
      .map((f) => f.id);
  }, [form?.fields]);

  const { fieldAnalytics, loading: fieldsLoading } = useFieldsAnalytics(dataFieldIds);

  const filteredDailyData = useMemo(() => {
    if (!analytics?.daily_responses) return [];
    const data = analytics.daily_responses;
    if (period === "all") return data;

    if (period === "custom") {
      const fromDate = new Date(customRange.from);
      const toDate = new Date(customRange.to);
      return data.filter((d) => {
        const date = new Date(d.date);
        return date >= fromDate && date <= toDate;
      });
    }

    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter((d) => new Date(d.date) >= cutoff);
  }, [analytics?.daily_responses, period, customRange]);

  // Compute trends based on period
  const trends = useMemo(() => {
    if (!analytics?.daily_responses || period === "all" || period === "custom") {
      return { responses: undefined, completion: undefined, today: undefined };
    }

    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const { trend: responsesTrend } = computeTrend(analytics.daily_responses, days);

    return { responses: responsesTrend, completion: undefined, today: undefined };
  }, [analytics?.daily_responses, period]);

  const completionRate = analytics
    ? analytics.total_responses > 0
      ? Math.round((analytics.complete_responses / analytics.total_responses) * 100)
      : 0
    : 0;

  const avgTimeMin = analytics?.avg_completion_time
    ? Math.round(analytics.avg_completion_time / 60)
    : null;

  if (formLoading || analyticsLoading) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-32 skeleton animate-stagger-${Math.min(i + 1, 4)}`} />
          ))}
        </div>
        <div className="h-[300px] skeleton animate-stagger-3" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 animate-fade-in-up">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--muted))]">
            <Signal className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="text-lg font-semibold">Pas encore de données</h3>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] max-w-sm">
            Les statistiques apparaîtront ici dès que vous recevrez vos premières réponses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header with period selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <h2 className="text-xl font-semibold">Analytiques</h2>
        <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] p-1 bg-[hsl(var(--muted))]/30">
          {(Object.keys(periodLabels) as Period[])
            .filter((p) => p !== "custom")
            .map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  period === p
                    ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                {periodLabels[p]}
              </button>
            ))}
          <DateRangePicker
            from={customRange.from}
            to={customRange.to}
            onChange={(range) => {
              setCustomRange(range);
              setPeriod("custom");
            }}
          />
        </div>
      </div>

      {/* Stat cards with trends */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up animate-stagger-1">
          <StatCard
            label="Total réponses"
            value={analytics.total_responses}
            icon={<Inbox className="h-5 w-5" />}
            variant="blue"
            trend={trends.responses}
          />
        </div>
        <div className="animate-fade-in-up animate-stagger-2">
          <StatCard
            label="Taux de complétion"
            value={completionRate}
            description={`${analytics.complete_responses} complètes sur ${analytics.total_responses}`}
            icon={<CheckCircle className="h-5 w-5" />}
            variant="green"
          />
        </div>
        <div className="animate-fade-in-up animate-stagger-3">
          <StatCard
            label="Temps moyen"
            value={avgTimeMin ?? 0}
            description={avgTimeMin ? `${avgTimeMin} minute${avgTimeMin > 1 ? "s" : ""}` : "Non disponible"}
            icon={<History className="h-5 w-5" />}
            variant="orange"
          />
        </div>
        <div className="animate-fade-in-up animate-stagger-4">
          <StatCard
            label="Aujourd'hui"
            value={analytics.responses_today}
            description={`${analytics.responses_this_week} cette semaine`}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="violet"
          />
        </div>
      </div>

      {/* Summary */}
      <Card className="animate-fade-in-up animate-stagger-5">
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsSummary analytics={analytics} />
        </CardContent>
      </Card>

      {/* Completion Funnel */}
      {!funnelLoading && funnel && (
        <div className="animate-fade-in-up">
          <CompletionFunnel funnel={funnel} />
        </div>
      )}

      {/* Timeline chart */}
      {filteredDailyData.length > 0 && (
        <div className="animate-fade-in-up">
          <ResponseTimeline data={filteredDailyData} />
        </div>
      )}

      {/* Field Analytics */}
      {!fieldsLoading && form?.fields && Object.keys(fieldAnalytics).length > 0 && (
        <div className="space-y-4 animate-fade-in-up">
          <h3 className="text-lg font-semibold">Analyse par champ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.fields
              .filter((f) => !LAYOUT_TYPES.includes(f.type) && fieldAnalytics[f.id])
              .map((field) => (
                <FieldAnalyticsCard
                  key={field.id}
                  fieldId={field.id}
                  fieldLabel={field.label}
                  fieldType={field.type}
                  analytics={fieldAnalytics[field.id]}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
