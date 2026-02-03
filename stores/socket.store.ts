import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Notification,
  OnlineUser,
} from '@/types/notification.types';

interface SocketState {
  isConnected: boolean;
  connectionError: string | null;
  notifications: Notification[];
  unreadCount: number;
  onlineUsers: OnlineUser[];
  activeWorkflowsCount: number;
}

interface SocketActions {
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (ids: string[]) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  addOnlineUser: (user: OnlineUser) => void;
  removeOnlineUser: (userId: string) => void;
  setActiveWorkflowsCount: (count: number) => void;
  reset: () => void;
}

type SocketStore = SocketState & SocketActions;

const initialState: SocketState = {
  isConnected: false,
  connectionError: null,
  notifications: [],
  unreadCount: 0,
  onlineUsers: [],
  activeWorkflowsCount: 0,
};

const storeCreator: StateCreator<SocketStore> = (set) => ({
  ...initialState,

  setConnected: (connected) =>
    set({ isConnected: connected, connectionError: null }),

  setConnectionError: (error) =>
    set({ connectionError: error }),

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: (ids) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        ids.includes(n.id)
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      ),
      unreadCount: Math.max(0, state.unreadCount - ids.length),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: new Date().toISOString(),
      })),
      unreadCount: 0,
    })),

  clearNotifications: () =>
    set({ notifications: [], unreadCount: 0 }),

  setOnlineUsers: (users) =>
    set({ onlineUsers: users }),

  addOnlineUser: (user) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.some((u) => u.id === user.id)
        ? state.onlineUsers
        : [...state.onlineUsers, user],
    })),

  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((u) => u.id !== userId),
    })),

  setActiveWorkflowsCount: (count) =>
    set({ activeWorkflowsCount: count }),

  reset: () => set(initialState),
});

export const useSocketStore =
  process.env.NODE_ENV === 'development'
    ? create<SocketStore>()(devtools(storeCreator, { name: 'SocketStore' }))
    : create<SocketStore>()(storeCreator);

// ============================================================================
// Selectors (for better performance)
// ============================================================================

export const selectIsConnected = (state: SocketStore) => state.isConnected;
export const selectConnectionError = (state: SocketStore) => state.connectionError;
export const selectNotifications = (state: SocketStore) => state.notifications;
export const selectUnreadCount = (state: SocketStore) => state.unreadCount;
export const selectOnlineUsers = (state: SocketStore) => state.onlineUsers;
export const selectActiveWorkflowsCount = (state: SocketStore) => state.activeWorkflowsCount;
