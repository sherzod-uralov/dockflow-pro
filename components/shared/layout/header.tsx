"use client";

import {
  Group,
  Box,
  ActionIcon,
  Menu,
  Avatar,
  Text,
  Divider,
  Skeleton,
  Indicator,
  Tooltip,
} from "@mantine/core";
import {
  IconMenu2,
  IconSettings,
  IconUser,
  IconLogout,
  IconBell,
  IconHelp,
} from "@tabler/icons-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useGetProfileQuery, useLogoutMutation } from "@/features/login/hook/login.hook";
import { useRouter, usePathname } from "next/navigation";
import { GlobalSearch } from "@/components/shared/layout/global-search";
import Cookie from "js-cookie";
import { TourSettingsButton } from "@/hooks/use-onboarding";
import { NotificationBell } from "@/components/shared/notification-bell";
import { useOnlineUsers } from "@/hooks/socket";
import { Popover, ScrollArea } from "@mantine/core";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data, isLoading } = useGetProfileQuery();
  const router = useRouter();
  const logOutMutation = useLogoutMutation();
  const { onlineUsers } = useOnlineUsers();

  if (isLoading || !data) {
    return (
      <Box
        component="header"
        px="md"
        py="sm"
        style={{
          borderBottom: "1px solid #e9ecef",
          backgroundColor: "#fff",
        }}
      >
        <Group justify="space-between">
          <Skeleton height={36} width={280} radius="sm" />
          <Group gap="sm">
            <Skeleton height={32} width={32} radius="sm" />
            <Skeleton height={32} width={32} radius="sm" />
          </Group>
        </Group>
      </Box>
    );
  }

  const fullName = data.fullname;
  const email = `@${data.username}`;
  const initials = fullName
    ? fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "FN";

  const handleProfileClick = () => {
    router.push("/dashboard/setting/profile");
  };

  const handleLogout = () => {
    logOutMutation.mutate();
    Cookie.remove("accessToken");
    router.push("/login");
  };

  return (
    <Box
      component="header"
      px="md"
      py="sm"
      style={{
        borderBottom: "1px solid var(--mantine-color-default-border)",
        backgroundColor: "var(--mantine-color-body)",
      }}
      data-tour="header"
    >
      <Group justify="space-between">
        <Group gap="md">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            radius="sm"
            onClick={onMenuClick}
            hiddenFrom="lg"
          >
            <IconMenu2 size={20} stroke={1.5} />
          </ActionIcon>

          <Box data-tour="global-search">
            <GlobalSearch />
          </Box>
        </Group>

        <Group gap="xs">
          {/* Online Users */}
          <Popover width={300} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Box style={{ cursor: "pointer" }}>
                <Avatar.Group spacing="sm">
                  {onlineUsers.slice(0, 3).map((user) => (
                    <Tooltip key={user.id} label={user.fullname} withArrow>
                      <Avatar src={user.avatarUrl} radius="xl" size="md" color="blue">
                        {user.fullname
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </Avatar>
                    </Tooltip>
                  ))}
                  {onlineUsers.length > 3 && (
                    <Avatar radius="xl" size="md">
                      +{onlineUsers.length - 3}
                    </Avatar>
                  )}
                </Avatar.Group>
              </Box>
            </Popover.Target>
            <Popover.Dropdown p={0}>
              <Box p="xs" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                <Text size="sm" fw={600}>
                  Online foydalanuvchilar ({onlineUsers.length})
                </Text>
              </Box>
              <ScrollArea h={300} type="auto" offsetScrollbars>
                <Box p="xs">
                  {onlineUsers.map((user) => (
                    <Group key={user.id} mb="sm" wrap="nowrap" w="100%">
                      <Avatar src={user.avatarUrl} radius="xl" size="sm" color="blue">
                        {user.fullname
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </Avatar>
                      <Box style={{ flex: 1, overflow: "hidden" }}>
                        <Text size="sm" fw={500} lineClamp={1}>
                          {user.fullname}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          @{user.username}
                        </Text>
                      </Box>
                      <Indicator color="green" size={8} processing />
                    </Group>
                  ))}
                </Box>
              </ScrollArea>
            </Popover.Dropdown>
          </Popover>

          <Divider orientation="vertical" />

          {/* Bildirishnomalar */}
          <NotificationBell />

          {/* Tanishuv sozlamalari */}
          <TourSettingsButton />

          {/* <Box data-tour="theme-toggle">
            <ThemeToggle />
          </Box> */}

          <Menu shadow="sm" width={200} position="bottom-end" radius="sm">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="lg" radius="sm" p={4}>
                <Avatar
                  size={28}
                  radius="sm"
                  src={data.avatarUrl}
                  alt={fullName}
                  color="blue"
                  styles={{
                    root: {
                      backgroundColor: "#1e3a5f",
                    },
                  }}
                >
                  <Text size="xs" c="white" fw={500}>
                    {initials}
                  </Text>
                </Avatar>
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Box px="sm" py="xs">
                <Text size="sm" fw={500} c="dark">
                  {fullName}
                </Text>
                <Text size="xs" c="dimmed">
                  {email}
                </Text>
              </Box>

              <Divider my={4} />

              <Menu.Item
                leftSection={<IconUser size={16} stroke={1.5} />}
                onClick={handleProfileClick}
              >
                Profil
              </Menu.Item>

              <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />}>
                Sozlamalar
              </Menu.Item>

              <Divider my={4} />

              <Menu.Item
                leftSection={<IconLogout size={16} stroke={1.5} />}
                color="red"
                onClick={handleLogout}
              >
                Chiqish
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Box>
  );
}
