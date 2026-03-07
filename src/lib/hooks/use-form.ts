"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormPage, FormWithDetails } from "@/types/form";
import { FormField } from "@/types/field-types";
import { FormTheme } from "@/types/theme";

export function useForm(formId: string | null) {
  const [form, setForm] = useState<FormWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForm = useCallback(async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const [formResult, pagesResult, fieldsResult, themeResult] = await Promise.all([
      supabase.from("forms").select("*").eq("id", formId).single(),
      supabase
        .from("form_pages")
        .select("*")
        .eq("form_id", formId)
        .order("sort_order"),
      supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", formId)
        .order("sort_order"),
      supabase
        .from("form_themes")
        .select("*")
        .eq("form_id", formId)
        .maybeSingle(),
    ]);

    if (formResult.error) {
      setError(formResult.error.message);
      setLoading(false);
      return;
    }

    setForm({
      ...formResult.data,
      pages: (pagesResult.data || []) as FormPage[],
      fields: (fieldsResult.data || []) as FormField[],
      theme: themeResult.data as FormTheme | null,
    });
    setLoading(false);
  }, [formId]);

  useEffect(() => {
    void fetchForm();
  }, [fetchForm]);

  return { form, loading, error, refetch: fetchForm };
}
