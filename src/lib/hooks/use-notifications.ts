"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useNotificationStore } from "@/stores/notification-store";
import { Notification } from "@/types/notification";
import { RealtimeChannel } from "@supabase/supabase-js";

export function useNotifications(userId: string | null) {
  const { fetchNotifications, addNotification, initialized } = useNotificationStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Initial fetch
  useEffect(() => {
    if (userId && !initialized) {
      void fetchNotifications();
    }
  }, [userId, initialized, fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          addNotification(payload.new as Notification);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, addNotification]);
}
