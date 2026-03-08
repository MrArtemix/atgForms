"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "@/lib/hooks/use-form";
import { useFormAnalytics } from "@/lib/hooks/use-responses";
import { ResponseTable } from "@/components/responses/response-table";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { responseService } from "@/lib/services/response-service";
import { FormResponse } from "@/types/response";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/utils/export";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import {
  Inbox,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  const { form, loading: formLoading } = useForm(formId);
  const { analytics, loading: analyticsLoading } = useFormAnalytics(formId);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchResponses = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    try {
      const result = await responseService.getResponses(formId, page, 20);
      setResponses(result.data);
      setTotalCount(result.count);
    } finally {
      setLoading(false);
    }
  }, [formId, page]);

  useEffect(() => {
    void fetchResponses();
  }, [fetchResponses]);

  const handleViewResponse = (responseId: string) => {
    router.push(`/forms/${formId}/responses/${responseId}`);
  };

  const handleDeleteResponse = async (responseId: string) => {
    await responseService.deleteResponse(responseId);
    await fetchResponses();
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    if (!form) return;
    const allResponses =
      await responseService.getAllResponsesWithAnswers(formId);
    const fields = form.fields.filter(
      (f) => !["section_header", "paragraph_text"].includes(f.type)
    );

    switch (format) {
      case "csv":
        exportToCSV(fields, allResponses, form.title);
        break;
      case "excel":
        await exportToExcel(fields, allResponses, form.title);
        break;
      case "pdf":
        exportToPDF(fields, allResponses, form.title, form.title);
        break;
    }
  };

  if (formLoading) {
    return (
      <PageShell>
        <div className="space-y-6 animate-fade-in">
          {/* Skeleton header */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          {/* Skeleton stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-[120px] rounded-xl"
                style={{ animationDelay: `${i * 75}ms` }}
              />
            ))}
          </div>
          {/* Skeleton table */}
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </PageShell>
    );
  }

  const completionRate =
    analytics && analytics.total_responses > 0
      ? Math.round(
          (analytics.complete_responses / analytics.total_responses) * 100
        )
      : 0;

  return (
    <PageShell className="animate-fade-in">
      <PageHeader
        eyebrow="Formulaires"
        title="Réponses"
        description={form?.title || "Chargement..."}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up animate-stagger-1">
          <StatCard
            label="Total réponses"
            value={analytics?.total_responses ?? 0}
            icon={<Inbox className="h-5 w-5" />}
            variant="blue"
          />
        </div>
        <div className="animate-fade-in-up animate-stagger-2">
          <StatCard
            label="Complètes"
            value={analytics?.complete_responses ?? 0}
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="green"
            description={`${completionRate}% de complétion`}
          />
        </div>
        <div className="animate-fade-in-up animate-stagger-3">
          <StatCard
            label="Incomplètes"
            value={analytics?.incomplete_responses ?? 0}
            icon={<AlertCircle className="h-5 w-5" />}
            variant="orange"
          />
        </div>
        <div className="animate-fade-in-up animate-stagger-4">
          <StatCard
            label="Aujourd'hui"
            value={analytics?.responses_today ?? 0}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="violet"
            description={
              analytics?.responses_this_week
                ? `${analytics.responses_this_week} cette semaine`
                : undefined
            }
          />
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in-up animate-stagger-5">
        {totalCount === 0 && !loading ? (
          <EmptyState
            icon={<Inbox className="h-10 w-10" />}
            title="Aucune réponse"
            description="Ce formulaire n'a pas encore reçu de réponses. Partagez le lien de votre formulaire pour commencer à collecter des données."
            action={
              form?.slug ? (
                <Link href={`/forms/${formId}`}>
                  <Button className="hover-lift active-press">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager le formulaire
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ResponseTable
            responses={responses}
            totalCount={totalCount}
            fields={form?.fields || []}
            page={page}
            pageSize={20}
            onPageChange={setPage}
            onViewResponse={handleViewResponse}
            onDeleteResponse={handleDeleteResponse}
            onExport={handleExport}
            loading={loading}
          />
        )}
      </div>
    </PageShell>
  );
}
