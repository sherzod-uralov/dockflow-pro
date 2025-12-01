'use client';

import React from 'react';
import {
    ScrollArea,
    Text,
    Button,
    Stack,
    Group,
    Box,
    Center,
    Divider
} from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';
import { NotificationItem } from './notification-item';
import { Notification } from '@/types/notification.types';

interface NotificationListProps {
    notifications: Notification[];
    unreadCount: number;
    onMarkAsRead: (notificationIds: string[]) => void;
    onMarkAllAsRead: () => void;
    onClose?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
    onClose,
}) => {
    // Faqat oxirgi 50 ta notificationni ko'rsatish (performance uchun)
    const displayedNotifications = notifications.slice(0, 50);

    return (
        <Box w={400}>
            {/* Header */}
            <Group justify="space-between" p="md" pb="sm">
                <Text fw={600} size="lg">
                    Bildirishnomalar
                </Text>
                {unreadCount > 0 && (
                    <Button
                        variant="subtle"
                        size="compact-sm"
                        color="blue"
                        onClick={onMarkAllAsRead}
                    >
                        Barchasini o'qilgan deb belgilash
                    </Button>
                )}
            </Group>

            <Divider />

            {/* Notifications list */}
            {displayedNotifications.length > 0 ? (
                <ScrollArea h={400} type="auto">
                    <Stack gap={0} p="xs">
                        {displayedNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={(id) => {
                                    onMarkAsRead([id]);
                                    onClose?.();
                                }}
                            />
                        ))}
                    </Stack>
                </ScrollArea>
            ) : (
                // Empty state
                <Center h={400}>
                    <Stack align="center" gap="xs">
                        <IconInbox size={48} opacity={0.3} stroke={1.5} />
                        <Text size="sm" c="dimmed">
                            Bildirishnomalar yo'q
                        </Text>
                    </Stack>
                </Center>
            )}

            {/* Footer - agar 50 tadan ko'p bo'lsa */}
            {notifications.length > 50 && (
                <>
                    <Divider />
                    <Center p="sm">
                        <Text size="xs" c="dimmed">
                            Faqat oxirgi 50 ta bildirishnoma ko'rsatilmoqda
                        </Text>
                    </Center>
                </>
            )}
        </Box>
    );
};
