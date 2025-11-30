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

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data, isLoading } = useGetProfileQuery();
  const router = useRouter();
  const logOutMutation = useLogoutMutation();

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
          {/* Bildirishnomalar */}
          <Indicator size={8} color="red" offset={4} disabled>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="sm">
              <IconBell size={20} stroke={1.5} />
            </ActionIcon>
          </Indicator>

          {/* Tanishuv sozlamalari */}
          <TourSettingsButton />

          <Box data-tour="theme-toggle">
            <ThemeToggle />
          </Box>

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
