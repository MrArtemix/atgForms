import { createClient } from "@/lib/supabase/client";
import { Form, FormPage, FormSettings, FormStatus, FormWithDetails, Template } from "@/types/form";
import { FormField } from "@/types/field-types";
import { FormTheme } from "@/types/theme";
import { generateFormSlug } from "@/lib/utils/slugify";

// Helper: get a supabase client with a verified fresh session
async function getAuthenticatedClient() {
  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error("Not authenticated — no active session");
  }
  return { supabase, user: session.user };
}

export const formService = {
  async createFormFromTemplate(
    workspaceId: string,
    template: Template
  ): Promise<FormWithDetails> {
    const { supabase, user } = await getAuthenticatedClient();

    // 1) Créer le formulaire de base
    const { data: form, error: formError } = await supabase
      .from("forms")
      .insert({
        workspace_id: workspaceId,
        created_by: user.id,
        title: template.name,
        description: template.description,
        slug: generateFormSlug(template.name),
      })
      .select()
      .single();

    if (formError || !form) throw formError;

    const def: any = template.form_definition || {};
    const pagesDef: any[] =
      Array.isArray(def.pages) && def.pages.length > 0
        ? def.pages
        : [{ title: "Page 1", sort_order: 0 }];

    // 2) Insérer les pages
    const { data: createdPages, error: pagesError } = await supabase
      .from("form_pages")
      .insert(
        pagesDef.map((p, index) => ({
          form_id: form.id,
          title: p.title ?? `Page ${index + 1}`,
          description: p.description ?? null,
          sort_order: typeof p.sort_order === "number" ? p.sort_order : index,
        }))
      )
      .select();

    if (pagesError) throw pagesError;

    const pages = (createdPages || []).sort(
      (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );

    const firstPageId = pages[0]?.id as string | undefined;

    // Map des index de page (0,1,2,...) vers les IDs créés,
    // pour permettre au template de préciser un `page_index` par champ.
    const pageIdByIndex = new Map<number, string>();
    pages.forEach((p: any, index: number) => {
      const idx = typeof p.sort_order === "number" ? p.sort_order : index;
      if (!pageIdByIndex.has(idx)) {
        pageIdByIndex.set(idx, p.id as string);
      }
    });

    // 3) Insérer les champs
    const fieldsDef: any[] = Array.isArray(def.fields) ? def.fields : [];
    if (fieldsDef.length > 0 && firstPageId) {
      const fieldsToInsert = fieldsDef.map((field, index) => ({
        form_id: form.id,
        // Si le template fournit un `page_index`, on le respecte.
        // Sinon, on place le champ sur la première page.
        page_id:
          pageIdByIndex.get(
            typeof field.page_index === "number" ? field.page_index : 0
          ) ?? firstPageId,
        type: field.type,
        label: field.label ?? "",
        description: field.description ?? null,
        placeholder: field.placeholder ?? null,
        required: field.required ?? false,
        sort_order:
          typeof field.sort_order === "number" ? field.sort_order : index,
        validation_rules: field.validation_rules ?? {},
        options: field.options ?? [],
        field_config: field.field_config ?? {},
        conditional_logic: field.conditional_logic ?? null,
      }));

      const { error: fieldsError } = await supabase
        .from("form_fields")
        .insert(fieldsToInsert);
      if (fieldsError) throw fieldsError;
    }

    // 4) Thème éventuel
    const themeDef: Partial<FormTheme> | null = (def.theme as any) || null;
    if (themeDef) {
      const { name, is_system, ...restTheme } = themeDef as any;
      await supabase.from("form_themes").insert({
        form_id: form.id,
        name: name || template.name,
        is_system: false,
        ...restTheme,
      });
    }

    // 5) Retourner le formulaire complet
    const [pagesResult, fieldsResult, themeResult] = await Promise.all([
      supabase
        .from("form_pages")
        .select("*")
        .eq("form_id", form.id)
        .order("sort_order"),
      supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", form.id)
        .order("sort_order"),
      supabase
        .from("form_themes")
        .select("*")
        .eq("form_id", form.id)
        .maybeSingle(),
    ]);

    return {
      ...(form as Form),
      pages: (pagesResult.data || []) as FormPage[],
      fields: (fieldsResult.data || []) as any,
      theme: (themeResult.data || null) as FormTheme | null,
    };
  },

  async createForm(workspaceId: string, title: string = "Untitled Form"): Promise<Form> {
    const { supabase, user } = await getAuthenticatedClient();

    const { data: form, error } = await supabase
      .from("forms")
      .insert({
        workspace_id: workspaceId,
        created_by: user.id,
        title,
        slug: generateFormSlug(title),
      })
      .select()
      .single();

    if (error) throw error;

    // Create default first page
    await supabase.from("form_pages").insert({
      form_id: form.id,
      title: "Page 1",
      sort_order: 0,
    });

    return form;
  },

  async getForm(formId: string): Promise<FormWithDetails> {
    const { supabase } = await getAuthenticatedClient();
    const [formResult, pagesResult, fieldsResult, themeResult] = await Promise.all([
      supabase.from("forms").select("*").eq("id", formId).single(),
      supabase.from("form_pages").select("*").eq("form_id", formId).order("sort_order"),
      supabase.from("form_fields").select("*").eq("form_id", formId).order("sort_order"),
      supabase.from("form_themes").select("*").eq("form_id", formId).maybeSingle(),
    ]);

    if (formResult.error) throw formResult.error;

    return {
      ...formResult.data,
      pages: pagesResult.data || [],
      fields: fieldsResult.data || [],
      theme: themeResult.data,
    };
  },

  async getFormBySlug(slug: string): Promise<FormWithDetails | null> {
    const supabase = createClient();
    const { data: form } = await supabase
      .from("forms")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (!form) return null;

    const [pagesResult, fieldsResult, themeResult] = await Promise.all([
      supabase.from("form_pages").select("*").eq("form_id", form.id).order("sort_order"),
      supabase.from("form_fields").select("*").eq("form_id", form.id).order("sort_order"),
      supabase.from("form_themes").select("*").eq("form_id", form.id).maybeSingle(),
    ]);

    return {
      ...form,
      pages: pagesResult.data || [],
      fields: fieldsResult.data || [],
      theme: themeResult.data,
    };
  },

  async updateForm(formId: string, updates: Partial<Form>): Promise<Form> {
    const { supabase } = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from("forms")
      .update(updates)
      .eq("id", formId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFormSettings(formId: string, settings: Partial<FormSettings>): Promise<void> {
    const { supabase } = await getAuthenticatedClient();
    const { data: form } = await supabase.from("forms").select("settings").eq("id", formId).single();
    const { error } = await supabase
      .from("forms")
      .update({ settings: { ...form?.settings, ...settings } })
      .eq("id", formId);
    if (error) throw error;
  },

  async publishForm(formId: string): Promise<Form> {
    const { supabase } = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from("forms")
      .update({ status: "published" as FormStatus })
      .eq("id", formId)
      .select()
      .single();
    if (error) throw error;
    return data as Form;
  },

  async closeForm(formId: string): Promise<void> {
    const { supabase } = await getAuthenticatedClient();
    const { error } = await supabase
      .from("forms")
      .update({ status: "closed" as FormStatus })
      .eq("id", formId);
    if (error) throw error;
  },

  async deleteForm(formId: string): Promise<void> {
    const { supabase } = await getAuthenticatedClient();
    const { error } = await supabase.from("forms").delete().eq("id", formId);
    if (error) throw error;
  },

  async duplicateForm(formId: string): Promise<string> {
    const { supabase } = await getAuthenticatedClient();
    const { data, error } = await supabase.rpc("duplicate_form", {
      source_form_id: formId,
    });
    if (error) throw error;
    return data;
  },

  // Pages
  async savePagesAndFields(
    formId: string,
    pages: FormPage[],
    fields: Record<string, FormField>,
    fieldOrder: Record<string, string[]>
  ): Promise<void> {
    const { supabase } = await getAuthenticatedClient();
    // Upsert pages
    const pagesToSave = pages.map((p, i) => ({
      id: p.id,
      form_id: formId,
      title: p.title,
      description: p.description,
      sort_order: i,
    }));

    const { error: pagesError } = await supabase.from("form_pages").upsert(pagesToSave);
    if (pagesError) throw pagesError;

    // Get existing field IDs to determine deletes
    const { data: existingFields } = await supabase
      .from("form_fields")
      .select("id")
      .eq("form_id", formId);

    const currentFieldIds = new Set(Object.keys(fields));
    const existingIds = new Set((existingFields || []).map((f) => f.id));

    // Delete removed fields
    const toDelete = [...existingIds].filter((id) => !currentFieldIds.has(id));
    if (toDelete.length > 0) {
      await supabase.from("form_fields").delete().in("id", toDelete);
    }

    // Upsert fields with correct sort_order
    const fieldsToSave: Partial<FormField>[] = [];
    Object.entries(fieldOrder).forEach(([pageId, orderIds]) => {
      orderIds.forEach((fieldId, index) => {
        const field = fields[fieldId];
        if (field) {
          fieldsToSave.push({
            id: field.id,
            form_id: formId,
            page_id: pageId,
            type: field.type,
            label: field.label,
            description: field.description,
            placeholder: field.placeholder,
            required: field.required,
            sort_order: index,
            validation_rules: field.validation_rules,
            options: field.options as any,
            field_config: field.field_config,
            conditional_logic: field.conditional_logic as any,
          });
        }
      });
    });

    if (fieldsToSave.length > 0) {
      const { error: fieldsError } = await supabase.from("form_fields").upsert(fieldsToSave as any);
      if (fieldsError) throw fieldsError;
    }
  },

  async checkSlugAvailability(slug: string, excludeFormId?: string): Promise<boolean> {
    const { supabase } = await getAuthenticatedClient();
    let query = supabase.from("forms").select("id").eq("slug", slug);
    if (excludeFormId) {
      query = query.neq("id", excludeFormId);
    }
    const { data } = await query;
    return !data || data.length === 0;
  },
};
