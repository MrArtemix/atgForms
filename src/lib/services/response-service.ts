import { createClient } from "@/lib/supabase/client";
import { FormResponse, ResponseAnswer, ResponseWithAnswers } from "@/types/response";
import { FieldValue } from "@/stores/form-renderer-store";
import { FormField } from "@/types/field-types";

export const responseService = {
  async submitResponse(
    formId: string,
    fields: FormField[],
    answers: Record<string, FieldValue>
  ): Promise<string> {
    const supabase = createClient();
    const processedAnswers: Record<string, FieldValue> = { ...answers };

    // Handle file uploads before sending JSON
    for (const field of fields) {
      const val = answers[field.id];
      if (Array.isArray(val) && val.length > 0 && typeof window !== 'undefined' && val[0] instanceof File) {
        const uploadedPaths: string[] = [];
        for (const file of val as File[]) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const filePath = `${formId}/${field.id}/${fileName}`;

          const { data, error } = await supabase.storage
            .from("response-uploads")
            .upload(filePath, file);

          if (error) {
            console.error("File upload error:", error);
            throw new Error(`Failed to upload file ${file.name}`);
          }
          if (data) {
            uploadedPaths.push(data.path);
          }
        }
        processedAnswers[field.id] = uploadedPaths;
      }
    }

    // Submit via API route
    const res = await fetch("/api/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formId, fields, answers: processedAnswers }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API response submission failed:", errorText);
      throw new Error(errorText || "Failed to submit response");
    }

    const data = await res.json();
    return data.responseId;
  },

  async getResponses(
    formId: string,
    page = 0,
    pageSize = 20,
    search?: string
  ): Promise<{ data: FormResponse[]; count: number }> {
    const supabase = createClient();

    // RLS will enforce access control — user must be workspace member
    let query = supabase
      .from("form_responses")
      .select("*", { count: "exact" })
      .eq("form_id", formId)
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (search) {
      // Sanitize search input to prevent filter injection
      const sanitized = search.replace(/[%_]/g, "");
      query = query.or(`respondent_email.ilike.%${sanitized}%,respondent_name.ilike.%${sanitized}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  async getResponseWithAnswers(responseId: string): Promise<ResponseWithAnswers> {
    const supabase = createClient();
    const [responseResult, answersResult] = await Promise.all([
      supabase.from("form_responses").select("*").eq("id", responseId).single(),
      supabase.from("response_answers").select("*").eq("response_id", responseId),
    ]);

    if (responseResult.error) throw responseResult.error;

    return {
      ...responseResult.data,
      answers: answersResult.data || [],
    };
  },

  async getAllResponsesWithAnswers(formId: string): Promise<ResponseWithAnswers[]> {
    const supabase = createClient();
    const { data: responses } = await supabase
      .from("form_responses")
      .select("*")
      .eq("form_id", formId)
      .order("created_at", { ascending: false });

    if (!responses || responses.length === 0) return [];

    const responseIds = responses.map((r) => r.id);
    const { data: answers } = await supabase
      .from("response_answers")
      .select("*")
      .in("response_id", responseIds);

    const answersMap = new Map<string, ResponseAnswer[]>();
    (answers || []).forEach((a) => {
      const existing = answersMap.get(a.response_id) || [];
      existing.push(a);
      answersMap.set(a.response_id, existing);
    });

    return responses.map((r) => ({
      ...r,
      answers: answersMap.get(r.id) || [],
    }));
  },

  async deleteResponse(responseId: string): Promise<void> {
    const supabase = createClient();

    // Verify user is authenticated — RLS will enforce workspace membership
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("form_responses")
      .delete()
      .eq("id", responseId);
    if (error) throw error;
  },
};
