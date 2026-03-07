import { createClient } from "@/lib/supabase/client";
import { Template } from "@/types/form";

export const templateService = {
  async getTemplates(category?: string): Promise<Template[]> {
    const supabase = createClient();
    let query = supabase
      .from("templates")
      .select("*")
      .order("use_count", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getSystemTemplates(): Promise<Template[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("is_system", true)
      .order("category");

    if (error) throw error;
    return data || [];
  },

  async createTemplate(
    name: string,
    description: string,
    category: string,
    formDefinition: Template["form_definition"]
  ): Promise<Template> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("templates")
      .insert({
        name,
        description,
        category,
        form_definition: formDefinition,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async incrementUseCount(templateId: string): Promise<void> {
    const supabase = createClient();
    // Atomic increment via RPC to avoid race conditions
    const { error } = await supabase.rpc("increment_use_count", {
      table_name: "templates",
      row_id: templateId,
    });

    // Fallback if RPC doesn't exist yet
    if (error) {
      const { data } = await supabase
        .from("templates")
        .select("use_count")
        .eq("id", templateId)
        .single();

      await supabase
        .from("templates")
        .update({ use_count: (data?.use_count || 0) + 1 })
        .eq("id", templateId);
    }
  },
};
