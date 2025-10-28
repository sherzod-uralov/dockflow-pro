"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  FileText,
  Shield,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType =
  | "document"
  | "permission"
  | "user"
  | "approval"
  | "rejection"
  | "reminder"
  | "warning"
  | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  senderName?: string;
}

// Mock data - keyinchalik backenddan keladigan dataga almashtiriladi
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "document",
    title: "Yangi hujjat tasdiqlash uchun yuborildi",
    message:
      "Alisher Valiyev tomonidan 'Shartnoma №123' hujjati tasdiqlash uchun yuborildi",
    time: "5 daqiqa oldin",
    isRead: false,
    senderName: "Alisher Valiyev",
  },
  {
    id: "2",
    type: "permission",
    title: "Adminlik huquqi berildi",
    message: "Sizga tizimda administrator huquqlari berildi",
    time: "1 soat oldin",
    isRead: false,
  },
  {
    id: "3",
    type: "approval",
    title: "Hujjat tasdiqlandi",
    message: "'Ariza №456' hujjati muvaffaqiyatli tasdiqlandi",
    time: "2 soat oldin",
    isRead: true,
  },
  {
    id: "4",
    type: "user",
    title: "Yangi foydalanuvchi qo'shildi",
    message: "Dilshod Rahmonov tizimga qo'shildi",
    time: "3 soat oldin",
    isRead: true,
    senderName: "Dilshod Rahmonov",
  },
  {
    id: "5",
    type: "rejection",
    title: "Hujjat rad etildi",
    message: "'Ariza №789' hujjati rad etildi. Sabab: Ma'lumotlar to'liq emas",
    time: "1 kun oldin",
    isRead: true,
  },
  {
    id: "6",
    type: "reminder",
    title: "Eslatma",
    message: "Bugun soat 14:00 da yig'ilish bo'ladi",
    time: "2 kun oldin",
    isRead: true,
  },
];

// Icon ranglari CSS variables bilan
const notificationIcons: Record<NotificationType, React.ReactNode> = {
  document: <FileText className="h-5 w-5 text-info" />,
  permission: <Shield className="h-5 w-5 text-primary" />,
  user: <UserPlus className="h-5 w-5 text-success" />,
  approval: <CheckCircle className="h-5 w-5 text-success" />,
  rejection: <XCircle className="h-5 w-5 text-error" />,
  reminder: <Clock className="h-5 w-5 text-warning" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  info: <Info className="h-5 w-5 text-info" />,
};

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true })),
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative text-foreground hover:bg-accent rounded-xl",
            className,
          )}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-error text-white text-xs rounded-full flex items-center justify-center px-1.5 font-semibold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[400px] p-0 rounded-xl bg-card"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg text-card-foreground">
              Bildirishnomalar
            </h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} ta o'qilmagan
              </p>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-8 hover:bg-accent hover:text-accent-foreground"
                >
                  Barchasini o'qilgan
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs h-8 text-error hover:bg-error-muted hover:text-error"
              >
                Tozalash
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Bildirishnomalar yo'q
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group p-4 hover:bg-accent cursor-pointer transition-colors relative",
                    !notification.isRead && "bg-surface-primary",
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                  )}

                  <div className="flex gap-3 pl-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {notificationIcons[notification.type]}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight mb-1 text-foreground group-hover:text-accent-foreground">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-accent-foreground/80">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 group-hover:text-accent-foreground/60">
                            {notification.time}
                          </p>
                        </div>

                        {/* Delete button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-error hover:text-white transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/50">
            <Button
              variant="ghost"
              className="w-full text-sm text-primary hover:text-primary hover:bg-primary-muted"
              onClick={() => {
                // Navigate to notifications page
                console.log("Barcha bildirishnomalarni ko'rish");
                setOpen(false);
              }}
            >
              Barcha bildirishnomalarni ko'rish
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
