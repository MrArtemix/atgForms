"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useRealtime<T extends Record<string, unknown>>(
  table: string,
  filter: { column: string; value: string } | null,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  useEffect(() => {
    if (!filter) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`${table}-${filter.value}`)
      .on(
        "postgres_changes" as never,
        {
          event: "*",
          schema: "public",
          table,
          filter: `${filter.column}=eq.${filter.value}`,
        },
        callback
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, filter, callback]);
}
