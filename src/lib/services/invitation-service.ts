import { createClient } from "@/lib/supabase/client";
import { EntityType, Invitation } from "@/types/notification";

async function getAuthenticatedClient() {
  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error("Not authenticated — no active session");
  }
  return { supabase, user: session.user };
}

export const invitationService = {
  async createInvitation(
    email: string,
    entityType: EntityType,
    entityId: string,
    role: string
  ): Promise<Invitation> {
    const { supabase, user } = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from("invitations")
      .insert({
        email: email.toLowerCase().trim(),
        entity_type: entityType,
        entity_id: entityId,
        role,
        invited_by: user.id,
      })
      .select()
      .single();

    if (error) {
      // Duplicate pending invitation
      if (error.code === "23505") {
        throw new Error("Une invitation est déjà en attente pour cet email");
      }
      throw error;
    }
    return data;
  },

  async getInvitations(entityType: EntityType, entityId: string): Promise<Invitation[]> {
    const { supabase } = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from("invitations")
      .select("*, inviter:profiles!invited_by(full_name, email)")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMyPendingInvitations(): Promise<Invitation[]> {
    const { supabase, user } = await getAuthenticatedClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    if (!profile) return [];

    const { data, error } = await supabase
      .from("invitations")
      .select("*, inviter:profiles!invited_by(full_name, email)")
      .eq("email", profile.email)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async acceptInvitation(token: string): Promise<{ success: boolean; error?: string; entity_type?: string; entity_id?: string }> {
    const { supabase } = await getAuthenticatedClient();
    const { data, error } = await supabase.rpc("accept_invitation", {
      invitation_token: token,
    });

    if (error) throw error;
    return data;
  },

  async declineInvitation(token: string): Promise<{ success: boolean; error?: string }> {
    const { supabase } = await getAuthenticatedClient();
    const { data, error } = await supabase.rpc("decline_invitation", {
      invitation_token: token,
    });

    if (error) throw error;
    return data;
  },

  async cancelInvitation(id: string): Promise<void> {
    const { supabase } = await getAuthenticatedClient();
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
