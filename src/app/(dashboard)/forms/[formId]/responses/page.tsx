"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "@/lib/hooks/use-form";
import { ResponseTable } from "@/components/responses/response-table";
import { ResponseDetail } from "@/components/responses/response-detail";
import { responseService } from "@/lib/services/response-service";
import { FormResponse, ResponseWithAnswers } from "@/types/response";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/utils/export";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, PageShell } from "@/components/layout/page-shell";

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  const { form, loading: formLoading } = useForm(formId);
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
    fetchResponses();
  }, [fetchResponses]);

  const handleViewResponse = (responseId: string) => {
    router.push(`/forms/${formId}/responses/${responseId}`);
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm("Are you sure you want to delete this response?")) return;
    await responseService.deleteResponse(responseId);
    fetchResponses();
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
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Formulaires"
        title="Réponses"
        description={form?.title || "Chargement..."}
      />
      <div className="mt-6 space-y-6">
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
      </div>
    </PageShell>
  );
}
