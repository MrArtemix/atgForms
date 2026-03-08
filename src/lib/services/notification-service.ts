import { createClient } from "@/lib/supabase/client";
import { Notification } from "@/types/notification";

async function getAuthenticatedClient() {
  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error("Not authenticated — no active session");
  }
  return { supabase, user: session.user };
}

export const notificationService = {
  async getNotifications(limit = 20, offset = 0): Promise<Notification[]> {
    const { supabase } = await getAuthenticatedClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  async getUnreadCount(): Promise<number> {
    const { supabase } = await getAuthenticatedClient();
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("read", false);

    if (error) throw error;
    return count || 0;
  },

  async markAsRead(id: string): Promise<void> {
    const { supabase } = await getAuthenticatedClient();
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { supabase } = await getAuthenticatedClient();
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);

    if (error) throw error;
  },

  async deleteNotification(id: string): Promise<void> {
    const { supabase } = await getAuthenticatedClient();
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
