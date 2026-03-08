"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormAnalytics, FieldAnalytics, FunnelStep } from "@/types/response";
import { FieldType } from "@/types/field-types";
import { CalendarDays, Hash, BarChart3, Type } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#84CC16",
  "#6366F1",
];

interface ResponseTimelineProps {
  data: { date: string; count: number }[];
}

export function ResponseTimeline({ data }: ResponseTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Responses Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ChoiceDistributionProps {
  title: string;
  data: { value: string; count: number }[];
  type?: "pie" | "bar";
}

export function ChoiceDistribution({
  title,
  data,
  type = "pie",
}: ChoiceDistributionProps) {
  if (!data || data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {type === "pie" ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                nameKey="value"
                label={(props: PieLabelRenderProps) =>
                  `${props.name} (${(((props.percent as number) ?? 0) * 100).toFixed(0)}%)`
                }
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="value" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

interface AnalyticsSummaryProps {
  analytics: FormAnalytics;
}

export function AnalyticsSummary({ analytics }: AnalyticsSummaryProps) {
  const stats = [
    { label: "Total Responses", value: analytics.total_responses },
    { label: "Complete", value: analytics.complete_responses },
    { label: "Incomplete", value: analytics.incomplete_responses },
    { label: "Today", value: analytics.responses_today },
    { label: "This Week", value: analytics.responses_this_week },
    { label: "This Month", value: analytics.responses_this_month },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Numeric Stats Card ─── */

interface NumericStatsCardProps {
  label: string;
  analytics: FieldAnalytics;
}

export function NumericStatsCard({ label, analytics }: NumericStatsCardProps) {
  const stats = [
    { key: "Moyenne", value: analytics.average?.toFixed(1) ?? "–" },
    { key: "Min", value: analytics.min?.toString() ?? "–" },
    { key: "Max", value: analytics.max?.toString() ?? "–" },
    { key: "Médiane", value: analytics.median?.toFixed(1) ?? "–" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Hash className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.key} className="rounded-lg bg-[hsl(var(--muted))]/50 p-2.5 text-center">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{s.key}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
          {analytics.total_answers} réponse{analytics.total_answers !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}

/* ─── Fill Rate Bar ─── */

interface FillRateBarProps {
  label: string;
  analytics: FieldAnalytics;
}

export function FillRateBar({ label, analytics }: FillRateBarProps) {
  const filled = analytics.filled ?? 0;
  const total = analytics.total_answers;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Type className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {filled} / {total} rempli{filled !== 1 ? "s" : ""}
          </span>
          <span className="text-sm font-semibold">{pct}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-[hsl(var(--muted))]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Field Analytics Card (dispatcher) ─── */

const CHOICE_TYPES: FieldType[] = [
  "single_choice",
  "multiple_choice",
  "dropdown",
  "yes_no",
  "image_choice",
];

const NUMERIC_TYPES: FieldType[] = ["number", "rating", "linear_scale", "nps"];

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

interface FieldAnalyticsCardProps {
  fieldId: string;
  fieldLabel: string;
  fieldType: FieldType;
  analytics: FieldAnalytics;
}

export function FieldAnalyticsCard({
  fieldLabel,
  fieldType,
  analytics,
}: FieldAnalyticsCardProps) {
  if (LAYOUT_TYPES.includes(fieldType)) return null;

  if (CHOICE_TYPES.includes(fieldType) && analytics.distribution) {
    return (
      <ChoiceDistribution
        title={fieldLabel}
        data={analytics.distribution}
        type={analytics.distribution.length > 5 ? "bar" : "pie"}
      />
    );
  }

  if (NUMERIC_TYPES.includes(fieldType)) {
    return <NumericStatsCard label={fieldLabel} analytics={analytics} />;
  }

  return <FillRateBar label={fieldLabel} analytics={analytics} />;
}

/* ─── Completion Funnel ─── */

interface CompletionFunnelProps {
  funnel: FunnelStep[];
}

export function CompletionFunnel({ funnel }: CompletionFunnelProps) {
  if (funnel.length <= 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Entonnoir de complétion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Formulaire à page unique — l&apos;entonnoir nécessite plusieurs pages.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = funnel[0]?.respondents_count || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Entonnoir de complétion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {funnel.map((step, i) => {
          const pct = maxCount > 0 ? (step.respondents_count / maxCount) * 100 : 0;
          const prevCount = i > 0 ? funnel[i - 1].respondents_count : null;
          const dropPct =
            prevCount && prevCount > 0
              ? Math.round(((prevCount - step.respondents_count) / prevCount) * 100)
              : null;

          // Green → Orange → Red gradient based on retention
          const retention = pct / 100;
          const barColor =
            retention > 0.7
              ? "from-emerald-500 to-emerald-400"
              : retention > 0.4
                ? "from-orange-500 to-orange-400"
                : "from-red-500 to-red-400";

          return (
            <div key={step.page_id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate max-w-[60%]">
                  {step.page_title || `Page ${step.sort_order + 1}`}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{step.respondents_count}</span>
                  {dropPct !== null && dropPct > 0 && (
                    <span className="text-xs text-red-500">-{dropPct}%</span>
                  )}
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-[hsl(var(--muted))]">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                    barColor
                  )}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ─── Date Range Picker ─── */

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
          <CalendarDays className="h-4 w-4" />
          Personnalisé
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="space-y-3">
          <p className="text-sm font-medium">Période personnalisée</p>
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <label className="text-xs text-[hsl(var(--muted-foreground))]">Du</label>
              <input
                type="date"
                value={from}
                onChange={(e) => onChange({ from: e.target.value, to })}
                className="block w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-sm"
              />
            </div>
            <span className="text-[hsl(var(--muted-foreground))] mt-5">→</span>
            <div className="space-y-1">
              <label className="text-xs text-[hsl(var(--muted-foreground))]">Au</label>
              <input
                type="date"
                value={to}
                onChange={(e) => onChange({ from, to: e.target.value })}
                className="block w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-full rounded-md bg-[hsl(var(--primary))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
          >
            Appliquer
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
