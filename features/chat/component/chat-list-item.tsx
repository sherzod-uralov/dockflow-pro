"use client";

import { Group, Avatar, Box, Text, Badge, Indicator } from "@mantine/core";
import { IconPin, IconUsers } from "@tabler/icons-react";
import { ChatListItem as ChatListItemType } from "../type/chat.type";

interface Props {
  chat: ChatListItemType;
  isActive: boolean;
  onClick: () => void;
}

const formatTime = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) {
    return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  }
  const months = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];
  return `${date.getDate()}-${months[date.getMonth()]}`;
};

const getInitials = (name: string) =>
  name?.split(" ").map((n) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2) || "?";

export const ChatListItemView = ({ chat, isActive, onClick }: Props) => {
  const isGroup = chat.type === "GROUP";
  const lastMsg = chat.lastMessage;
  const preview = lastMsg
    ? lastMsg.type === "TEXT"
      ? lastMsg.content
      : lastMsg.type === "IMAGE"
      ? "📷 Rasm"
      : lastMsg.type === "VIDEO"
      ? "🎬 Video"
      : lastMsg.type === "VOICE"
      ? "🎤 Ovozli xabar"
      : lastMsg.type === "FILE"
      ? "📎 Fayl"
      : lastMsg.content || "Xabar"
    : "Hali xabar yo'q";

  return (
    <Box
      p="sm"
      onClick={onClick}
      style={{
        cursor: "pointer",
        backgroundColor: isActive ? "#e7f5ff" : "transparent",
        borderLeft: isActive ? "3px solid #1e3a5f" : "3px solid transparent",
        transition: "background-color 0.15s",
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <Indicator
          disabled={!chat.unreadCount}
          label={chat.unreadCount}
          size={16}
          color="#1e3a5f"
          offset={4}
        >
          <Avatar
            size="md"
            radius="xl"
            src={chat.avatarUrl || chat.peer?.avatarUrl}
            style={{ backgroundColor: isGroup ? "#fff3e0" : "#e7f5ff" }}
          >
            {isGroup ? <IconUsers size={20} color="#f39c12" /> : getInitials(chat.title)}
          </Avatar>
        </Indicator>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" gap={4} wrap="nowrap">
            <Group gap={4} style={{ minWidth: 0 }}>
              {chat.isPinned && <IconPin size={12} color="#868e96" />}
              <Text size="sm" fw={600} c="#212529" lineClamp={1}>
                {chat.title}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
              {formatTime(chat.lastMessageAt)}
            </Text>
          </Group>
          <Group justify="space-between" gap={4} mt={2} wrap="nowrap">
            <Text size="xs" c="dimmed" lineClamp={1} style={{ flex: 1 }}>
              {isGroup && lastMsg?.sender && (
                <Text span fw={500} c="#495057">
                  {lastMsg.sender.fullname.split(" ")[0]}:{" "}
                </Text>
              )}
              {preview}
            </Text>
          </Group>
        </Box>
      </Group>
    </Box>
  );
};
