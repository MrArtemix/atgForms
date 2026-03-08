"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "@/lib/hooks/use-form";
import { responseService } from "@/lib/services/response-service";
import { createClient } from "@/lib/supabase/client";
import { ResponseWithAnswers } from "@/types/response";
import { ResponseDetail } from "@/components/responses/response-detail";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileX,
  FileOutput,
  Loader2,
  Download,
  ExternalLink,
  User,
  Mail,
  Calendar,
  CheckCircle2,
  Globe,
  Monitor,
  Clock,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils/date";

const PDF_API_URL =
  process.env.NEXT_PUBLIC_PDF_API_URL || "http://127.0.0.1:8002";

function parseUserAgent(ua: string | null): string {
  if (!ua) return "-";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  return "Autre";
}

function computeDuration(
  start: string,
  end: string | null
): string {
  if (!end) return "-";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 0) return "-";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}min ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

export default function ResponseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  const responseId = params.responseId as string;

  const { form, loading: formLoading } = useForm(formId);
  const [response, setResponse] = useState<ResponseWithAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseIds, setResponseIds] = useState<string[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  // Fetch all response IDs for navigation
  useEffect(() => {
    async function fetchIds() {
      const supabase = createClient();
      const { data } = await supabase
        .from("form_responses")
        .select("id")
        .eq("form_id", formId)
        .order("created_at", { ascending: false });
      if (data) setResponseIds(data.map((r) => r.id));
    }
    if (formId) void fetchIds();
  }, [formId]);

  useEffect(() => {
    async function fetchResponse() {
      if (!responseId) return;
      try {
        const data = await responseService.getResponseWithAnswers(responseId);
        setResponse(data);
      } catch (error) {
        console.error("Failed to fetch response:", error);
      } finally {
        setLoading(false);
      }
    }
    void fetchResponse();
  }, [responseId]);

  const currentIndex = useMemo(
    () => responseIds.indexOf(responseId),
    [responseIds, responseId]
  );
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < responseIds.length - 1;

  const navigateTo = (direction: "prev" | "next") => {
    const targetIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    const targetId = responseIds[targetIndex];
    if (targetId) router.push(`/forms/${formId}/responses/${targetId}`);
  };

  const handleProduceDoc = useCallback(async () => {
    if (!form || !response) return;
    setPdfLoading(true);

    try {
      // Construire le mapping field_id → label pour cette réponse
      const fieldsMap: Record<string, string> = {};
      if (Array.isArray(form.fields)) {
        for (const f of form.fields) {
          fieldsMap[f.id] = f.label;
        }
      } else {
        for (const [id, f] of Object.entries(form.fields)) {
          fieldsMap[id] = (f as { label: string }).label;
        }
      }

      // Construire les données label → valeur
      const answersData: Record<string, unknown> = {};
      for (const ans of response.answers) {
        const label = fieldsMap[ans.field_id] || ans.field_id;
        const value =
          ans.value_text ??
          ans.value_number ??
          ans.value_boolean ??
          ans.value_date ??
          ans.value_time ??
          ans.value_json ??
          null;
        answersData[label] = value;
      }

      const payload = {
        form_id: formId,
        response_id: responseId,
        form_title: form.title,
        respondent_name: response.respondent_name,
        respondent_email: response.respondent_email,
        submitted_at: response.created_at,
        answers: answersData,
      };

      const res = await fetch(`${PDF_API_URL}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur: ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfDialogOpen(true);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Impossible de générer le document. Vérifiez que le serveur PDF est actif.");
    } finally {
      setPdfLoading(false);
    }
  }, [form, response, formId, responseId]);

  if (formLoading || loading) {
    return (
      <PageShell>
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-[140px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </PageShell>
    );
  }

  if (!form || !response) {
    return (
      <PageShell className="animate-fade-in">
        <EmptyState
          icon={<FileX className="h-10 w-10" />}
          title="Réponse introuvable"
          description="Cette réponse n'existe pas ou a été supprimée."
          action={
            <Button
              variant="outline"
              onClick={() => router.push(`/forms/${formId}/responses`)}
              className="hover-lift"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux réponses
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="animate-fade-in">
      <PageHeader
        eyebrow="Réponses"
        title="Détails de la réponse"
        description={`Formulaire : ${form.title}`}
        primaryAction={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleProduceDoc}
              disabled={pdfLoading}
              className="hover-lift active-press bg-[#131F36] hover:bg-[#1E3A5F] text-white"
            >
              {pdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileOutput className="mr-2 h-4 w-4" />
              )}
              {pdfLoading ? "Génération..." : "Produire un doc"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/forms/${formId}/responses`)}
              className="hover-lift active-press"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            {responseIds.length > 1 && (
              <div className="flex items-center gap-1 border rounded-lg px-2 py-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!hasPrev}
                  onClick={() => navigateTo("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[3rem] text-center">
                  {currentIndex >= 0 ? currentIndex + 1 : "?"} / {responseIds.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!hasNext}
                  onClick={() => navigateTo("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        }
      />

      {/* Carte informations du répondant */}
      <Card className="animate-fade-in-up animate-stagger-1">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-4 text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            Informations du répondant
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))]/50">
                <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Nom</p>
                <p className="text-sm font-medium">
                  {response.respondent_name || "Anonyme"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))]/50">
                <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Email</p>
                <p className="text-sm font-medium truncate max-w-[180px]">
                  {response.respondent_email || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))]/50">
                <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Date de soumission</p>
                <p className="text-sm font-medium">
                  {formatDateTime(response.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))]/50">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Statut</p>
                <Badge
                  variant={response.is_complete ? "success" : "warning"}
                  size="sm"
                >
                  {response.is_complete ? "Complète" : "Incomplète"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))]/50">
                <Globe className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Adresse IP</p>
                <p className="text-sm font-medium">
                  {response.ip_address || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))]/50">
                <Monitor className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Navigateur</p>
                <p className="text-sm font-medium">
                  {parseUserAgent(response.user_agent)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))]/50">
                <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Durée</p>
                <p className="text-sm font-medium">
                  {computeDuration(response.started_at, response.completed_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response detail */}
      <div className="max-w-4xl animate-fade-in-up animate-stagger-2">
        <ResponseDetail
          response={response}
          fields={form.fields}
          pages={form.pages}
          formId={form.id}
          formTitle={form.title}
        />
      </div>

      {/* Dialog preview PDF */}
      <Dialog
        open={pdfDialogOpen}
        onOpenChange={(open) => {
          setPdfDialogOpen(open);
          if (!open && pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-5 pb-3 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg">
                Fiche Officielle – {response.respondent_name || "Artisan"}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {pdfUrl && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = pdfUrl;
                        a.download = `FICHE_${(response.respondent_name || "ARTISAN").toUpperCase().replace(/\s+/g, "_")}.pdf`;
                        a.click();
                      }}
                      className="hover-lift"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(pdfUrl, "_blank")}
                      className="hover-lift"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ouvrir
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="Aperçu du document PDF"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
