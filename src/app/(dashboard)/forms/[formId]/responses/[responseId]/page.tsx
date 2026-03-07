"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "@/lib/hooks/use-form";
import { responseService } from "@/lib/services/response-service";
import { ResponseWithAnswers } from "@/types/response";
import { ResponseDetail } from "@/components/responses/response-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Loader2, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function ResponseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const formId = params.formId as string;
    const responseId = params.responseId as string;

    const { form, loading: formLoading } = useForm(formId);
    const [response, setResponse] = useState<ResponseWithAnswers | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const { toast } = useToast();

    // Nettoyage de l'URL blob à la fermeture
    useEffect(() => {
        return () => {
            if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
        };
    }, [pdfBlobUrl]);

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

    if (formLoading || loading) {
        return (
            <PageShell>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </PageShell>
        );
    }

    if (!form || !response) {
        return (
            <PageShell>
                <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
                    Réponse introuvable.
                </div>
            </PageShell>
        );
    }

    const handleProduceDoc = async () => {
        setIsGenerating(true);
        try {
            const responseData: Record<string, string | number> = {};
            const supabase = createClient();

            form.fields.forEach(field => {
                if (["section_header", "paragraph_text"].includes(field.type)) return;
                const answer = response.answers.find(a => a.field_id === field.id);

                let value: string | number = "-";
                if (answer) {
                    if (answer.value_text) value = answer.value_text;
                    else if (answer.value_number !== null && answer.value_number !== undefined) value = answer.value_number;
                    else if (answer.value_boolean !== null && answer.value_boolean !== undefined) value = answer.value_boolean ? "Oui" : "Non";
                    else if (answer.value_date) value = answer.value_date;
                    else if (answer.value_time) value = answer.value_time;
                    else if (answer.value_json) {
                        const jsonVal = answer.value_json;
                        if (Array.isArray(jsonVal) && typeof jsonVal[0] === 'string' && (jsonVal[0] as string).includes('/')) {
                            value = jsonVal.map((path: unknown) => supabase.storage.from("response-uploads").getPublicUrl(String(path)).data.publicUrl).join(", ");
                        } else {
                            value = Array.isArray(jsonVal) ? (jsonVal as string[]).join(", ") : JSON.stringify(jsonVal);
                        }
                    }
                }
                responseData[field.label || field.id] = value;
            });

            const res = await fetch("http://127.0.0.1:8002/generate-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    template_id: form.title || "Formulaire",
                    response_data: responseData
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Erreur de génération");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            setPdfBlobUrl(url);
            setPreviewOpen(true);

            toast({
                title: "Succès",
                description: "Le document est prêt à être prévisualisé.",
            });
        } catch (error: unknown) {
            console.error("Génération PDF:", error);
            const message = error instanceof Error ? error.message : "Erreur serveur";
            toast({
                title: "Erreur",
                variant: "destructive",
                description: `Échec de la génération du document: ${message}`,
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!pdfBlobUrl) return;
        const a = document.createElement("a");
        a.href = pdfBlobUrl;
        a.download = `Document_${response?.respondent_name || response?.respondent_email || "Anonyme"}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setPreviewOpen(false);
    };

    return (
        <PageShell>
            <PageHeader
                eyebrow="Réponses"
                title="Détails de la réponse"
                description={`Formulaire: ${form.title}`}
                primaryAction={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => router.back()} className="hover-lift active-press">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Button>
                        <Button onClick={() => void handleProduceDoc()} disabled={isGenerating} className="hover-lift active-press">
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                            Produire un doc
                        </Button>
                    </div>
                }
            />
            <div className="mt-6 max-w-4xl animate-fade-in-up">
                <ResponseDetail response={response} fields={form.fields} formId={form.id} formTitle={form.title} />
            </div>

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-4 md:p-6 border-b border-[hsl(var(--border))]">
                        <DialogTitle>Prévisualisation du Document</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full bg-muted/20 relative">
                        {pdfBlobUrl ? (
                            <iframe
                                src={`${pdfBlobUrl}#toolbar=0`}
                                className="w-full h-full border-0"
                                title="PDF Preview"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="p-4 md:p-6 border-t border-[hsl(var(--border))] glass-panel">
                        <div className="flex justify-end gap-2 w-full">
                            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleDownload} className="hover-lift active-press">
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger le PDF
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageShell>
    );
}
