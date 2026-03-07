"use client";

import { useEffect, useCallback, useMemo, useState as useLocalState } from "react";
import { useFormRendererStore, FieldValue } from "@/stores/form-renderer-store";
import { FormWithDetails } from "@/types/form";
import { FieldRegistry } from "@/components/builder/fields/field-registry";
import { validatePage } from "@/lib/utils/validation-rules";
import { computeVisibleFields } from "@/lib/utils/conditional-evaluator";
import { responseService } from "@/lib/services/response-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ChevronLeft, ChevronRight, Send, CheckCircle2, AlertCircle } from "lucide-react";
import type { FormTheme } from "@/types/theme";
import { cn } from "@/lib/utils/cn";
import { ErrorBoundary } from "@/components/common/error-boundary";

interface FormRendererProps {
  form: FormWithDetails;
}

function getThemeVars(theme: FormTheme | null): React.CSSProperties {
  if (!theme) return {};
  const style: Record<string, string> = {};
  if (theme.primary_color) style["--form-primary"] = theme.primary_color;
  if (theme.background_color) style["--form-bg"] = theme.background_color;
  if (theme.text_color) style["--form-text"] = theme.text_color;
  if (theme.accent_color) style["--form-accent"] = theme.accent_color;
  if (theme.success_color) style["--form-success"] = theme.success_color;
  if (theme.error_color) style["--form-error"] = theme.error_color;
  if (theme.border_radius != null) style["--form-radius"] = `${theme.border_radius}px`;
  if (theme.font_family) style["fontFamily"] = theme.font_family;
  if (theme.font_size_base != null) style["fontSize"] = `${theme.font_size_base}px`;
  if (theme.field_spacing != null) style["--form-field-spacing"] = `${theme.field_spacing}px`;
  return style as React.CSSProperties;
}

export type HeaderSource = {
  title: string;
  description: string | null;
  imageUrl: string | null;
  style: "default" | "image" | "gradient" | "pattern";
  pattern: "dots" | "grid" | "lines" | "waves" | "mesh" | "diagonal";
  height: "medium" | "large" | "hero";
};

