"use client";

import { useState } from "react";
import {
  Stack,
  TextInput,
  ScrollArea,
  Loader,
  Center,
  Group,
  Avatar,
  Box,
  Text,
  Badge,
} from "@mantine/core";
import { IconSearch, IconUsers } from "@tabler/icons-react";
import { useDebounce } from "@/hooks/use-debaunce";
import { useSearchMessages } from "../hook/chat.hook";
import { formatDate } from "@/lib/date-utils";
import { colors } from "@/lib/colors";

interface Props {
  chatId?: string;
  onSelect: (chatId: string, messageId: string) => void;
  placeholder?: string;
}

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((n) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2);


export const ChatSearchModal = ({ chatId, onSelect, placeholder }: Props) => {
  const [query, debouncedQuery, setQuery] = useDebounce("", 300);
  const { data, isLoading } = useSearchMessages(debouncedQuery, chatId);

  const messages = data?.messages || [];

  return (
    <Stack gap="sm">
      <TextInput
        placeholder={placeholder || "Xabar matni yoki fayl nomi..."}
        leftSection={<IconSearch size={14} />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        size="sm"
        autoFocus
      />

      {debouncedQuery.length < 2 && (
        <Center py="xl">
          <Text size="sm" c="dimmed">
            Kamida 2 ta belgi kiriting
          </Text>
        </Center>
      )}

      {debouncedQuery.length >= 2 && isLoading && (
        <Center py="xl">
          <Loader size="sm" color={colors.primary} />
        </Center>
      )}

      {debouncedQuery.length >= 2 && !isLoading && messages.length === 0 && (
        <Center py="xl">
          <Text size="sm" c="dimmed">
            Hech narsa topilmadi
          </Text>
        </Center>
      )}

      {messages.length > 0 && (
        <ScrollArea h={400}>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {messages.length} ta natija
            </Text>
            {messages.map((msg) => {
              const chat = (msg as any).chat;
              const isGroup = chat?.type === "GROUP";
              return (
                <Group
                  key={msg.id}
                  p="xs"
                  gap="sm"
                  style={{
                    cursor: "pointer",
                    borderRadius: 6,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.white,
                  }}
                  onClick={() => onSelect(msg.chatId, msg.id)}
                >
                  <Avatar
                    size="sm"
                    radius="xl"
                    style={{ backgroundColor: isGroup ? colors.warningBg : colors.primaryLight }}
                  >
                    {isGroup ? (
                      <IconUsers size={14} color={colors.warning} />
                    ) : (
                      getInitials(msg.sender.fullname)
                    )}
                  </Avatar>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Group justify="space-between" gap={4}>
                      <Text size="sm" fw={600} c={colors.textPrimary} lineClamp={1}>
                        {chat?.title || msg.sender.fullname}
                      </Text>
                      <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                        {formatDate(msg.createdAt)}
                      </Text>
                    </Group>
                    <Text size="xs" c={colors.textSecondary} lineClamp={1}>
                      {msg.type === "TEXT" ? msg.content : msg.fileName || msg.type}
                    </Text>
                  </Box>
                  {msg.type !== "TEXT" && (
                    <Badge size="xs" variant="light" color="gray">
                      {msg.type}
                    </Badge>
                  )}
                </Group>
              );
            })}
          </Stack>
        </ScrollArea>
      )}
    </Stack>
  );
};
