"use client";

import { create } from "zustand";
import { Notification } from "@/types/notification";
import { notificationService } from "@/lib/services/notification-service";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  initialized: boolean;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  initialized: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const [notifications, unreadCount] = await Promise.all([
        notificationService.getNotifications(20),
        notificationService.getUnreadCount(),
      ]);
      set({ notifications, unreadCount, initialized: true });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      set({ loading: false });
    }
  },

  addNotification: (notification: Notification) => {
    const { notifications } = get();
    // Avoid duplicates
    if (notifications.some((n) => n.id === notification.id)) return;
    set({
      notifications: [notification, ...notifications],
      unreadCount: get().unreadCount + (notification.read ? 0 : 1),
    });
  },

  markAsRead: async (id: string) => {
    const { notifications } = get();
    const notification = notifications.find((n) => n.id === id);
    if (!notification || notification.read) return;

    // Optimistic update
    set({
      notifications: notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });

    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      // Revert on error
      console.error("Failed to mark as read:", error);
      set({
        notifications: notifications.map((n) =>
          n.id === id ? { ...n, read: false } : n
        ),
        unreadCount: get().unreadCount + 1,
      });
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    // Optimistic update
    set({
      notifications: notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    });

    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      // Refetch to restore correct state
      await get().fetchNotifications();
    }
  },

  deleteNotification: async (id: string) => {
    const { notifications } = get();
    const notification = notifications.find((n) => n.id === id);

    // Optimistic update
    set({
      notifications: notifications.filter((n) => n.id !== id),
      unreadCount: notification && !notification.read
        ? Math.max(0, get().unreadCount - 1)
        : get().unreadCount,
    });

    try {
      await notificationService.deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      // Refetch to restore correct state
      await get().fetchNotifications();
    }
  },
}));
