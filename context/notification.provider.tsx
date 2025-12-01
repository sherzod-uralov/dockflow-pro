'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { Notification } from '@/types/notification.types';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    activeWorkflowsCount: number;
    markAsRead: (notificationIds: string[]) => void;
    markAllAsRead: () => void;
    refreshWorkflowCount: () => void;
    isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const notificationData = useNotifications();

    return (
        <NotificationContext.Provider value={notificationData}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = (): NotificationContextType => {
    const context = useContext(NotificationContext);

    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }

    return context;
};
