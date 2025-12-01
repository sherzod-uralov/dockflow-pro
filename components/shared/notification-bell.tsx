'use client';

import React, { useState } from 'react';
import {
    ActionIcon,
    Indicator,
    Popover,
    Badge,
    Tooltip
} from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { NotificationList } from './notification-list';
import { useNotificationContext } from '@/context/notification.provider';

export const NotificationBell: React.FC = () => {
    const [opened, setOpened] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected } = useNotificationContext();

    return (
        <Popover
            width={400}
            position="bottom-end"
            shadow="md"
            opened={opened}
            onChange={setOpened}
            radius="md"
        >
            <Popover.Target>
                <Tooltip label="Bildirishnomalar" position="bottom">
                    <Indicator
                        inline
                        label={unreadCount > 99 ? '99+' : unreadCount}
                        size={16}
                        color="red"
                        disabled={unreadCount === 0}
                        offset={4}
                    >
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="lg"
                            radius="sm"
                            onClick={() => setOpened((o) => !o)}
                            style={{ position: 'relative' }}
                        >
                            <IconBell size={20} stroke={1.5} />

                            {/* Connection status indicator */}
                            {!isConnected && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 2,
                                        right: 2,
                                        width: 6,
                                        height: 6,
                                        backgroundColor: 'var(--mantine-color-red-6)',
                                        borderRadius: '50%',
                                        border: '1px solid var(--mantine-color-body)',
                                    }}
                                />
                            )}
                        </ActionIcon>
                    </Indicator>
                </Tooltip>
            </Popover.Target>

            <Popover.Dropdown p={0}>
                <NotificationList
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onClose={() => setOpened(false)}
                />
            </Popover.Dropdown>
        </Popover>
    );
};
