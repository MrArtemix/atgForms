"use client";

import { useState, useEffect, useMemo } from "react";
import { ResponseWithAnswers, ResponseAnswer } from "@/types/response";
import { FormField } from "@/types/field-types";
import { FormPage } from "@/types/form";
import { DocumentTemplate } from "@/types/document-template";
import { docTemplateService } from "@/lib/services/doc-template-service";
import { generateDocumentPDF } from "@/lib/utils/pdf-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/utils/date";
import {
  FileDown,
  FileText,
  Loader2,
  Download,
  ExternalLink,
  Type,
  Hash,
  Mail,
  Phone,
  Link2,
  Calendar,
  Clock,
  Palette,
  List,
  CheckSquare,
  ChevronDown,
  Star,
  Grid3X3,
  Gauge,
  ToggleLeft,
  ImageIcon,
  Upload,
  PenTool,
  FileUp,
  AlignLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

interface ResponseDetailProps {
  response: ResponseWithAnswers;
  fields: FormField[];
  pages?: FormPage[];
  formId?: string;
  formTitle?: string;
}

const fieldTypeIcons: Record<string, React.ReactNode> = {
  short_text: <Type className="h-4 w-4" />,
  long_text: <AlignLeft className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  url: <Link2 className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  time: <Clock className="h-4 w-4" />,
  datetime: <Calendar className="h-4 w-4" />,
  color: <Palette className="h-4 w-4" />,
  single_choice: <List className="h-4 w-4" />,
  multiple_choice: <CheckSquare className="h-4 w-4" />,
  dropdown: <ChevronDown className="h-4 w-4" />,
  rating: <Star className="h-4 w-4" />,
  linear_scale: <Gauge className="h-4 w-4" />,
  matrix: <Grid3X3 className="h-4 w-4" />,
  nps: <Gauge className="h-4 w-4" />,
  yes_no: <ToggleLeft className="h-4 w-4" />,
  image_choice: <ImageIcon className="h-4 w-4" />,
  file_upload: <FileUp className="h-4 w-4" />,
  image_upload: <Upload className="h-4 w-4" />,
  signature: <PenTool className="h-4 w-4" />,
  consent_checkbox: <CheckSquare className="h-4 w-4" />,
  hidden: <Hash className="h-4 w-4" />,
};

function getDisplayValue(answer: ResponseAnswer): string {
  if (answer.value_text) return answer.value_text;
  if (answer.value_number !== null && answer.value_number !== undefined)
    return String(answer.value_number);
  if (answer.value_boolean !== null && answer.value_boolean !== undefined)
    return answer.value_boolean ? "Oui" : "Non";
  if (answer.value_date) return answer.value_date;
  if (answer.value_time) return answer.value_time;
  if (answer.value_json) {
    if (Array.isArray(answer.value_json))
      return (answer.value_json as string[]).join(", ");
    return JSON.stringify(answer.value_json);
  }
  return "-";
}

function AnswerRow({
  field,
  answer,
  index,
  supabase,
}: {
  field: FormField;
  answer: ResponseAnswer | undefined;
  index: number;
  supabase: ReturnType<typeof createClient>;
}) {
  const displayValue = answer ? getDisplayValue(answer) : "-";
  const isSignature =
    field.type === "signature" ||
    (typeof displayValue === "string" && displayValue.startsWith("data:image/"));
  const icon = fieldTypeIcons[field.type] || <FileText className="h-4 w-4" />;

  const renderValue = () => {
    // Rating: filled/empty stars
    if (field.type === "rating" && answer?.value_number != null) {
      const max = field.field_config?.rating_max || 5;
      const val = answer.value_number;
      return (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: max }, (_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < val
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-[hsl(var(--muted-foreground))]/30"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-[hsl(var(--muted-foreground))]">
            {val}/{max}
          </span>
        </div>
      );
    }

    // Boolean / Yes-No
    if (
      (field.type === "yes_no" || field.type === "consent_checkbox") &&
      answer?.value_boolean != null
    ) {
      return (
        <Badge variant={answer.value_boolean ? "success" : "warning"}>
          {answer.value_boolean ? "Oui" : "Non"}
        </Badge>
      );
    }

    // Multiselect (value_json array)
    if (
      Array.isArray(answer?.value_json) &&
      answer!.value_json.length > 0 &&
      typeof (answer!.value_json as unknown[])[0] === "string" &&
      !(answer!.value_json as string[])[0].includes("/")
    ) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {(answer!.value_json as string[]).map((val, i) => (
            <Badge key={i} variant="secondary">
              {val}
            </Badge>
          ))}
        </div>
      );
    }

    // Signature
    if (isSignature && displayValue !== "-") {
      return (
        <div className="border rounded-lg p-2 bg-[hsl(var(--muted))]/20 inline-block">
          <img
            src={displayValue}
            alt={`Signature: ${field.label}`}
            className="max-h-32 w-auto object-contain"
          />
        </div>
      );
    }

    // Image upload
    if (
      field.type === "image_upload" &&
      Array.isArray(answer?.value_json) &&
      answer!.value_json.length > 0
    ) {
      return (
        <div className="flex flex-wrap gap-4 mt-1">
          {(answer!.value_json as string[]).map((path, i) => {
            const { data } = supabase.storage
              .from("response-uploads")
              .getPublicUrl(path);
            return (
              <div
                key={i}
                className="relative group border rounded-lg overflow-hidden h-32 w-32 bg-[hsl(var(--muted))]/20 flex items-center justify-center"
              >
                <img
                  src={data.publicUrl}
                  alt={`Upload ${i + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
                <a
                  href={data.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <ExternalLink className="h-6 w-6 text-white" />
                </a>
              </div>
            );
          })}
        </div>
      );
    }

    // File upload
    if (
      field.type === "file_upload" &&
      Array.isArray(answer?.value_json) &&
      answer!.value_json.length > 0
    ) {
      return (
        <div className="flex flex-col gap-2 mt-1">
          {(answer!.value_json as string[]).map((path, i) => {
            const { data } = supabase.storage
              .from("response-uploads")
              .getPublicUrl(path);
            const filename = path.split("/").pop() || `Fichier ${i + 1}`;
            return (
              <a
                key={i}
                href={data.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-[hsl(var(--primary))] hover:underline border rounded-md p-2 w-fit bg-[hsl(var(--muted))]/10"
              >
                <Download className="h-4 w-4" />
                {filename}
              </a>
            );
          })}
        </div>
      );
    }

    // Default text
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        {displayValue}
      </p>
    );
  };

  return (
    <div
      className="rounded-lg border border-[hsl(var(--border))] p-4 hover:bg-[hsl(var(--muted))]/30 transition-colors duration-150 animate-fade-in-up"
      style={{
        animationDelay: index < 6 ? `${index * 50}ms` : undefined,
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))]/50 text-[hsl(var(--muted-foreground))]">
          {icon}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm font-semibold">{field.label}</p>
          {field.description && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {field.description}
            </p>
          )}
          <div className="mt-1">{renderValue()}</div>
        </div>
      </div>
    </div>
  );
}

export function ResponseDetail({
  response,
  fields,
  pages,
  formId,
  formTitle,
}: ResponseDetailProps) {
  const [docTemplates, setDocTemplates] = useState<DocumentTemplate[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (formId) {
      docTemplateService
        .getTemplatesForForm(formId)
        .then(setDocTemplates)
        .catch(console.error);
    }
  }, [formId]);

  const handleGeneratePdf = async (template: DocumentTemplate) => {
    setIsGenerating(template.id);
    try {
      const blob = await generateDocumentPDF(
        template,
        formTitle || "Document",
        fields,
        response
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${template.name}_${response.id.split("-")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      docTemplateService.incrementUseCount(template.id).catch(console.error);
      toast({
        title: "Succès",
        description: "PDF généré avec succès",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Erreur lors de la génération du PDF",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  // Filter display fields (exclude layout elements)
  const displayFields = useMemo(
    () =>
      fields.filter(
        (f) =>
          !["section_header", "paragraph_text", "divider", "spacer", "form_header"].includes(
            f.type
          )
      ),
    [fields]
  );

  // Group fields by page
  const fieldsByPage = useMemo(() => {
    const grouped = new Map<string, FormField[]>();
    for (const field of displayFields) {
      const pageId = field.page_id;
      if (!grouped.has(pageId)) grouped.set(pageId, []);
      grouped.get(pageId)!.push(field);
    }
    return grouped;
  }, [displayFields]);

  const isMultiPage = pages && pages.length > 1;

  const renderFieldsList = (fieldsToRender: FormField[]) => (
    <div className="space-y-3">
      {fieldsToRender.map((field, i) => {
        const answer = response.answers.find((a) => a.field_id === field.id);
        return (
          <AnswerRow
            key={field.id}
            field={field}
            answer={answer}
            index={i}
            supabase={supabase}
          />
        );
      })}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Détails de la réponse</CardTitle>
            <Badge
              variant={response.is_complete ? "success" : "warning"}
            >
              {response.is_complete ? "Complète" : "Incomplète"}
            </Badge>
          </div>

          {docTemplates.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <FileDown className="h-4 w-4 mr-2" />
                  Générer PDF
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {docTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => void handleGeneratePdf(template)}
                    disabled={isGenerating !== null}
                    className="cursor-pointer"
                  >
                    {isGenerating === template.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-[hsl(var(--muted-foreground))]" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2 text-[hsl(var(--muted-foreground))]" />
                    )}
                    <span className="flex-1 truncate">{template.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Soumis le {formatDateTime(response.created_at)}
        </p>
        {response.respondent_email && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {response.respondent_email}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isMultiPage ? (
          <Tabs defaultValue={pages[0].id} className="w-full">
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              {pages
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((page) => (
                  <TabsTrigger key={page.id} value={page.id}>
                    {page.title || `Page ${page.sort_order + 1}`}
                  </TabsTrigger>
                ))}
            </TabsList>
            {pages
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((page) => (
                <TabsContent key={page.id} value={page.id}>
                  {page.description && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                      {page.description}
                    </p>
                  )}
                  {renderFieldsList(fieldsByPage.get(page.id) || [])}
                </TabsContent>
              ))}
          </Tabs>
        ) : (
          renderFieldsList(displayFields)
        )}
      </CardContent>
    </Card>
  );
}
