import { create } from 'zustand';
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

export const useSocketStore = create<SocketStore>()(
  devtools(
    (set) => ({
      ...initialState,
      setConnected: (connected) =>
        set(
          { isConnected: connected, connectionError: null },
          false,
          'socket/setConnected'
        ),

      setConnectionError: (error) =>
        set(
          { connectionError: error },
          false,
          'socket/setConnectionError'
        ),

      setNotifications: (notifications) =>
        set(
          {
            notifications,
            unreadCount: notifications.filter((n) => !n.isRead).length,
          },
          false,
          'notifications/set'
        ),

      addNotification: (notification) =>
        set(
          (state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }),
          false,
          'notifications/add'
        ),

      markAsRead: (ids) =>
        set(
          (state) => ({
            notifications: state.notifications.map((n) =>
              ids.includes(n.id)
                ? { ...n, isRead: true, readAt: new Date().toISOString() }
                : n
            ),
            unreadCount: Math.max(0, state.unreadCount - ids.length),
          }),
          false,
          'notifications/markAsRead'
        ),

      markAllAsRead: () =>
        set(
          (state) => ({
            notifications: state.notifications.map((n) => ({
              ...n,
              isRead: true,
              readAt: new Date().toISOString(),
            })),
            unreadCount: 0,
          }),
          false,
          'notifications/markAllAsRead'
        ),

      clearNotifications: () =>
        set(
          { notifications: [], unreadCount: 0 },
          false,
          'notifications/clear'
        ),

      setOnlineUsers: (users) =>
        set({ onlineUsers: users }, false, 'onlineUsers/set'),

      addOnlineUser: (user) =>
        set(
          (state) => ({
            onlineUsers: state.onlineUsers.some((u) => u.id === user.id)
              ? state.onlineUsers
              : [...state.onlineUsers, user],
          }),
          false,
          'onlineUsers/add'
        ),

      removeOnlineUser: (userId) =>
        set(
          (state) => ({
            onlineUsers: state.onlineUsers.filter((u) => u.id !== userId),
          }),
          false,
          'onlineUsers/remove'
        ),


      setActiveWorkflowsCount: (count) =>
        set(
          { activeWorkflowsCount: count },
          false,
          'workflows/setActiveCount'
        ),

      reset: () => set(initialState, false, 'socket/reset'),
    }),
    { name: 'SocketStore' }
  )
);

// ============================================================================
// Selectors (for better performance)
// ============================================================================

export const selectIsConnected = (state: SocketStore) => state.isConnected;
export const selectConnectionError = (state: SocketStore) => state.connectionError;
export const selectNotifications = (state: SocketStore) => state.notifications;
export const selectUnreadCount = (state: SocketStore) => state.unreadCount;
export const selectOnlineUsers = (state: SocketStore) => state.onlineUsers;
export const selectActiveWorkflowsCount = (state: SocketStore) => state.activeWorkflowsCount;
