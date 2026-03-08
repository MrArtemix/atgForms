"use client";

import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/stores/notification-store";
import { Notification, NotificationType } from "@/types/notification";
import { formatRelative } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (notification: Notification) => void;
}) {
  const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
  const colorClass = NOTIFICATION_COLORS[notification.type] || "text-gray-500 bg-gray-100";

  return (
    <button
      onClick={() => onRead(notification)}
      className={cn(
        "flex items-start gap-3 w-full p-3 text-left transition-colors hover:bg-[hsl(var(--muted))]/50 rounded-lg",
        !notification.read && "bg-[hsl(var(--primary))]/5"
      )}
    >
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] shrink-0" />
          )}
          <p className={cn("text-sm truncate", !notification.read && "font-medium")}>
            {notification.title}
          </p>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]/70 mt-1">
          {formatRelative(notification.created_at)}
        </p>
      </div>
    </button>
  );
}

export function NotificationPopover() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore();

  const displayedNotifications = notifications.slice(0, 8);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.data?.link) {
      router.push(notification.data.link);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellRing className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              onClick={() => void markAllAsRead()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <Separator />

        {/* Notifications list */}
        {displayedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
              <BellRing className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Aucune notification
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="p-1">
              {displayedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={(n) => void handleNotificationClick(n)}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                onClick={() => router.push("/notifications")}
              >
                Voir toutes les notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