function getHeaderFromForm(form: FormWithDetails): HeaderSource {
  const firstPage = form.pages.slice().sort((a, b) => a.sort_order - b.sort_order)[0];
  if (!firstPage) {
    return {
      title: form.title,
      description: form.description ?? null,
      imageUrl: form.header_image_url ?? null,
      style: "default",
      pattern: "dots",
      height: "large",
    };
  }
  const firstPageFields = form.fields
    .filter((f) => f.page_id === firstPage.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const headerField = firstPageFields.find((f) => f.type === "form_header");
  if (!headerField) {
    return {
      title: form.title,
      description: form.description ?? null,
      imageUrl: form.header_image_url ?? null,
      style: "default",
      pattern: "dots",
      height: "large",
    };
  }
  const cfg = headerField.field_config || {};
  const style = (cfg.header_style as HeaderSource["style"]) || "default";
  const imageUrl =
    style === "image" && cfg.header_image_url
      ? String(cfg.header_image_url).trim()
      : null;
  return {
    title: headerField.label || form.title,
    description: headerField.description ?? form.description ?? null,
    imageUrl: imageUrl || (form.header_image_url ?? null),
    style,
    pattern: (cfg.header_pattern as HeaderSource["pattern"]) || "dots",
    height: (cfg.header_height as HeaderSource["height"]) || "large",
  };
}

function getHeaderFieldId(form: FormWithDetails): string | null {
  const firstPage = form.pages.slice().sort((a, b) => a.sort_order - b.sort_order)[0];
  if (!firstPage) return null;
  const firstPageFields = form.fields
    .filter((f) => f.page_id === firstPage.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const headerField = firstPageFields.find((f) => f.type === "form_header");
  return headerField?.id ?? null;
}

const HEADER_HEIGHT_CLASSES = {
  medium: "h-40 sm:h-52",
  large: "h-52 sm:h-64 md:h-72",
  hero: "h-64 sm:h-80 md:h-96",
};

const HEADER_PATTERN_DATA: Record<string, string> = {
  dots: "bg-dots",
  grid: "bg-grid",
  lines: "bg-grid",
  waves: "bg-grid",
  mesh: "bg-dots",
  diagonal: "bg-dots",
};

function FormHeaderBlock({
  header,
  theme,
  themed,
}: {
  header: HeaderSource;
  theme: FormTheme | null;
  themed: boolean;
}) {
  const hasImage = Boolean(header.imageUrl);
  const patternClass = HEADER_PATTERN_DATA[header.pattern] ?? "bg-dots";
  const heightClass = HEADER_HEIGHT_CLASSES[header.height] ?? HEADER_HEIGHT_CLASSES.large;

  return (
    <div className="w-full flex flex-col overflow-hidden rounded-t-xl">
      {/* Top Image Section */}
      <div className={cn("relative w-full overflow-hidden shrink-0", heightClass)}>
        {hasImage ? (
          <div className="absolute inset-0 bg-[hsl(var(--muted))]">
            <img
              src={header.imageUrl!}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.18)] via-[hsl(var(--primary)/0.06)] to-[hsl(var(--primary)/0.22)]"
            )}
          >
            {(header.style === "pattern" || header.style === "default") && (
              <div className={cn("absolute inset-0 opacity-45", patternClass)} />
            )}
            <div className="pointer-events-none absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-[hsl(var(--primary)/0.25)] blur-3xl" />
          </div>
        )}
      </div>

      {/* Bottom Text Section */}
      <CardHeader className="bg-[#162447] text-white px-6 sm:px-8 py-6 sm:py-8">
        <div className="space-y-2 max-w-3xl">
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            {header.title}
          </CardTitle>
          {header.description && (
            <CardDescription className="text-sm sm:text-base md:text-lg leading-relaxed text-white/90">
              {header.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
    </div>
  );
}

export function FormRenderer({ form }: FormRendererProps) {
  const store = useFormRendererStore();
  const {
    pages,
    fields,
    currentPageIndex,
    answers,
    errors,
    visibleFields,
    isSubmitting,
    isSubmitted,
    initRenderer,
    setAnswer,
    setError,
    clearError,
    clearAllErrors,
    setVisibleFields,
    touchField,
    goToNextPage,
    goToPrevPage,
    setSubmitting,
    setSubmitted,
    getCurrentPageFields,
    getProgress,
  } = store;

  useEffect(() => {
    initRenderer(form.id, form.pages, form.fields);
  }, [form, initRenderer]);

  useEffect(() => {
    if (fields.length > 0) {
      const visible = computeVisibleFields(fields, answers);
      setVisibleFields(visible);
    }
  }, [answers, fields, setVisibleFields]);

  const currentPageFields = getCurrentPageFields();
  const currentPage = pages[currentPageIndex];
  const isLastPage = currentPageIndex === pages.length - 1;
  const isFirstPage = currentPageIndex === 0;
  const progress = getProgress();
  const theme = form.theme ?? null;
  const themeStyle = getThemeVars(theme);
  const maxWidth = theme?.page_max_width ?? 640;
  const themed = Boolean(theme);
  const [submitError, setSubmitError] = useLocalState<string | null>(null);
  const headerData = useMemo(() => getHeaderFromForm(form), [form]);
  const headerFieldId = useMemo(() => getHeaderFieldId(form), [form]);
  const fieldsToRender = useMemo(() => {
    if (!headerFieldId || !isFirstPage) return currentPageFields;
    return currentPageFields.filter((f) => f.id !== headerFieldId);
  }, [currentPageFields, isFirstPage, headerFieldId]);

  const handleFieldChange = useCallback(
    (fieldId: string, value: FieldValue) => {
      setAnswer(fieldId, value);
      clearError(fieldId);
      touchField(fieldId);
    },
    [setAnswer, clearError, touchField]
  );

  const validateCurrentPage = (): boolean => {
    const pageErrors = validatePage(currentPageFields, answers);
    clearAllErrors();
    Object.entries(pageErrors).forEach(([fieldId, error]) => {
      setError(fieldId, error);
    });
    return Object.keys(pageErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentPage()) {
      goToNextPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentPage()) return;

    setSubmitting(true);
    try {
      await responseService.submitResponse(form.id, fields, answers);
      setSubmitted();
    } catch (error: any) {
      console.error("Submit error details:", error);
      setSubmitError(error?.message || "Une erreur est survenue lors de la soumission.");
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    const successIconColor = theme?.success_color ?? "rgb(34 197 94)";
    const successBg = theme?.success_color
      ? `color-mix(in srgb, ${theme.success_color} 18%, transparent)`
      : undefined;
    return (
      <div
        className={`mx-auto w-full ${themed ? "form-renderer-root form-renderer-themed" : ""}`}
        style={{ maxWidth: `${maxWidth}px`, ...themeStyle }}
      >
        <Card className="form-page-card overflow-hidden border-emerald-200 dark:border-emerald-800/50">
          <CardContent className="pt-12 pb-12 px-8 text-center bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent">
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ring-4 ring-emerald-200/60 dark:ring-emerald-800/30"
              style={themed && successBg ? { backgroundColor: successBg } : undefined}
            >
              <CheckCircle2
                className={!themed ? "h-10 w-10 text-emerald-600 dark:text-emerald-400" : "h-10 w-10"}
                style={themed ? { color: successIconColor } : undefined}
              />
            </div>
            <h2 className="text-2xl font-semibold mb-3" style={themed ? { color: theme?.text_color } : undefined}>
              Merci !
            </h2>
            <p className={`max-w-sm mx-auto leading-relaxed ${!themed ? "text-[hsl(var(--muted-foreground))]" : ""} opacity-80`} style={themed ? { color: theme?.text_color } : undefined}>
              {form.settings?.confirmation_message ||
                "Votre réponse a bien été enregistrée."}
            </p>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-6">
          Propulsé par ATGForm
        </p>
      </div>
    );
  }

  return (
    <div
      className={`form-renderer-root mx-auto w-full ${themed ? "form-renderer-themed" : ""}`}
      style={{ maxWidth: `${maxWidth}px`, ...themeStyle }}
    >
      <Card className="form-page-card overflow-hidden">
        {/* En-tête personnalisable (champ form_header ou défaut formulaire) */}
        <FormHeaderBlock header={headerData} theme={theme} themed={themed} />

        {/* Progress */}
        {form.settings?.show_progress_bar && pages.length > 1 && (
          <div className="px-6 sm:px-8 pb-6">
            <div className="h-2.5 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${themed ? "form-progress-fill" : "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
              Étape <span className={`font-medium ${themed ? "form-step-number" : "text-[hsl(var(--primary))]"}`}>{currentPageIndex + 1}</span> sur {pages.length}
            </p>
          </div>
        )}

        <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
          {/* Page title (multi-page) */}
          {pages.length > 1 && currentPage && (
            <div className="form-page-title-block pb-3 px-3 -mx-1 rounded-lg border-l-4 border-l-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5">
              <h3 className="text-lg font-medium" style={themed ? { color: theme?.text_color } : undefined}>
                {currentPage.title}
              </h3>
              {currentPage.description && (
                <p className="text-sm mt-1 opacity-90" style={themed ? { color: theme?.text_color } : undefined}>
                  {currentPage.description}
                </p>
              )}
            </div>
          )}

          {/* Fields */}
          <div className="space-y-6" style={themed && theme?.field_spacing != null ? { gap: `${theme.field_spacing}px` } : undefined}>
            {fieldsToRender.map((field) => {
              const FieldComponent = FieldRegistry[field.type];
              if (!FieldComponent) return null;

              return (
                <ErrorBoundary key={field.id}>
                  <div className="form-field-group">
                    <FieldComponent
                      field={field}
                      mode="renderer"
                      value={answers[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      error={errors[field.id]}
                    />
                  </div>
                </ErrorBoundary>
              );
            })}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-[hsl(var(--border))]">
            <div>
              {!isFirstPage && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPrevPage}
                  className="min-w-[120px]"
                  data-theme-outline={themed ? "" : undefined}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
              )}
            </div>
            <div>
              {isLastPage ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="min-w-[140px]"
                  data-theme-primary={themed ? "" : undefined}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Envoyer
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="min-w-[120px]"
                  data-theme-primary={themed ? "" : undefined}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-6">
        Propulsé par ATGForm
      </p>
    </div>
  );
}
