"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Filiale, FilialeMember, FilialeWithProjets } from "@/types/filiale";
import { Workspace } from "@/types/workspace";

export function useFiliales(holdingId: string | null) {
    const [filiales, setFiliales] = useState<Filiale[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFiliales = useCallback(async () => {
        if (!holdingId) {
            setLoading(false);
            return;
        }

        const supabase = createClient();
        const { data } = await supabase
            .from("filiales")
            .select("*")
            .eq("holding_id", holdingId)
            .order("name");

        setFiliales(data || []);
        setLoading(false);
    }, [holdingId]);

    useEffect(() => {
        void fetchFiliales();
    }, [fetchFiliales]);

    return { filiales, loading, refetch: fetchFiliales };
}

export function useFiliale(filialeId: string | null) {
    const [filiale, setFiliale] = useState<FilialeWithProjets | null>(null);
    const [members, setMembers] = useState<FilialeMember[]>([]);
    const [formCounts, setFormCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const fetchFiliale = useCallback(async () => {
        if (!filialeId) {
            setLoading(false);
            return;
        }

        const supabase = createClient();
        const [filialeResult, projetsResult, membersResult] = await Promise.all([
            supabase.from("filiales").select("*").eq("id", filialeId).single(),
            supabase
                .from("workspaces")
                .select("*")
                .eq("filiale_id", filialeId)
                .order("created_at", { ascending: false }),
            supabase
                .from("filiale_members")
                .select("*, profile:profiles(*)")
                .eq("filiale_id", filialeId),
        ]);

        const projets = (projetsResult.data || []) as Workspace[];

        if (filialeResult.data) {
            setFiliale({
                ...filialeResult.data,
                projets,
                member_count: membersResult.data?.length || 0,
            });
        }

        setMembers(membersResult.data || []);

        // Fetch form counts per project
        if (projets.length > 0) {
            const projetIds = projets.map((p) => p.id);
            const { data: formRows } = await supabase
                .from("forms")
                .select("workspace_id")
                .in("workspace_id", projetIds);

            const counts: Record<string, number> = {};
            if (formRows) {
                for (const row of formRows) {
                    counts[row.workspace_id] = (counts[row.workspace_id] || 0) + 1;
                }
            }
            setFormCounts(counts);
        }

        setLoading(false);
    }, [filialeId]);

    useEffect(() => {
        void fetchFiliale();
    }, [fetchFiliale]);

    return { filiale, members, formCounts, loading, refetch: fetchFiliale };
}
