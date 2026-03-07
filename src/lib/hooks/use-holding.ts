"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Holding } from "@/types/holding";
import { Filiale } from "@/types/filiale";

export function useHolding() {
    const [holding, setHolding] = useState<Holding | null>(null);
    const [filiales, setFiliales] = useState<Filiale[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHolding = useCallback(async () => {
        try {
            const supabase = createClient();

            // Try to get existing holding
            const { data: holdings, error } = await supabase
                .from("holdings")
                .select("*")
                .limit(1);

            let currentHolding: Holding | null = null;

            if ((!holdings || holdings.length === 0) || error) {
                // No holding found or table doesn't exist — auto-create ATG via server API
                const res = await fetch("/api/holdings/ensure", { method: "POST" });
                if (res.ok) {
                    currentHolding = await res.json();
                }
            } else {
                currentHolding = holdings[0];
            }

            if (currentHolding) {
                setHolding(currentHolding);

                // Fetch filiales for this holding
                const { data: filialesData } = await supabase
                    .from("filiales")
                    .select("*")
                    .eq("holding_id", currentHolding.id)
                    .order("name");

                setFiliales(filialesData || []);
            }
        } catch (err) {
            console.error("useHolding error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHolding();
    }, [fetchHolding]);

    return { holding, filiales, loading, refetch: fetchHolding };
}
