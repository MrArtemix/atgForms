import { createClient } from "@/lib/supabase/client";
import { DocumentTemplate } from "@/types/document-template";

export const docTemplateService = {
    async getSystemTemplates(): Promise<DocumentTemplate[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("document_templates")
            .select("*")
            .eq("is_system", true)
            .order("category");

        if (error) throw error;
        return data || [];
    },

    async getTemplatesForForm(formId: string): Promise<DocumentTemplate[]> {
        const supabase = createClient();

        // Fetch form-specific and system templates separately to avoid SQL injection
        const [formTemplates, systemTemplates] = await Promise.all([
            supabase
                .from("document_templates")
                .select("*")
                .eq("form_id", formId)
                .order("name"),
            supabase
                .from("document_templates")
                .select("*")
                .eq("is_system", true)
                .order("name"),
        ]);

        if (formTemplates.error) throw formTemplates.error;
        if (systemTemplates.error) throw systemTemplates.error;

        // Deduplicate by id
        const seen = new Set<string>();
        const result: DocumentTemplate[] = [];
        for (const t of [...(formTemplates.data || []), ...(systemTemplates.data || [])]) {
            if (!seen.has(t.id)) {
                seen.add(t.id);
                result.push(t);
            }
        }
        return result;
    },

    async getAllTemplates(category?: string): Promise<DocumentTemplate[]> {
        const supabase = createClient();
        let query = supabase
            .from("document_templates")
            .select("*")
            .order("use_count", { ascending: false });

        if (category) {
            query = query.eq("category", category);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getTemplate(id: string): Promise<DocumentTemplate> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("document_templates")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    },

    async createTemplate(
        template: Omit<DocumentTemplate, "id" | "created_at" | "updated_at" | "use_count">
    ): Promise<DocumentTemplate> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("document_templates")
            .insert(template)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async incrementUseCount(templateId: string): Promise<void> {
        const supabase = createClient();
        // Atomic increment via RPC to avoid race conditions
        const { error } = await supabase.rpc("increment_use_count", {
            table_name: "document_templates",
            row_id: templateId,
        });

        // Fallback if RPC doesn't exist yet
        if (error) {
            const { data } = await supabase
                .from("document_templates")
                .select("use_count")
                .eq("id", templateId)
                .single();

            await supabase
                .from("document_templates")
                .update({ use_count: (data?.use_count || 0) + 1 })
                .eq("id", templateId);
        }
    },

    async deleteTemplate(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from("document_templates")
            .delete()
            .eq("id", id);
        if (error) throw error;
    },
};
