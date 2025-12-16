import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '@/features/login/service/login.service';
import {
    Notification,
    PendingNotificationsResponse,
    MarkAsReadResponse,
    SocketErrorResponse,
    OnlineUser,
    OnlineUsersListEvent,
    UserStatusEvent,
} from '@/types/notification.types';
import { notifications } from '@mantine/notifications';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'https://docflow-back.nordicuniversity.org';
const NAMESPACE = '/notifications';

interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    activeWorkflowsCount: number;
    markAsRead: (notificationIds: string[]) => void;
    markAllAsRead: () => void;
    refreshWorkflowCount: () => void;
    isConnected: boolean;
    onlineUsers: OnlineUser[];
    showError: (error: string) => void;
}

export const useNotifications = (): UseNotificationsReturn => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [activeWorkflowsCount, setActiveWorkflowsCount] = useState<number>(0);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

    useEffect(() => {
        const accessToken = authService.getAccessToken();

        // Agar token bo'lmasa, socket yaratmaymiz
        if (!accessToken) {
            console.warn('⚠️ No access token found, skipping socket connection');
            return;
        }

        const targetUrl = `${WS_URL}${NAMESPACE}`;
        console.log('🔌 Initializing Socket.IO connection to:', targetUrl);
        console.log('🔑 Token available:', !!accessToken);

        const newSocket = io(`${WS_URL}${NAMESPACE}`, {
            auth: {
                token: accessToken,
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
            timeout: 20000,
            autoConnect: true,
            forceNew: true,
        });

        // Connection successful
        newSocket.on('connect', async () => {
            console.log('✅ Connected to notification server');
            console.log('📡 Socket ID:', newSocket.id);
            setIsConnected(true);

            // Request online users list
            console.log('📤 Emitting online-users:request');
            newSocket.emit('online-users:request');

            try {
                const response = await fetch(`${WS_URL}/notifications?isRead=false&limit=50`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('📡 Loaded notifications via REST API:', data);

                    if (data.data && Array.isArray(data.data)) {
                        setNotificationsList(data.data);
                        setUnreadCount(data.unreadCount || data.data.filter((n: Notification) => !n.isRead).length);
                    }
                }
            } catch (error) {
                console.warn('⚠️ Failed to load notifications via REST API:', error);
            }
        });

        // Pending notifications (connection paytida keladi)
        newSocket.on('pending-notifications', (data: PendingNotificationsResponse) => {
            console.log(`📬 Received ${data.count} pending notifications`);
            console.log('📬 Notifications data:', data);
            setNotificationsList(data.notifications);
            setUnreadCount(data.count);
        });
        newSocket.on('active-workflows-count', (data: { count: number }) => {
            console.log(`📊 Active workflows count: ${data.count}`);
            setActiveWorkflowsCount(data.count);
        });
        newSocket.onAny((eventName, ...args) => {
            console.log(`🎯 Event received: ${eventName}`, args);
        });

        // Real-time yangi notification
        newSocket.on('notification', (notification: Notification) => {
            console.log('🔔 New notification received:', notification);

            // Notificationlar ro'yxatiga qo'shish
            setNotificationsList((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Mantine toast notification ko'rsatish
            notifications.show({
                title: notification.title,
                message: notification.message,
                color: 'blue',
                autoClose: 5000,
                withCloseButton: true,
            });
        });

        // Error handling
        newSocket.on('error', (error: SocketErrorResponse) => {
            console.error('❌ Socket error:', error.message);

            if (error.message === 'Authentication failed') {
                // Token muammosi bo'lsa, logout qilish
                notifications.show({
                    title: 'Autentifikatsiya xatosi',
                    message: 'Iltimos, qayta tizimga kiring',
                    color: 'red',
                });

                // Optional: auto logout
                // authService.logout();
            }
        });

        // Disconnect
        newSocket.on('disconnect', (reason: string) => {
            console.log('🔌 Disconnected from notification server:', reason);
            setIsConnected(false);
            console.log('🔌 Disconnected from notification server:', reason);
            setIsConnected(false);
            setOnlineUsers([]);
        });

        // Online Users Events
        newSocket.on('online-users:list', (data: OnlineUsersListEvent) => {
            console.log('👥 Received online users list:', data);
            console.log(`👥 Received ${data.count} online users`);
            setOnlineUsers(data.users);
        });

        newSocket.on('user:status', (data: UserStatusEvent) => {
            if (data.isOnline) {
                console.log(`👤 User online: ${data.user.fullname}`);
                setOnlineUsers((prev) => {
                    const exists = prev.some((u) => u.id === data.user.id);
                    if (exists) return prev;
                    return [...prev, data.user];
                });
            } else {
                console.log(`👤 User offline: ${data.user.fullname}`);
                setOnlineUsers((prev) => prev.filter((u) => u.id !== data.user.id));
            }
        });

        // Connection error
        let errorCount = 0;
        newSocket.on('connect_error', async (error: Error) => {
            errorCount++;
            console.error('❌ Socket connection error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            console.warn('⚠️ Notification server bilan ulanishda xatolik:', error.message);

            // Agar xatolik autentifikatsiya bilan bog'liq bo'lsa, tokenni yangilashga urinib ko'ramiz
            if (error.message.includes('Authentication error') || error.message.includes('jwt expired') || error.message.includes('403') || error.message.includes('401') || error.message.includes('websocket error')) {
                console.log('🔄 Token eskirgan bo\'lishi mumkin, yangilashga urinmoqda...');
                try {
                    const newToken = await authService.refreshToken();
                    if (newToken) {
                        console.log('✅ Token yangilandi, qayta ulanmoqda...');
                        newSocket.auth = { token: newToken };
                        newSocket.connect();
                        return;
                    }
                } catch (refreshError) {
                    console.error('❌ Tokenni yangilash imkonsiz:', refreshError);
                }
            }

            // Faqat birinchi xatoda log qilish (spam oldini olish)
            if (errorCount === 1) {
                console.info('ℹ️ Notification tizimi hozircha ishlamayapti. Asosiy funksiyalar ishlaydi.');
            }
            setIsConnected(false);
        });

        // Heartbeat mechanism (keep connection alive)
        const heartbeatInterval = setInterval(() => {
            if (newSocket.connected) {
                // console.log('💓 Sending heartbeat');
                newSocket.emit('heartbeat');
            }
        }, 30000);

        // Periodic refresh for online users (resilience)
        const refreshInterval = setInterval(() => {
            if (newSocket.connected) {
                console.log('🔄 Refreshing online users list');
                newSocket.emit('online-users:request');
            }
        }, 10000);

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            console.log('🧹 Cleaning up socket connection');
            clearInterval(heartbeatInterval);
            clearInterval(refreshInterval);
            newSocket.close();
        };
    }, []); // Empty dependency array - faqat mount/unmount paytida

    // Mark as read function
    const markAsRead = useCallback(
        (notificationIds: string[]) => {
            if (!socket || !socket.connected) {
                console.warn('Socket not connected, cannot mark as read');
                return;
            }

            socket.emit(
                'mark-as-read',
                { notificationIds },
                (response: MarkAsReadResponse) => {
                    if (response.success) {
                        console.log('✅ Notifications marked as read:', notificationIds);

                        // Local state yangilash
                        setNotificationsList((prev) =>
                            prev.map((n) =>
                                notificationIds.includes(n.id)
                                    ? { ...n, isRead: true, readAt: new Date().toISOString() }
                                    : n
                            )
                        );

                        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
                    } else {
                        console.error('❌ Failed to mark as read:', response.message);
                        notifications.show({
                            title: 'Xato',
                            message: response.message,
                            color: 'red',
                        });
                    }
                }
            );
        },
        [socket]
    );

    // Mark all as read function
    const markAllAsRead = useCallback(() => {
        if (!socket || !socket.connected) {
            console.warn('Socket not connected, cannot mark all as read');
            return;
        }

        socket.emit('mark-all-as-read', (response: MarkAsReadResponse) => {
            if (response.success) {
                console.log('✅ All notifications marked as read');

                // Local state yangilash
                setNotificationsList((prev) =>
                    prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
                );

                setUnreadCount(0);
            } else {
                console.error('❌ Failed to mark all as read:', response.message);
                notifications.show({
                    title: 'Xato',
                    message: response.message,
                    color: 'red',
                });
            }
        });
    }, [socket]);

    // Refresh workflow count function
    const refreshWorkflowCount = useCallback(() => {
        if (!socket || !socket.connected) {
            console.warn('Socket not connected, cannot refresh workflow count');
            return;
        }

        socket.emit('get-active-workflows', (response: { success: boolean; count: number; message?: string }) => {
            if (response.success) {
                console.log('📊 Active workflows count refreshed:', response.count);
                setActiveWorkflowsCount(response.count);
            } else {
                console.error('❌ Failed to refresh workflow count:', response.message);
            }
        });
    }, [socket]);

    return {
        notifications: notificationsList,
        unreadCount,
        activeWorkflowsCount,
        markAsRead,
        markAllAsRead,
        refreshWorkflowCount,
        showError: (error: string) => notifications.show({ message: error, color: 'red' }),
        onlineUsers,
        isConnected,
    };
};
