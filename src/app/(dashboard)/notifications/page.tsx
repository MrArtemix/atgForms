"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/stores/notification-store";
import { notificationService } from "@/lib/services/notification-service";
import { Notification, NotificationType } from "@/types/notification";
import { formatRelative } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Globe,
  Check,
  X,
  UserPlus,
  CheckCheck,
  Trash2,
  Loader2,
} from "lucide-react";

const NOTIFICATION_ICONS: Record<NotificationType, typeof Mail> = {
  invitation_received: Mail,
  invitation_accepted: Check,
  invitation_declined: X,
  response_received: MessageSquare,
  form_published: Globe,
  member_added: UserPlus,
  member_removed: X,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  invitation_received: "text-blue-500 bg-blue-100",
  invitation_accepted: "text-green-500 bg-green-100",
  invitation_declined: "text-red-500 bg-red-100",
  response_received: "text-purple-500 bg-purple-100",
  form_published: "text-emerald-500 bg-emerald-100",
  member_added: "text-blue-500 bg-blue-100",
  member_removed: "text-orange-500 bg-orange-100",
};

type TabFilter = "all" | "unread" | "invitations" | "responses";

const TABS: { key: TabFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "unread", label: "Non lues" },
  { key: "invitations", label: "Invitations" },
  { key: "responses", label: "Réponses" },
];

const INVITATION_TYPES: NotificationType[] = [
  "invitation_received",
  "invitation_accepted",
  "invitation_declined",
];

const RESPONSE_TYPES: NotificationType[] = ["response_received"];

function filterNotifications(
  notifications: Notification[],
  filter: TabFilter
): Notification[] {
  switch (filter) {
    case "unread":
      return notifications.filter((n) => !n.read);
    case "invitations":
      return notifications.filter((n) => INVITATION_TYPES.includes(n.type));
    case "responses":
      return notifications.filter((n) => RESPONSE_TYPES.includes(n.type));
    default:
      return notifications;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    initialized,
  } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    if (!initialized) {
      void fetchNotifications();
    }
  }, [initialized, fetchNotifications]);

  const filteredNotifications = useMemo(
    () => filterNotifications(notifications, activeTab),
    [notifications, activeTab]
  );

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const more = await notificationService.getNotifications(
        20,
        notifications.length
      );
      if (more.length === 0) {
        setAllLoaded(true);
      } else {
        // Refetch all to merge properly
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.data?.link) {
      router.push(notification.data.link);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void markAllAsRead()}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[hsl(var(--muted))] p-1 rounded-lg animate-fade-in-up animate-stagger-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === tab.key
                ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Separator />

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<BellRing className="h-8 w-8" />}
          title="Aucune notification"
          description={
            activeTab === "unread"
              ? "Vous êtes à jour !"
              : "Vous n'avez pas encore de notifications dans cette catégorie."
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification, i) => {
            const Icon =
              NOTIFICATION_ICONS[notification.type] || Bell;
            const colorClass =
              NOTIFICATION_COLORS[notification.type] || "text-gray-500 bg-gray-100";

            return (
              <div
                key={notification.id}
                className={cn(
                  `flex items-start gap-3 p-4 rounded-xl border border-[hsl(var(--border))] transition-all hover:bg-[hsl(var(--muted))]/50 animate-fade-in-up animate-stagger-${Math.min(i + 1, 6)}`,
                  !notification.read && "bg-[hsl(var(--primary))]/5 border-[hsl(var(--primary))]/20"
                )}
              >
                <button
                  onClick={() => void handleNotificationClick(notification)}
                  className="flex items-start gap-3 flex-1 text-left"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      colorClass
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] shrink-0" />
                      )}
                      <p
                        className={cn(
                          "text-sm",
                          !notification.read && "font-semibold"
                        )}
                      >
                        {notification.title}
                      </p>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]/70 mt-1">
                      {formatRelative(notification.created_at)}
                    </p>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                  onClick={() => void deleteNotification(notification.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          {/* Load more */}
          {!allLoaded && activeTab === "all" && notifications.length >= 20 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => void handleLoadMore()}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Charger plus"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
