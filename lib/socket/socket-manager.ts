import { io, Socket } from 'socket.io-client';
import { useSocketStore } from '@/stores/socket.store';
import { notifications as mantineNotifications } from '@mantine/notifications';
import type {
  Notification,
  PendingNotificationsResponse,
  MarkAsReadResponse,
  OnlineUsersListEvent,
  UserStatusEvent,
} from '@/types/notification.types';

// ============================================================================
// Configuration
// ============================================================================

const WS_URL = (process.env.NEXT_PUBLIC_WS_URL || 'https://docflow-back.nordicuniversity.org').replace(/\/+$/, '');
const NAMESPACE = '/notifications';

const SOCKET_CONFIG = {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  timeout: 20000,
  autoConnect: false,
} as const;

// ============================================================================
// Socket Manager (Singleton)
// ============================================================================

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private onlineUsersInterval: NodeJS.Timeout | null = null;
  private token: string | null = null;
  private authErrorShown: boolean = false;

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // ==========================================================================
  // Connection
  // ==========================================================================

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.token = token;

    // Disconnect existing socket and remove listeners
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = io(`${WS_URL}${NAMESPACE}`, {
      ...SOCKET_CONFIG,
      auth: { token },
    });

    this.setupEventListeners();
    this.socket.connect();
  }

  disconnect(): void {
    this.clearIntervals();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.token = null;
    this.authErrorShown = false;

    useSocketStore.getState().reset();
  }

  reconnect(): void {
    if (this.token) {
      this.connect(this.token);
    }
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================

  private setupEventListeners(): void {
    if (!this.socket) return;

    const store = useSocketStore.getState();

    // Connection Events
    this.socket.on('connect', () => {
      store.setConnected(true);
      this.authErrorShown = false; // Reset on successful connect
      this.startIntervals();
      this.requestOnlineUsers();
      this?.loadInitialNotifications();
    });

    this.socket.on('disconnect', (reason) => {
      store.setConnected(false);
      store.setOnlineUsers([]);
      this.clearIntervals();

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      store.setConnected(false);
      store.setConnectionError(error.message);

      // Handle auth errors - stop reconnecting and show toast once
      if (
        error.message.includes('Authentication') ||
        error.message.includes('jwt expired') ||
        error.message.includes('401') ||
        error.message.includes('403')
      ) {
        // Stop reconnection attempts
        this.socket?.disconnect();
        this.handleAuthError();
      }
    });

    // Notification Events
    this.socket.on('notification', (notification: Notification) => {
      store.addNotification(notification);
      this.showNotificationToast(notification);
    });

    this.socket.on('pending-notifications', (data: PendingNotificationsResponse) => {
      store.setNotifications(data.notifications);
    });

    // Online Users Events
    this.socket.on('online-users:list', (data: OnlineUsersListEvent) => {
      store.setOnlineUsers(data.users);
    });

    this.socket.on('user:status', (data: UserStatusEvent) => {
      if (data.isOnline) {
        store.addOnlineUser(data.user);
      } else {
        store.removeOnlineUser(data.user.id);
      }
    });

    // Workflow Events
    this.socket.on('active-workflows-count', (data: { count: number }) => {
      store.setActiveWorkflowsCount(data.count);
    });

    // Session Events — auto logout
    this.socket.on('session:revoked', (data: { sessionId: string; message?: string }) => {
      mantineNotifications.show({
        title: 'Sessiya bekor qilindi',
        message: data.message || 'Sizning sessiyangiz boshqa qurilmadan chiqarib yuborildi',
        color: 'red',
        autoClose: 5000,
      });
      this.handleForceLogout();
    });

    this.socket.on('session:revoked-all', (data: { exceptSessionId?: string; message?: string }) => {
      mantineNotifications.show({
        title: 'Sessiyalar bekor qilindi',
        message: data.message || 'Barcha boshqa sessiyalar chiqarib yuborildi',
        color: 'orange',
        autoClose: 5000,
      });
      // Bu qurilma bekor qilinmagan bo'lishi mumkin (exceptSessionId)
      // Lekin xavfsizlik uchun profile invalidate qilamiz
      window.dispatchEvent(new CustomEvent('sessions-changed'));
    });

    // Error Events
    this.socket.on('error', (error: { message: string }) => {
      store.setConnectionError(error.message);

      if (error.message === 'Authentication failed' && !this.authErrorShown) {
        this.authErrorShown = true;
        this.socket?.disconnect();
        mantineNotifications.show({
          title: 'Autentifikatsiya xatosi',
          message: 'Iltimos, qayta tizimga kiring',
          color: 'red',
        });
      }
    });
  }

  // ==========================================================================
  // Intervals
  // ==========================================================================

  private startIntervals(): void {
    this.clearIntervals();

    // Heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat');
      }
    }, 30000);

    // Refresh online users every 30 seconds
    this.onlineUsersInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.requestOnlineUsers();
      }
    }, 30000);
  }

  private clearIntervals(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.onlineUsersInterval) {
      clearInterval(this.onlineUsersInterval);
      this.onlineUsersInterval = null;
    }
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  private async loadInitialNotifications(): Promise<void> {
    if (!this.token) return;

    try {
      const response = await fetch(
        `${WS_URL}/notifications?isRead=false&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          useSocketStore.getState().setNotifications(data.data);
        }
      }
    } catch {
      // Silently fail - socket events will handle notifications
    }
  }

  requestOnlineUsers(): void {
    this.socket?.emit('online-users:request');
  }

  markAsRead(notificationIds: string[]): void {
    if (!this.socket?.connected) return;

    // Optimistic update
    useSocketStore.getState().markAsRead(notificationIds);

    this.socket.emit(
      'mark-as-read',
      { notificationIds },
      (response: MarkAsReadResponse) => {
        if (!response.success) {
          this?.loadInitialNotifications();
          mantineNotifications.show({
            title: 'Xato',
            message: response.message,
            color: 'red',
          });
        }
      }
    );
  }

  markAllAsRead(): void {
    if (!this.socket?.connected) return;

    useSocketStore.getState().markAllAsRead();

    this.socket.emit('mark-all-as-read', (response: MarkAsReadResponse) => {
      if (!response.success) {
        this?.loadInitialNotifications();
        mantineNotifications.show({
          title: 'Xato',
          message: response.message,
          color: 'red',
        });
      }
    });
  }

  refreshWorkflowCount(): void {
    if (!this.socket?.connected) return;

    this.socket.emit(
      'get-active-workflows',
      (response: { success: boolean; count: number; message?: string }) => {
        if (response.success) {
          useSocketStore.getState().setActiveWorkflowsCount(response.count);
        }
      }
    );
  }

  private showNotificationToast(notification: Notification): void {
    mantineNotifications.show({
      title: notification.title,
      message: notification.message,
      color: 'blue',
      autoClose: 5000,
      withCloseButton: true,
    });
  }

  private handleAuthError(): void {
    window.dispatchEvent(new CustomEvent('socket-auth-error'));
  }

  private handleForceLogout(): void {
    // Tokenlarni tozalash va login sahifasiga yo'naltirish
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      const isProtected =
        currentPath.startsWith('/dashboard') ||
        currentPath.startsWith('/document-edit') ||
        currentPath.startsWith('/pdf');

      // Cookies tozalash document.cookie orqali
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      this.disconnect();

      const loginUrl = isProtected
        ? `/login?callbackUrl=${encodeURIComponent(currentPath)}`
        : '/login';
      setTimeout(() => {
        window.location.href = loginUrl;
      }, 1500);
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketManager = SocketManager.getInstance();
