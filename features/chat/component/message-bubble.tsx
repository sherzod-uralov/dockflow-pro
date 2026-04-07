"use client";

import { Group, Avatar, Box, Text, Paper, ActionIcon, Menu } from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconCornerDownRight,
  IconCheck,
  IconChecks,
  IconClock,
  IconAlertCircle,
} from "@tabler/icons-react";
import { ChatMessage } from "../type/chat.type";

interface Props {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
  onEdit?: (msg: ChatMessage) => void;
  onDelete?: (msg: ChatMessage) => void;
  onReply?: (msg: ChatMessage) => void;
}

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
};

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((n) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2);

export const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  showSenderName = false,
  onEdit,
  onDelete,
  onReply,
}: Props) => {
  const isPending = message.pending;
  const isFailed = message.failed;
  const isRead = !!message.reads && message.reads.length > 0;

  const bubbleBg = isOwn ? "#1e3a5f" : "#f1f3f5";
  const textColor = isOwn ? "#fff" : "#212529";
  const subTextColor = isOwn ? "rgba(255,255,255,0.7)" : "#868e96";

  return (
    <Group
      gap={6}
      align="flex-end"
      wrap="nowrap"
      justify={isOwn ? "flex-end" : "flex-start"}
      style={{ marginBottom: 4 }}
    >
      {!isOwn && showAvatar && (
        <Avatar
          size="sm"
          radius="xl"
          src={message.sender.avatarUrl}
          style={{ flexShrink: 0, alignSelf: "flex-end" }}
        >
          {getInitials(message.sender.fullname)}
        </Avatar>
      )}
      {!isOwn && !showAvatar && <Box w={28} style={{ flexShrink: 0 }} />}

      <Box style={{ maxWidth: "70%", minWidth: 0 }}>
        {showSenderName && !isOwn && (
          <Text size="xs" fw={600} c="#1e3a5f" mb={2} ml={6}>
            {message.sender.fullname}
          </Text>
        )}

        <Paper
          p={8}
          radius="md"
          style={{
            backgroundColor: bubbleBg,
            position: "relative",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {/* Reply preview */}
          {message.replyTo && (
            <Box
              mb={6}
              p={6}
              style={{
                borderLeft: `2px solid ${isOwn ? "#fff" : "#1e3a5f"}`,
                backgroundColor: isOwn ? "rgba(255,255,255,0.1)" : "#fff",
                borderRadius: 4,
              }}
            >
              <Text size="xs" fw={600} c={isOwn ? "#fff" : "#1e3a5f"}>
                {message.replyTo.sender.fullname}
              </Text>
              <Text size="xs" c={subTextColor} lineClamp={2}>
                {message.replyTo.content}
              </Text>
            </Box>
          )}

          {/* Content */}
          <Text
            size="sm"
            c={textColor}
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {message.content}
          </Text>

          {/* Footer: time + status */}
          <Group gap={4} justify="flex-end" mt={2}>
            {message.editedAt && (
              <Text size="xs" c={subTextColor} fs="italic">
                tahrirlangan
              </Text>
            )}
            <Text size="xs" c={subTextColor}>
              {formatTime(message.createdAt)}
            </Text>
            {isOwn && (
              <Box style={{ color: subTextColor, display: "flex", alignItems: "center" }}>
                {isFailed ? (
                  <IconAlertCircle size={12} color="#ff6b6b" />
                ) : isPending ? (
                  <IconClock size={12} />
                ) : isRead ? (
                  <IconChecks size={14} color={isOwn ? "#74c0fc" : undefined} />
                ) : (
                  <IconCheck size={12} />
                )}
              </Box>
            )}
          </Group>
        </Paper>
      </Box>

      {!isPending && !isFailed && (onEdit || onDelete || onReply) && (
        <Menu shadow="md" width={150} position={isOwn ? "bottom-end" : "bottom-start"} withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              size="xs"
              color="gray"
              style={{ alignSelf: "center", opacity: 0.5 }}
            >
              <IconDots size={14} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {onReply && (
              <Menu.Item
                leftSection={<IconCornerDownRight size={14} />}
                onClick={() => onReply(message)}
              >
                Javob berish
              </Menu.Item>
            )}
            {isOwn && onEdit && message.type === "TEXT" && (
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(message)}>
                Tahrirlash
              </Menu.Item>
            )}
            {(isOwn || onDelete) && onDelete && (
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => onDelete(message)}
              >
                O'chirish
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  );
};
