"use client";

import { useState, useEffect } from "react";
import { ResponseWithAnswers } from "@/types/response";
import { FormField } from "@/types/field-types";
import { DocumentTemplate } from "@/types/document-template";
import { docTemplateService } from "@/lib/services/doc-template-service";
import { generateDocumentPDF } from "@/lib/utils/pdf-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/utils/date";
import { FileDown, FileText, Loader2, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

interface ResponseDetailProps {
  response: ResponseWithAnswers;
  fields: FormField[];
  formId?: string;
  formTitle?: string;
}

function getDisplayValue(
  answer: ResponseWithAnswers["answers"][number]
): string {
  if (answer.value_text) return answer.value_text;
  if (answer.value_number !== null && answer.value_number !== undefined)
    return String(answer.value_number);
  if (answer.value_boolean !== null && answer.value_boolean !== undefined)
    return answer.value_boolean ? "Yes" : "No";
  if (answer.value_date) return answer.value_date;
  if (answer.value_time) return answer.value_time;
  if (answer.value_json) {
    if (Array.isArray(answer.value_json))
      return (answer.value_json as string[]).join(", ");
    return JSON.stringify(answer.value_json);
  }
  return "-";
}

export function ResponseDetail({ response, fields, formId, formTitle }: ResponseDetailProps) {
  const [docTemplates, setDocTemplates] = useState<DocumentTemplate[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (formId) {
      docTemplateService.getTemplatesForForm(formId).then(setDocTemplates).catch(console.error);
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

      // Increment use count
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Response Details</CardTitle>
            <Badge
              variant={response.is_complete ? "default" : "secondary"}
            >
              {response.is_complete ? "Complete" : "Incomplete"}
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
                {docTemplates.map(template => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleGeneratePdf(template)}
                    disabled={isGenerating !== null}
                    className="cursor-pointer"
                  >
                    {isGenerating === template.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{template.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Submitted {formatDateTime(response.created_at)}
        </p>
        {response.respondent_email && (
          <p className="text-sm text-muted-foreground">
            {response.respondent_email}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => {
          if (["section_header", "paragraph_text"].includes(field.type))
            return null;

          const answer = response.answers.find(
            (a) => a.field_id === field.id
          );

          const displayValue = answer ? getDisplayValue(answer) : "-";
          const isSignature =
            field.type === "signature" ||
            (typeof displayValue === "string" && displayValue.startsWith("data:image/"));

          return (
            <div key={field.id} className="space-y-1">
              <p className="text-sm font-medium">{field.label}</p>
              {isSignature && displayValue !== "-" ? (
                <div className="border rounded-lg p-2 bg-muted/20 inline-block">
                  <img
                    src={displayValue}
                    alt={`Signature: ${field.label}`}
                    className="max-h-32 w-auto object-contain"
                  />
                </div>
              ) : field.type === "image_upload" && Array.isArray(answer?.value_json) && answer.value_json.length > 0 ? (
                <div className="flex flex-wrap gap-4 mt-2">
                  {(answer.value_json as string[]).map((path, i) => {
                    const supabase = createClient();
                    const { data } = supabase.storage.from("response-uploads").getPublicUrl(path);
                    return (
                      <div key={i} className="relative group border rounded-lg overflow-hidden h-32 w-32 bg-muted/20 flex items-center justify-center">
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
              ) : field.type === "file_upload" && Array.isArray(answer?.value_json) && answer.value_json.length > 0 ? (
                <div className="flex flex-col gap-2 mt-2">
                  {(answer.value_json as string[]).map((path, i) => {
                    const supabase = createClient();
                    const { data } = supabase.storage.from("response-uploads").getPublicUrl(path);
                    const filename = path.split('/').pop() || `File ${i + 1}`;
                    return (
                      <a
                        key={i}
                        href={data.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline border rounded-md p-2 w-fit bg-muted/10"
                      >
                        <Download className="h-4 w-4" />
                        {filename}
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {displayValue}
                </p>
              )}
              <Separator />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
