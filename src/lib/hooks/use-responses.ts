"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormResponse, ResponseWithAnswers, FormAnalytics } from "@/types/response";

export function useResponses(formId: string | null) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const fetchResponses = useCallback(
    async (page = 0, pageSize = 20) => {
      if (!formId) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, count: totalCount } = await supabase
        .from("form_responses")
        .select("*", { count: "exact" })
        .eq("form_id", formId)
        .order("created_at", { ascending: false })
        .range(from, to);

      setResponses(data || []);
      setCount(totalCount || 0);
      setLoading(false);
    },
    [formId]
  );

  useEffect(() => {
    void fetchResponses();
  }, [fetchResponses]);

  return { responses, count, loading, refetch: fetchResponses };
}

export function useResponse(responseId: string | null) {
  const [response, setResponse] = useState<ResponseWithAnswers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!responseId) {
      setLoading(false);
      return;
    }

    async function fetch() {
      const supabase = createClient();
      const [responseResult, answersResult] = await Promise.all([
        supabase.from("form_responses").select("*").eq("id", responseId).single(),
        supabase
          .from("response_answers")
          .select("*")
          .eq("response_id", responseId),
      ]);

      if (responseResult.data) {
        setResponse({
          ...responseResult.data,
          answers: answersResult.data || [],
        });
      }
      setLoading(false);
    }

    void fetch();
  }, [responseId]);

  return { response, loading };
}

export function useFormAnalytics(formId: string | null) {
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formId) {
      setLoading(false);
      return;
    }

    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase.rpc("get_form_analytics", {
        target_form_id: formId,
      });
      setAnalytics(data);
      setLoading(false);
    }

    void fetch();
  }, [formId]);

  return { analytics, loading };
}
