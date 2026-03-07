import { createClient } from "@/lib/supabase/server";
import { FormRenderer } from "@/components/renderer/form-renderer";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EmbedFormPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!form) notFound();

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
      className="form-page-wrap p-4"
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
