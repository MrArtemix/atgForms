"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { templateService } from "@/lib/services/template-service";
import { docTemplateService } from "@/lib/services/doc-template-service";
import { formService } from "@/lib/services/form-service";
import { workspaceService } from "@/lib/services/workspace-service";
import { Template } from "@/types/form";
import { DocumentTemplate } from "@/types/document-template";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { Layout, ArrowRight, Search, FileText, ClipboardList, Loader2, Download, Eye } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils/cn";
import { generateDocumentPDF } from "@/lib/utils/pdf-generator";
import { ResponseWithAnswers } from "@/types/response";

const CATEGORIES = ["All", "Contact", "Feedback", "Registration", "Survey", "Quiz", "Order", "HR", "Education"];
const DOC_CATEGORIES = ["All", "certificate", "attestation", "badge", "report", "general"];

const CATEGORY_LABELS: Record<string, string> = {
  All: "Tous",
  Contact: "Contact",
  Feedback: "Avis",
  Registration: "Inscription",
  Survey: "Sondage",
  Quiz: "Quiz",
  Order: "Commande",
  HR: "RH",
  Education: "Éducation",
  certificate: "Certificat",
  attestation: "Attestation",
  badge: "Badge",
  report: "Rapport",
  general: "Général",
};

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"forms" | "documents">("forms");

  const [formTemplates, setFormTemplates] = useState<Template[]>([]);
  const [docTemplates, setDocTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  useEffect(() => {
    async function load() {
      try {
        const [formsData, docsData] = await Promise.all([
          templateService.getSystemTemplates(),
          docTemplateService.getSystemTemplates()
        ]);
        setFormTemplates(formsData);
        setDocTemplates(docsData);
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  // Reset category on tab change
  useEffect(() => {
    setSelectedCategory("All");
  }, [activeTab]);

  const filteredForms = formTemplates.filter((t) => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredDocs = docTemplates.filter((t) => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseFormTemplate = async (template: Template) => {
    try {
      // Workspace par défaut : personnel
      const defaultWorkspace = await workspaceService.ensurePersonalWorkspace();

      // Cas particulier : fiche officielle artisans → workspace Brobroli / ADEM
      const brobroliWorkspaceId = "89fbae39-be0a-496a-b080-992cf8e58bd9";
      const targetWorkspaceId =
        template.name === "Fiche officielle artisans"
          ? brobroliWorkspaceId
          : defaultWorkspace.id;

      const formWithDetails = await formService.createFormFromTemplate(
        targetWorkspaceId,
        template
      );

      await templateService.incrementUseCount(template.id);
      router.push(`/forms/${formWithDetails.id}/edit`);
    } catch (error) {
      console.error("Failed to use form template:", error);
    }
  };

  const handlePreviewDocTemplate = async (template: DocumentTemplate) => {
    setIsGeneratingPreview(template.id);

    try {
      // Mock data for preview
      const mockResponse: ResponseWithAnswers = {
        id: "preview-123",
        form_id: "form-preview",
        is_complete: true,
        created_at: new Date().toISOString(),
        respondent_id: null,
        respondent_email: null,
        respondent_name: null,
        ip_address: null,
        user_agent: null,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        metadata: {},
        answers: [
          { id: "1", response_id: "preview", field_id: "Nom", value_text: "Doe", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "2", response_id: "preview", field_id: "Prénoms", value_text: "John", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "3", response_id: "preview", field_id: "Date de naissance", value_text: null, value_number: null, value_boolean: null, value_date: "1990-01-01", value_time: null, value_json: null, created_at: "" },
          { id: "4", response_id: "preview", field_id: "Lieu de naissance", value_text: "Paris", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "5", response_id: "preview", field_id: "N° CNI / Attestation d’identité", value_text: "C00123456", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "6", response_id: "preview", field_id: "Métier principal", value_text: "Plombier", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "7", response_id: "preview", field_id: "Années d’expérience", value_text: "10+ ans", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "8", response_id: "preview", field_id: "Catégorie A – Certifiés", value_text: "A1++ (10+ ans)", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
        ]
      };

      const blob = await generateDocumentPDF(
        template,
        template.name,
        [], // No fields needed for the dummy response mapping in generateDocumentPDF assuming it uses simple matches
        mockResponse
      );

      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setPreviewTemplate(template);
      setPreviewOpen(true);

      // We don't increment use count for just previewing
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Impossible de générer l'aperçu du PDF.",
      });
    } finally {
      setIsGeneratingPreview(null);
    }
  };

  const handleDownloadPreview = () => {
    if (!pdfBlobUrl || !previewTemplate) return;
    const link = document.createElement("a");
    link.href = pdfBlobUrl;
    link.download = `Apercu_${previewTemplate.name.replace(/\\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <PageShell>
        <PageHeader eyebrow="Templates" title="Modèles" description="Choisissez un modèle pour démarrer" />
        <div className="flex gap-2 flex-wrap mb-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-9 w-20 skeleton" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={cn("h-48 skeleton", `animate-stagger-${Math.min(i + 1, 6)}`)} />
          ))}
        </div>
      </PageShell>
    );
  }

  const currentCategories = activeTab === "forms" ? CATEGORIES : DOC_CATEGORIES;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Templates"
        title="Modèles"
        description="Parcourez la bibliothèque de modèles prêts à l'emploi"
        secondaryAction={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        }
      />

      {/* TABS */}
      <div className="flex bg-muted/50 p-1 rounded-lg w-max mb-6">
        <button
          onClick={() => setActiveTab("forms")}
          className={cn(
            "flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-all duration-200",
            activeTab === "forms"
              ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <ClipboardList className="h-4 w-4" />
          Formulaires
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={cn(
            "flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-all duration-200",
            activeTab === "documents"
              ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <FileText className="h-4 w-4" />
          Documents PDF
        </button>
      </div>

      {/* CATEGORIES */}
      <div className="flex gap-2 flex-wrap mb-6 animate-fade-in-up">
        {currentCategories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="active-press transition-all duration-200"
          >
            {CATEGORY_LABELS[cat] || cat}
          </Button>
        ))}
      </div>

      {activeTab === "forms" && (
        filteredForms.length === 0 ? (
          <EmptyState icon={<Layout className="h-8 w-8" />} title="Aucun modèle de formulaire" description="Aucun modèle trouvé." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForms.map((template, i) => (
              <Card key={template.id} className={cn("hover-lift transition-all duration-200 hover:border-[hsl(var(--primary))]/30 animate-fade-in-up", `animate-stagger-${Math.min(i + 1, 6)}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">{CATEGORY_LABELS[template.category] || template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Utilisé {template.use_count} fois</span>
                    <Button size="sm" onClick={() => void handleUseFormTemplate(template)} className="active-press">
                      Utiliser <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === "documents" && (
        filteredDocs.length === 0 ? (
          <EmptyState icon={<FileText className="h-8 w-8" />} title="Aucun modèle de document" description="Aucun modèle trouvé." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((template, i) => (
              <Card key={template.id} className={cn("hover-lift transition-all duration-200 hover:border-[hsl(var(--primary))]/30 animate-fade-in-up flex flex-col justify-between", `animate-stagger-${Math.min(i + 1, 6)}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </div>
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-[hsl(var(--primary))]/5 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20">
                      {CATEGORY_LABELS[template.category] || template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">Utilisé {template.use_count} fois</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void handlePreviewDocTemplate(template)}
                      disabled={isGeneratingPreview === template.id}
                      className="active-press"
                    >
                      {isGeneratingPreview === template.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      Aperçu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
      {/* Dialog Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 md:p-6 border-b border-[hsl(var(--border))]">
            <DialogTitle>Aperçu : {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-muted/20 relative">
            {pdfBlobUrl ? (
              <iframe
                src={`${pdfBlobUrl}#toolbar=0`}
                className="w-full h-full border-0"
                title={`Preview PDF - ${previewTemplate?.name}`}
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
                Fermer
              </Button>
              <Button onClick={handleDownloadPreview} className="hover-lift active-press">
                <Download className="mr-2 h-4 w-4" />
                Télécharger l&apos;exemple
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
