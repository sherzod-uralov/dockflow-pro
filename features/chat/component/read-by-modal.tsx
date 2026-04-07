"use client";

import { Stack, Group, Avatar, Text, Center, Loader, ScrollArea, Box } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useGetMessageReads } from "../hook/chat.hook";

interface Props {
  messageId: string;
}

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((n) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2);

const formatRelative = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "Hozir";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return date.toLocaleDateString("uz-UZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

export const ReadByModal = ({ messageId }: Props) => {
  const { data, isLoading } = useGetMessageReads(messageId);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" color="#1e3a5f" />
      </Center>
    );
  }

  const reads = data?.reads || [];

  if (reads.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <Box p={12} style={{ backgroundColor: "#f1f3f5", borderRadius: 12 }}>
            <IconEye size={28} color="#868e96" stroke={1.5} />
          </Box>
          <Text size="sm" c="dimmed">
            Hali hech kim o'qimagan
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <ScrollArea h={400}>
      <Stack gap={4}>
        <Text size="xs" c="dimmed" mb={4}>
          {reads.length} ta foydalanuvchi o'qigan
        </Text>
        {reads.map((entry) => (
          <Group key={entry.userId} p="xs" gap="sm" style={{ borderRadius: 6 }}>
            <Avatar size="sm" radius="xl" src={entry.user.avatarUrl}>
              {getInitials(entry.user.fullname)}
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                {entry.user.fullname}
              </Text>
              <Text size="xs" c="dimmed">
                {formatRelative(entry.readAt)}
              </Text>
            </Box>
          </Group>
        ))}
      </Stack>
    </ScrollArea>
  );
};
