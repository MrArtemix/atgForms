"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { templateService } from "@/lib/services/template-service";
import { docTemplateService } from "@/lib/services/doc-template-service";
import { formService } from "@/lib/services/form-service";
import { workspaceService } from "@/lib/services/workspace-service";
import { useHolding } from "@/lib/hooks/use-holding";
import { Workspace } from "@/types/workspace";
import { Template } from "@/types/form";
import { DocumentTemplate } from "@/types/document-template";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/common/empty-state";
import {
  LayoutGrid,
  ChevronRight,
  Search,
  ClipboardList,
  Loader2,
  Download,
  ScanEye,
  FileText,
  FileDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PdfPreviewDialog } from "@/components/common/pdf-preview-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils/cn";
import { generateDocumentPDF } from "@/lib/utils/pdf-generator";
import { ResponseWithAnswers } from "@/types/response";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  "All",
  "Contact",
  "Feedback",
  "Registration",
  "Survey",
  "HR",
  "Education",
];
const DOC_CATEGORIES = [
  "All",
  "certificate",
  "attestation",
  "badge",
  "report",
  "general",
];

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

const CATEGORY_COLORS: Record<string, string> = {
  Contact: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Feedback:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Registration:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Survey:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  HR: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Education:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  certificate:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  attestation:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  badge:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  report: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
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
  const [previewTemplate, setPreviewTemplate] =
    useState<DocumentTemplate | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<
    string | null
  >(null);

  // Project selection dialog state
  const [projectSelectOpen, setProjectSelectOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);
  const [selectedFilialeId, setSelectedFilialeId] = useState<string>("");
  const [selectedProjetId, setSelectedProjetId] = useState<string>("");
  const [projets, setProjets] = useState<Workspace[]>([]);
  const [loadingProjets, setLoadingProjets] = useState(false);
  const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);
  const { holding: _holding, filiales } = useHolding();

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
          docTemplateService.getSystemTemplates(),
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
    setSearchQuery("");
  }, [activeTab]);

  const filteredForms = formTemplates.filter((t) => {
    const matchesCategory =
      selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredDocs = docTemplates.filter((t) => {
    const matchesCategory =
      selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseFormTemplate = (template: Template) => {
    setPendingTemplate(template);
    setSelectedFilialeId("");
    setSelectedProjetId("");
    setProjets([]);
    setProjectSelectOpen(true);
  };

  const handleFilialeChange = async (filialeId: string) => {
    setSelectedFilialeId(filialeId);
    setSelectedProjetId("");
    setLoadingProjets(true);
    try {
      const data = await workspaceService.getWorkspaces(filialeId);
      setProjets(data);
    } catch (error) {
      console.error("Erreur chargement projets:", error);
      setProjets([]);
    } finally {
      setLoadingProjets(false);
    }
  };

  const handleConfirmTemplate = async () => {
    if (!pendingTemplate || !selectedProjetId) return;
    setCreatingFromTemplate(true);
    try {
      const formWithDetails = await formService.createFormFromTemplate(
        selectedProjetId,
        pendingTemplate
      );
      await templateService.incrementUseCount(pendingTemplate.id);
      setProjectSelectOpen(false);
      router.push(`/forms/${formWithDetails.id}/edit`);
    } catch (error) {
      console.error("Failed to use form template:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Impossible de créer le formulaire.",
      });
    } finally {
      setCreatingFromTemplate(false);
    }
  };

  const handlePreviewDocTemplate = async (template: DocumentTemplate) => {
    setIsGeneratingPreview(template.id);

    try {
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
          { id: "5", response_id: "preview", field_id: "N° CNI / Attestation d'identité", value_text: "C00123456", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "6", response_id: "preview", field_id: "Métier principal", value_text: "Plombier", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "7", response_id: "preview", field_id: "Années d'expérience", value_text: "10+ ans", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "8", response_id: "preview", field_id: "Catégorie A – Certifiés", value_text: "A1++ (10+ ans)", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "9", response_id: "preview", field_id: "Formation", value_text: "Formation en plomberie avancée", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "10", response_id: "preview", field_id: "Objet", value_text: "Prestation de plomberie", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "11", response_id: "preview", field_id: "Email", value_text: "john.doe@email.com", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
          { id: "12", response_id: "preview", field_id: "Téléphone principal", value_text: "+225 07 00 00 00", value_number: null, value_boolean: null, value_date: null, value_time: null, value_json: null, created_at: "" },
        ],
      };

      const blob = await generateDocumentPDF(
        template,
        template.name,
        [],
        mockResponse
      );

      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setPreviewTemplate(template);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        title: "Erreur de génération PDF",
        variant: "destructive",
        description: message,
      });
    } finally {
      setIsGeneratingPreview(null);
    }
  };

  const handleDownloadPreview = () => {
    if (!pdfBlobUrl || !previewTemplate) return;
    const link = document.createElement("a");
    link.href = pdfBlobUrl;
    link.download = `Apercu_${previewTemplate.name.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <PageShell className="animate-fade-in">
        <PageHeader
          eyebrow="Templates"
          title="Modèles"
          description="Choisissez un modèle pour démarrer"
        />
        {/* Tab skeleton */}
        <div className="flex gap-1 p-1 bg-[hsl(var(--muted))]/50 rounded-xl w-max">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        {/* Category skeleton */}
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-52 rounded-xl"
              style={{ animationDelay: `${i * 75}ms` }}
            />
          ))}
        </div>
      </PageShell>
    );
  }

  const currentCategories =
    activeTab === "forms" ? CATEGORIES : DOC_CATEGORIES;
  const currentCount =
    activeTab === "forms" ? filteredForms.length : filteredDocs.length;

  return (
    <PageShell className="animate-fade-in">
      <PageHeader
        eyebrow="Templates"
        title="Modèles"
        description="Parcourez la bibliothèque de modèles prêts à l'emploi"
        secondaryAction={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              placeholder="Rechercher un modèle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
            />
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[hsl(var(--muted))]/50 rounded-xl w-max backdrop-blur-sm">
        <button
          onClick={() => setActiveTab("forms")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === "forms"
              ? "bg-[hsl(var(--background))] text-[hsl(var(--primary))] shadow-md shadow-[hsl(var(--primary))]/10 ring-1 ring-[hsl(var(--border))]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))]/50"
          )}
        >
          <ClipboardList className="h-4 w-4" />
          Formulaires
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              activeTab === "forms"
                ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            )}
          >
            {formTemplates.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === "documents"
              ? "bg-[hsl(var(--background))] text-[hsl(var(--primary))] shadow-md shadow-[hsl(var(--primary))]/10 ring-1 ring-[hsl(var(--border))]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))]/50"
          )}
        >
          <FileDown className="h-4 w-4" />
          Documents PDF
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              activeTab === "documents"
                ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            )}
          >
            {docTemplates.length}
          </span>
        </button>
      </div>

      {/* Categories + count */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap animate-fade-in">
          {currentCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border",
                selectedCategory === cat
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-sm shadow-[hsl(var(--primary))]/20"
                  : "bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/30 hover:text-[hsl(var(--foreground))]"
              )}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] hidden sm:block">
          {currentCount} modèle{currentCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Form Templates Grid */}
      {activeTab === "forms" &&
        (filteredForms.length === 0 ? (
          <EmptyState
            icon={<LayoutGrid className="h-8 w-8" />}
            title="Aucun modèle trouvé"
            description={
              searchQuery
                ? `Aucun résultat pour « ${searchQuery} »`
                : "Aucun modèle de formulaire dans cette catégorie."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredForms.map((template, i) => (
              <Card
                key={template.id}
                className={cn(
                  "group relative overflow-hidden border hover:border-[hsl(var(--primary))]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/5 animate-fade-in-up",
                  `animate-stagger-${Math.min(i + 1, 6)}`
                )}
              >
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/60" />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] group-hover:scale-110 transition-transform duration-300">
                      <Layers className="h-5 w-5" />
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px] font-semibold border-0",
                        CATEGORY_COLORS[template.category] ||
                          "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                      )}
                    >
                      {CATEGORY_LABELS[template.category] ||
                        template.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-[15px] mb-1.5 line-clamp-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-4 min-h-[2.5rem]">
                    {template.description}
                  </p>
                  <Separator className="mb-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <Sparkles className="h-3 w-3" />
                      {template.use_count} utilisation
                      {template.use_count !== 1 ? "s" : ""}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUseFormTemplate(template)}
                      className="active-press hover-lift h-8 text-xs"
                    >
                      Utiliser
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}

      {/* Document PDF Templates Grid */}
      {activeTab === "documents" &&
        (filteredDocs.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="Aucun modèle trouvé"
            description={
              searchQuery
                ? `Aucun résultat pour « ${searchQuery} »`
                : "Aucun modèle de document dans cette catégorie."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((template, i) => (
              <Card
                key={template.id}
                className={cn(
                  "group relative overflow-hidden border hover:border-[hsl(var(--primary))]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/5 animate-fade-in-up flex flex-col",
                  `animate-stagger-${Math.min(i + 1, 6)}`
                )}
              >
                {/* Subtle gradient accent */}
                <div className="h-1 bg-gradient-to-r from-orange-500 via-rose-500 to-violet-500" />
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px] font-semibold border-0",
                        CATEGORY_COLORS[template.category] ||
                          "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                      )}
                    >
                      {CATEGORY_LABELS[template.category] ||
                        template.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-[15px] mb-1.5 line-clamp-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-4 min-h-[2.5rem]">
                    {template.description}
                  </p>
                  <div className="mt-auto">
                    <Separator className="mb-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                        <Sparkles className="h-3 w-3" />
                        {template.use_count} utilisation
                        {template.use_count !== 1 ? "s" : ""}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void handlePreviewDocTemplate(template)
                        }
                        disabled={isGeneratingPreview === template.id}
                        className="active-press h-8 text-xs hover:bg-[hsl(var(--primary))]/5 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))]/30"
                      >
                        {isGeneratingPreview === template.id ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <ScanEye className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Aperçu
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}

      {/* Dialog Preview PDF */}
      <PdfPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        pdfUrl={pdfBlobUrl}
        title={previewTemplate?.name || ""}
        subtitle="Aperçu du document avec données fictives"
        onDownload={handleDownloadPreview}
      />

      {/* Project Selection Dialog */}
      <Dialog open={projectSelectOpen} onOpenChange={setProjectSelectOpen}>
        <DialogContent className="animate-scale-in sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choisir un projet</DialogTitle>
            {pendingTemplate && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Modèle : {pendingTemplate.name}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Filiale</Label>
              <Select
                value={selectedFilialeId}
                onValueChange={(v) => void handleFilialeChange(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une filiale" />
                </SelectTrigger>
                <SelectContent>
                  {filiales.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedFilialeId && (
              <div className="space-y-2 animate-fade-in">
                <Label>Projet</Label>
                {loadingProjets ? (
                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des projets...
                  </div>
                ) : projets.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Aucun projet dans cette filiale.
                  </p>
                ) : (
                  <Select
                    value={selectedProjetId}
                    onValueChange={setSelectedProjetId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un projet" />
                    </SelectTrigger>
                    <SelectContent>
                      {projets.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProjectSelectOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={() => void handleConfirmTemplate()}
              disabled={!selectedProjetId || creatingFromTemplate}
              className="active-press"
            >
              {creatingFromTemplate && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Créer le formulaire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
