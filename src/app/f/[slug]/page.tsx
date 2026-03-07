import { createClient } from "@/lib/supabase/server";
import { FormRenderer } from "@/components/renderer/form-renderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: form } = await supabase
    .from("forms")
    .select("title, description")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return {
    title: form?.title || "Form",
    description: form?.description || "Fill out this form",
  };
}

export default async function PublicFormPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!form) notFound();

  // Check scheduling
  const now = new Date();
  if (form.scheduled_open_at && new Date(form.scheduled_open_at) > now) {
    return (
      <div className="form-page-wrap flex items-center justify-center p-6">
        <div className="form-page-card max-w-md w-full p-8 text-center border-amber-200/60 dark:border-amber-800/40">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 ring-2 ring-amber-200/80 dark:ring-amber-800/40">
            <svg className="h-7 w-7 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">Formulaire bientôt disponible</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Ce formulaire ouvrira prochainement.</p>
        </div>
      </div>
    );
  }

  if (form.scheduled_close_at && new Date(form.scheduled_close_at) < now) {
    return (
      <div className="form-page-wrap flex items-center justify-center p-6">
        <div className="form-page-card max-w-md w-full p-8 text-center border-[hsl(var(--border))]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--muted))] ring-2 ring-[hsl(var(--border))]">
            <svg className="h-7 w-7 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">Formulaire fermé</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{form.settings?.close_message || "Ce formulaire n'accepte plus de réponses."}</p>
        </div>
      </div>
    );
  }

  if (form.settings?.limit_responses && form.response_count >= form.settings.limit_responses) {
    return (
      <div className="form-page-wrap flex items-center justify-center p-6">
        <div className="form-page-card max-w-md w-full p-8 text-center border-[hsl(var(--border))]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--muted))] ring-2 ring-[hsl(var(--border))]">
            <svg className="h-7 w-7 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">Formulaire fermé</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Le nombre maximum de réponses a été atteint.</p>
        </div>
      </div>
    );
  }

  // Load full form data
  const [pagesResult, fieldsResult, themeResult] = await Promise.all([
    supabase.from("form_pages").select("*").eq("form_id", form.id).order("sort_order"),
    supabase.from("form_fields").select("*").eq("form_id", form.id).order("sort_order"),
    supabase.from("form_themes").select("*").eq("form_id", form.id).maybeSingle(),
  ]);

  const fullForm = {
    ...form,
    pages: pagesResult.data || [],
    fields: fieldsResult.data || [],
    theme: themeResult.data || null,
  };

  const theme = fullForm.theme as
    | { background_pattern?: string; primary_color?: string; custom_css?: string }
    | null;
  const pattern =
    theme?.background_pattern && theme.background_pattern !== "none"
      ? theme.background_pattern
      : null;
  const customCss = theme?.custom_css?.trim();

  return (
    <div
      className="form-page-wrap py-10 sm:py-14 px-4 sm:px-6 flex justify-center"
      {...(pattern && {
        "data-pattern": pattern,
        ...(theme?.primary_color && {
          style: { ["--form-pattern-color" as string]: theme.primary_color },
        }),
      })}
    >
      {customCss ? (
        <style dangerouslySetInnerHTML={{ __html: customCss }} />
      ) : null}
      <FormRenderer form={fullForm} />
    </div>
  );
}
