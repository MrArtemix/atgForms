"use client";

import { useParams } from "next/navigation";
import { useForm } from "@/lib/hooks/use-form";
import { useFormAnalytics } from "@/lib/hooks/use-responses";
import {
  AnalyticsSummary,
  ResponseTimeline,
} from "@/components/responses/response-charts";

export default function AnalyticsPage() {
  const params = useParams();
  const formId = params.formId as string;
  const { loading: formLoading } = useForm(formId);
  const { analytics, loading: analyticsLoading } = useFormAnalytics(formId);

  if (formLoading || analyticsLoading) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-20 skeleton animate-stagger-${Math.min(i + 1, 6)}`} />
          ))}
        </div>
        <div className="h-[300px] skeleton animate-stagger-3" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center text-[hsl(var(--muted-foreground))] animate-fade-in-up">
        No analytics data available yet
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold animate-fade-in-up">Analytics</h2>
      <div className="animate-fade-in-up animate-stagger-1">
        <AnalyticsSummary analytics={analytics} />
      </div>
      {analytics.daily_responses && analytics.daily_responses.length > 0 && (
        <div className="animate-fade-in-up animate-stagger-2">
          <ResponseTimeline data={analytics.daily_responses} />
        </div>
      )}
    </div>
  );
}
