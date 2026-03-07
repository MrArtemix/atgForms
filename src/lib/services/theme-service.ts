import { createClient } from "@/lib/supabase/client";
import { FormTheme } from "@/types/theme";

export const themeService = {
  async getSystemThemes(): Promise<FormTheme[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("form_themes")
      .select("*")
      .eq("is_system", true)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async getFormTheme(formId: string): Promise<FormTheme | null> {
    const supabase = createClient();
    const { data } = await supabase
      .from("form_themes")
      .select("*")
      .eq("form_id", formId)
      .maybeSingle();

    return data;
  },

  async saveFormTheme(formId: string, theme: Partial<FormTheme>): Promise<FormTheme> {
    const supabase = createClient();
    // Check if theme already exists
    const existing = await this.getFormTheme(formId);

    if (existing) {
      const { data, error } = await supabase
        .from("form_themes")
        .update({ ...theme, form_id: formId })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from("form_themes")
        .insert({ ...theme, form_id: formId, name: theme.name || "Custom" })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async applySystemTheme(formId: string, systemThemeId: string): Promise<FormTheme> {
    const supabase = createClient();
    const { data: systemTheme } = await supabase
      .from("form_themes")
      .select("*")
      .eq("id", systemThemeId)
      .single();

    if (!systemTheme) throw new Error("Theme not found");

    const { id: _id, form_id: _form_id, is_system: _is_system, created_at: _created_at, updated_at: _updated_at, ...themeProps } = systemTheme;

    return this.saveFormTheme(formId, { ...themeProps, is_system: false });
  },
};
