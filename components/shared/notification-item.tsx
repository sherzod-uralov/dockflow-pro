'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';
import { Notification, NotificationType } from '@/types/notification.types';
import {
    IconCheck,
    IconX,
    IconMessageCircle,
    IconFileCheck,
    IconFileX,
    IconUserCheck,
    IconUserX,
    IconClipboardCheck,
    IconListCheck,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { Group, Text, Box, ThemeIcon, Stack } from '@mantine/core';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

// Notification type bo'yicha icon va rang olish
const getNotificationIconConfig = (type: NotificationType) => {
    const iconProps = { size: 18, stroke: 1.5 };

    switch (type) {
        case NotificationType.WORKFLOW_STEP_ASSIGNED:
            return { icon: <IconUserCheck {...iconProps} />, color: 'blue' };
        case NotificationType.WORKFLOW_STEP_COMPLETED:
            return { icon: <IconCheck {...iconProps} />, color: 'green' };
        case NotificationType.WORKFLOW_STEP_REJECTED:
            return { icon: <IconX {...iconProps} />, color: 'red' };
        case NotificationType.WORKFLOW_STEP_REASSIGNED:
            return { icon: <IconUserX {...iconProps} />, color: 'orange' };
        case NotificationType.WORKFLOW_COMPLETED:
            return { icon: <IconClipboardCheck {...iconProps} />, color: 'green' };
        case NotificationType.WORKFLOW_STEP_COMMENT:
            return { icon: <IconMessageCircle {...iconProps} />, color: 'violet' };
        case NotificationType.DOCUMENT_APPROVED:
            return { icon: <IconFileCheck {...iconProps} />, color: 'green' };
        case NotificationType.DOCUMENT_REJECTED:
            return { icon: <IconFileX {...iconProps} />, color: 'red' };
        case NotificationType.TASK_ASSIGNED:
            return { icon: <IconListCheck {...iconProps} />, color: 'teal' };
        default:
            return { icon: <IconCheck {...iconProps} />, color: 'gray' };
    }
};

// Notification-ga click qilganda qayerga yo'naltirish
const getNavigationUrl = (notification: Notification): string | null => {
    const metadata = notification.metadata as any;

    if (!metadata) return null;

    // Task-related notifications
    if (metadata.taskId && metadata.projectId) {
        return `/dashboard/project/${metadata.projectId}/tasks`;
    }

    // Workflow-related notifications
    if (metadata.workflowId) {
        return `/dashboard/workflow/${metadata.workflowId}`;
    }

    if (metadata.documentId) {
        return `/dashboard/document/${metadata.documentId}`;
    }

    return null;
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
}) => {
    const router = useRouter();
    const { icon, color } = getNotificationIconConfig(notification.type);

    const handleClick = () => {
        // Agar o'qilmagan bo'lsa, o'qilgan deb belgilash
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }

        // Navigation
        const url = getNavigationUrl(notification);
        if (url) {
            router.push(url);
        }
    };

    return (
        <Box
            p="sm"
            style={(theme) => ({
                cursor: 'pointer',
                borderRadius: theme.radius.sm,
                backgroundColor: !notification.isRead
                    ? 'var(--mantine-color-blue-0)'
                    : 'transparent',
                borderLeft: !notification.isRead
                    ? `3px solid var(--mantine-color-blue-6)`
                    : '3px solid transparent',
                transition: 'background-color 150ms ease',
                '&:hover': {
                    backgroundColor: !notification.isRead
                        ? 'var(--mantine-color-blue-1)'
                        : 'var(--mantine-color-gray-0)',
                },
            })}
            onClick={handleClick}
        >
            <Group wrap="nowrap" align="flex-start" gap="sm">
                {/* Icon */}
                <ThemeIcon
                    variant="light"
                    color={color}
                    size="md"
                    radius="sm"
                    style={{ flexShrink: 0 }}
                >
                    {icon}
                </ThemeIcon>

                {/* Content */}
                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                    <Text
                        size="sm"
                        fw={!notification.isRead ? 600 : 400}
                        lineClamp={2}
                    >
                        {notification.title}
                    </Text>

                    <Text size="xs" c="dimmed" lineClamp={2}>
                        {notification.message}
                    </Text>

                    <Text size="xs" c="dimmed">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: uz,
                        })}
                    </Text>
                </Stack>

                {/* Unread indicator */}
                {!notification.isRead && (
                    <Box
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'var(--mantine-color-blue-6)',
                            flexShrink: 0,
                            marginTop: 4,
                        }}
                    />
                )}
            </Group>
        </Box>
    );
};
