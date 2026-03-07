import { createClient } from "@/lib/supabase/client";
import { Holding, HoldingMember } from "@/types/holding";

async function getAuthenticatedClient() {
    const supabase = createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        throw new Error("Not authenticated — no active session");
    }
    return { supabase, user: session.user };
}

export const holdingService = {
    async getHoldings(): Promise<Holding[]> {
        const { supabase } = await getAuthenticatedClient();
        const { data, error } = await supabase
            .from("holdings")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getHolding(holdingId: string): Promise<Holding | null> {
        const { supabase } = await getAuthenticatedClient();
        const { data, error } = await supabase
            .from("holdings")
            .select("*")
            .eq("id", holdingId)
            .single();

        if (error) throw error;
        return data;
    },

    async getHoldingMembers(holdingId: string): Promise<HoldingMember[]> {
        const { supabase } = await getAuthenticatedClient();
        const { data, error } = await supabase
            .from("holding_members")
            .select("*, profile:profiles(*)")
            .eq("holding_id", holdingId);

        if (error) throw error;
        return data || [];
    },
};
