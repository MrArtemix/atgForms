import { createClient } from "@/lib/supabase/client";
import { Workspace, WorkspaceRole } from "@/types/workspace";
import { slugify } from "@/lib/utils/slugify";

// Helper: get a supabase client with a verified fresh session
async function getAuthenticatedClient() {
  const supabase = createClient();

  // getSession() reads the session from storage and refreshes the access token if expired.
  // This ensures the JWT sent to PostgREST contains a valid auth.uid().
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error("Not authenticated — no active session");
  }

  return { supabase, user: session.user };
}

export const workspaceService = {
  async createWorkspace(name: string, description?: string, filialeId?: string): Promise<Workspace> {
    const res = await fetch("/api/workspaces/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description, filialeId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to create workspace");
    }

    return await res.json();
  },

  async getWorkspaces(filialeId?: string): Promise<Workspace[]> {
    const { supabase } = await getAuthenticatedClient();
    let query = supabase
      .from("workspaces")
      .select("*")
      .order("created_at", { ascending: false });

    if (filialeId) {
      query = query.eq("filiale_id", filialeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace> {
    const { supabase } = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from("workspaces")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteWorkspace(id: string): Promise<void> {
    const { supabase } = await getAuthenticatedClient();
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (error) throw error;
  },

  async inviteMember(workspaceId: string, email: string, role: WorkspaceRole = "viewer"): Promise<void> {
    const { supabase, user } = await getAuthenticatedClient();
    // Check if user exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profile) {
      const { error } = await supabase.from("workspace_members").insert({
        workspace_id: workspaceId,
        user_id: profile.id,
        role,
      });
      if (error) throw error;
    } else {
      // Store invited email for when they sign up
      const { error } = await supabase.from("workspace_members").insert({
        workspace_id: workspaceId,
        user_id: user.id,
        role,
        invited_email: email,
      });
      if (error) throw error;
    }
  },

  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    const { supabase } = await getAuthenticatedClient();
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("id", memberId);
    if (error) throw error;
  },

  async updateMemberRole(memberId: string, role: WorkspaceRole): Promise<void> {
    const { supabase } = await getAuthenticatedClient();
    const { error } = await supabase
      .from("workspace_members")
      .update({ role })
      .eq("id", memberId);
    if (error) throw error;
  },

  async ensurePersonalWorkspace(): Promise<Workspace> {
    // Use server-side API route to ensure proper auth context for RLS
    const res = await fetch("/api/workspaces/ensure", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to ensure workspace");
    }

    return data;
  },
};
