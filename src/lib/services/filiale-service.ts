import { createClient } from "@/lib/supabase/client";
import { Filiale, FilialeMember, FilialeRole, FilialeWithProjets } from "@/types/filiale";
import { Workspace } from "@/types/workspace";

async function getAuthenticatedClient() {
    const supabase = createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        throw new Error("Not authenticated — no active session");
    }
    return { supabase, user: session.user };
}

export const filialeService = {
    async getFiliales(holdingId: string): Promise<Filiale[]> {
        const { supabase } = await getAuthenticatedClient();
        const { data, error } = await supabase
            .from("filiales")
            .select("*")
            .eq("holding_id", holdingId)
            .order("name");

        if (error) throw error;
        return data || [];
    },

    async getAllFiliales(): Promise<Filiale[]> {
        const { supabase } = await getAuthenticatedClient();
        const { data, error } = await supabase
            .from("filiales")
            .select("*")
            .order("name");

        if (error) throw error;
        return data || [];
    },

    async getFiliale(filialeId: string): Promise<Filiale | null> {
        const { supabase } = await getAuthenticatedClient();
        const { data, error } = await supabase
            .from("filiales")
            .select("*")
            .eq("id", filialeId)
            .single();

        if (error) throw error;
        return data;
    },

    async getFilialeWithProjets(filialeId: string): Promise<FilialeWithProjets | null> {
        const { supabase } = await getAuthenticatedClient();

        const [filialeResult, projetsResult, membersResult] = await Promise.all([
            supabase.from("filiales").select("*").eq("id", filialeId).single(),
            supabase.from("workspaces").select("*").eq("filiale_id", filialeId).order("created_at", { ascending: false }),
            supabase.from("filiale_members").select("id", { count: "exact", head: true }).eq("filiale_id", filialeId),
        ]);

        if (filialeResult.error) throw filialeResult.error;
        if (!filialeResult.data) return null;

        return {
            ...filialeResult.data,
            projets: (projetsResult.data || []) as Workspace[],
            member_count: membersResult.count || 0,
        };
    },

    async createFiliale(holdingId: string, name: string, description?: string, color?: string): Promise<Filiale> {
        const res = await fetch("/api/filiales", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ holdingId, name, description, color }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to create filiale");
        }

        return await res.json();
    },

    async updateFiliale(id: string, updates: Partial<Filiale>): Promise<Filiale> {
        const { supabase } = await getAuthenticatedClient();
        const { data, error } = await supabase
            .from("filiales")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteFiliale(id: string): Promise<void> {
        const { supabase } = await getAuthenticatedClient();
        const { error } = await supabase.from("filiales").delete().eq("id", id);
        if (error) throw error;
    },

    async getMembers(filialeId: string): Promise<FilialeMember[]> {
        const { supabase } = await getAuthenticatedClient();
        const { data, error } = await supabase
            .from("filiale_members")
            .select("*, profile:profiles(*)")
            .eq("filiale_id", filialeId);

        if (error) throw error;
        return data || [];
    },

    async addMember(filialeId: string, email: string, role: FilialeRole = "member"): Promise<void> {
        const { supabase } = await getAuthenticatedClient();
        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .single();

        if (!profile) throw new Error("Utilisateur non trouvé");

        const { error } = await supabase.from("filiale_members").insert({
            filiale_id: filialeId,
            user_id: profile.id,
            role,
        });
        if (error) throw error;
    },

    async removeMember(memberId: string): Promise<void> {
        const { supabase } = await getAuthenticatedClient();
        const { error } = await supabase
            .from("filiale_members")
            .delete()
            .eq("id", memberId);
        if (error) throw error;
    },

    async updateMemberRole(memberId: string, role: FilialeRole): Promise<void> {
        const { supabase } = await getAuthenticatedClient();
        const { error } = await supabase
            .from("filiale_members")
            .update({ role })
            .eq("id", memberId);
        if (error) throw error;
    },
};
