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

        if (filialeResult.data) {
            setFiliale({
                ...filialeResult.data,
                projets: (projetsResult.data || []) as Workspace[],
                member_count: membersResult.data?.length || 0,
            });
        }

        setMembers(membersResult.data || []);
        setLoading(false);
    }, [filialeId]);

    useEffect(() => {
        void fetchFiliale();
    }, [fetchFiliale]);

    return { filiale, members, loading, refetch: fetchFiliale };
}
