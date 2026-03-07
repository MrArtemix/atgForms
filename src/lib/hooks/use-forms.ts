"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Form } from "@/types/form";

export function useForms(workspaceId?: string) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("forms")
      .select("*")
      .order("updated_at", { ascending: false });

    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }

    const { data } = await query;
    setForms(data || []);
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    void fetchForms();
  }, [fetchForms]);

  return { forms, loading, refetch: fetchForms };
}
