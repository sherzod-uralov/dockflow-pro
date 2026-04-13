"use client";

import { Group, Avatar, Box, Text, Indicator, Menu, ActionIcon } from "@mantine/core";
import {
  IconPin,
  IconPinFilled,
  IconUsers,
  IconBellOff,
  IconArchive,
  IconArchiveOff,
  IconDots,
  IconVolume,
  IconPhone,
  IconBan,
  IconEraser,
} from "@tabler/icons-react";
import { ChatListItem as ChatListItemType } from "../type/chat.type";
import {
  useMuteChat,
  usePinChat,
  useArchiveChat,
  useBlockUser,
  useClearChatHistory,
} from "../hook/chat.hook";
import { useChatCall } from "../hook/use-chat-call";
import { useUserPresence } from "../hook/use-presence";
import { colors } from "@/lib/colors";

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

const isMuted = (mutedUntil?: string | null) => {
  if (!mutedUntil) return false;
  return new Date(mutedUntil).getTime() > Date.now();
};

export const ChatListItemView = ({ chat, isActive, onClick }: Props) => {
  const isGroup = chat.type === "GROUP";
  const lastMsg = chat.lastMessage;
  const muted = isMuted(chat.mutedUntil);

  const muteMutation = useMuteChat();
  const pinMutation = usePinChat();
  const archiveMutation = useArchiveChat();
  const blockMutation = useBlockUser();
  const clearHistoryMutation = useClearChatHistory();
  const { startCall, activeCall } = useChatCall();
  const peerPresence = useUserPresence(chat.peer?.id);
  const isPeerOnline = peerPresence?.isOnline ?? chat.peer?.isOnline ?? false;

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

  const handleMute = (durationHours: number | null) => {
    const mutedUntil = durationHours
      ? new Date(Date.now() + durationHours * 3600 * 1000).toISOString()
      : null;
    muteMutation.mutate({ id: chat.id, mutedUntil });
  };

  return (
    <Box
      p="sm"
      onClick={onClick}
      className="chat-list-item"
      style={{
        cursor: "pointer",
        backgroundColor: isActive ? colors.primaryLight : "transparent",
        borderLeft: isActive ? `3px solid ${colors.primary}` : "3px solid transparent",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
        position: "relative",
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <Box style={{ position: "relative" }}>
          <Indicator
            disabled={!chat.unreadCount}
            label={chat.unreadCount}
            size={16}
            color=colors.primary
            offset={4}
          >
            <Avatar
              size="md"
              radius="xl"
              src={chat.avatarUrl || chat.peer?.avatarUrl}
              style={{ backgroundColor: isGroup ? colors.warningBg : colors.primaryLight }}
            >
              {isGroup ? <IconUsers size={20} color=colors.warning /> : getInitials(chat.title)}
            </Avatar>
          </Indicator>
          {!isGroup && isPeerOnline && (
            <Box
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: colors.success,
                border: "2px solid #fff",
                zIndex: 2,
              }}
            />
          )}
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" gap={4} wrap="nowrap">
            <Group gap={4} style={{ minWidth: 0 }}>
              {chat.isPinned && <IconPinFilled size={12} color=colors.primary />}
              {muted && <IconBellOff size={12} color={colors.textDimmed} />}
              <Text size="sm" fw={600} c={colors.textPrimary} lineClamp={1}>
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
                <Text span fw={500} c={colors.textSecondary}>
                  {lastMsg.sender.fullname.split(" ")[0]}:{" "}
                </Text>
              )}
              {preview}
            </Text>
            <Menu shadow="md" width={180} position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  size="xs"
                  color="gray"
                  style={{ opacity: 0.5, flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDots size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                {!isGroup && chat.peer && !activeCall && (
                  <>
                    <Menu.Item
                      leftSection={<IconPhone size={14} color=colors.success />}
                      onClick={() =>
                        startCall({
                          chatId: chat.id,
                          targetUserId: chat.peer!.id,
                          peerName: chat.peer!.fullname,
                          peerAvatar: chat.peer!.avatarUrl || undefined,
                        })
                      }
                    >
                      Audio qo'ng'iroq
                    </Menu.Item>
                    <Menu.Divider />
                  </>
                )}
                <Menu.Item
                  leftSection={chat.isPinned ? <IconPin size={14} /> : <IconPinFilled size={14} />}
                  onClick={() => pinMutation.mutate({ id: chat.id, pinned: !chat.isPinned })}
                >
                  {chat.isPinned ? "Pinni olib tashlash" : "Pin qilish"}
                </Menu.Item>
                {muted ? (
                  <Menu.Item
                    leftSection={<IconVolume size={14} />}
                    onClick={() => handleMute(null)}
                  >
                    Ovozni yoqish
                  </Menu.Item>
                ) : (
                  <Menu.Sub>
                    <Menu.Sub.Target>
                      <Menu.Sub.Item leftSection={<IconBellOff size={14} />}>
                        Ovozsiz qilish
                      </Menu.Sub.Item>
                    </Menu.Sub.Target>
                    <Menu.Sub.Dropdown>
                      <Menu.Item onClick={() => handleMute(1)}>1 soat</Menu.Item>
                      <Menu.Item onClick={() => handleMute(8)}>8 soat</Menu.Item>
                      <Menu.Item onClick={() => handleMute(24)}>1 kun</Menu.Item>
                      <Menu.Item onClick={() => handleMute(24 * 7)}>1 hafta</Menu.Item>
                      <Menu.Item onClick={() => handleMute(24 * 365 * 100)}>
                        To'xtatilgunga qadar
                      </Menu.Item>
                    </Menu.Sub.Dropdown>
                  </Menu.Sub>
                )}
                <Menu.Divider />
                <Menu.Item
                  leftSection={
                    chat.isArchived ? <IconArchiveOff size={14} /> : <IconArchive size={14} />
                  }
                  onClick={() =>
                    archiveMutation.mutate({ id: chat.id, archived: !chat.isArchived })
                  }
                >
                  {chat.isArchived ? "Arxivdan chiqarish" : "Arxivlash"}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEraser size={14} />}
                  onClick={() => {
                    if (confirm("Tarixni tozalashni xohlaysizmi?")) {
                      clearHistoryMutation.mutate(chat.id);
                    }
                  }}
                >
                  Tarixni tozalash
                </Menu.Item>
                {!isGroup && chat.peer && (
                  <Menu.Item
                    leftSection={<IconBan size={14} />}
                    color="red"
                    onClick={() => {
                      if (confirm(`${chat.peer!.fullname} ni bloklashni xohlaysizmi?`)) {
                        blockMutation.mutate(chat.peer!.id);
                      }
                    }}
                  >
                    Bloklash
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Box>
      </Group>
    </Box>
  );
};
