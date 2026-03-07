"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Workspace, WorkspaceMember } from "@/types/workspace";

export function useWorkspaces(filialeId?: string) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("workspaces")
      .select("*")
      .order("created_at", { ascending: false });

    if (filialeId) {
      query = query.eq("filiale_id", filialeId);
    }

    const { data } = await query;
    setWorkspaces(data || []);
    setLoading(false);
  }, [filialeId]);

  useEffect(() => {
    void fetchWorkspaces();
  }, [fetchWorkspaces]);

  return { workspaces, loading, refetch: fetchWorkspaces };
}

export function useWorkspace(workspaceId: string | null) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    async function fetch() {
      const supabase = createClient();
      const [wsResult, membersResult] = await Promise.all([
        supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
        supabase
          .from("workspace_members")
          .select("*, profile:profiles(*)")
          .eq("workspace_id", workspaceId),
      ]);

      setWorkspace(wsResult.data);
      setMembers(membersResult.data || []);
      setLoading(false);
    }

    void fetch();
  }, [workspaceId]);

  return { workspace, members, loading };
}
