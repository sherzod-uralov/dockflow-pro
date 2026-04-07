"use client";

import { Group, Avatar, Box, Text, Paper, ActionIcon, Menu, Image, Badge, Tooltip } from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconCornerDownRight,
  IconCheck,
  IconChecks,
  IconClock,
  IconAlertCircle,
  IconDownload,
  IconFile,
  IconPlayerPlay,
  IconMoodPlus,
  IconArrowForwardUp,
} from "@tabler/icons-react";
import { ChatMessage, ChatReaction } from "../type/chat.type";
import Link from "next/link";
import { VoicePlayer } from "./voice-player";

interface Props {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
  currentUserId: string;
  onEdit?: (msg: ChatMessage) => void;
  onDelete?: (msg: ChatMessage) => void;
  onReply?: (msg: ChatMessage) => void;
  onForward?: (msg: ChatMessage) => void;
  onAddReaction?: (msg: ChatMessage, emoji: string) => void;
  onRemoveReaction?: (msg: ChatMessage, emoji: string) => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const formatDuration = (sec?: number) => {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((n) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2);

// Group reactions by emoji
const groupReactions = (reactions?: ChatReaction[]) => {
  if (!reactions || reactions.length === 0) return [];
  const map = new Map<string, { emoji: string; count: number; userIds: string[] }>();
  for (const r of reactions) {
    const existing = map.get(r.emoji);
    if (existing) {
      existing.count++;
      existing.userIds.push(r.userId);
    } else {
      map.set(r.emoji, { emoji: r.emoji, count: 1, userIds: [r.userId] });
    }
  }
  return Array.from(map.values());
};

const RefSnapshotCard = ({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) => {
  const ref = msg.refSnapshot;
  if (!ref) return null;

  const cardBg = isOwn ? "rgba(255,255,255,0.15)" : "#fff";
  const textColor = isOwn ? "#fff" : "#212529";
  const subColor = isOwn ? "rgba(255,255,255,0.7)" : "#868e96";

  if (msg.refType === "workflow") {
    return (
      <Paper p="xs" mb={6} radius="sm" style={{ backgroundColor: cardBg, border: `1px solid ${isOwn ? "rgba(255,255,255,0.2)" : "#e9ecef"}` }}>
        <Group gap={6} mb={2}>
          <Badge size="xs" variant="light" color="violet">Jarayon</Badge>
          {ref.status && <Badge size="xs" variant="light" color="blue">{ref.status}</Badge>}
        </Group>
        <Text size="sm" fw={600} c={textColor} lineClamp={1}>
          {ref.document?.title || "Workflow"}
        </Text>
        {ref.document?.documentNumber && (
          <Text size="xs" c={subColor}>{ref.document.documentNumber}</Text>
        )}
        {ref.url && (
          <Link href={ref.url} style={{ textDecoration: "none" }}>
            <Text size="xs" c={isOwn ? "#74c0fc" : "#1e3a5f"} fw={500} mt={4}>
              Ochish →
            </Text>
          </Link>
        )}
      </Paper>
    );
  }

  if (msg.refType === "document") {
    return (
      <Paper p="xs" mb={6} radius="sm" style={{ backgroundColor: cardBg, border: `1px solid ${isOwn ? "rgba(255,255,255,0.2)" : "#e9ecef"}` }}>
        <Group gap={6} mb={2}>
          <Badge size="xs" variant="light" color="indigo">Hujjat</Badge>
          {ref.status && <Badge size="xs" variant="light" color="blue">{ref.status}</Badge>}
        </Group>
        <Text size="sm" fw={600} c={textColor} lineClamp={1}>
          {ref.title || "Hujjat"}
        </Text>
        {ref.documentNumber && (
          <Text size="xs" c={subColor}>{ref.documentNumber}</Text>
        )}
        {ref.url && (
          <Link href={ref.url} style={{ textDecoration: "none" }}>
            <Text size="xs" c={isOwn ? "#74c0fc" : "#1e3a5f"} fw={500} mt={4}>
              Ochish →
            </Text>
          </Link>
        )}
      </Paper>
    );
  }

  if (msg.refType === "task") {
    return (
      <Paper p="xs" mb={6} radius="sm" style={{ backgroundColor: cardBg, border: `1px solid ${isOwn ? "rgba(255,255,255,0.2)" : "#e9ecef"}` }}>
        <Group gap={6} mb={2}>
          <Badge size="xs" variant="light" color="blue">Vazifa</Badge>
          {ref.ref && <Text size="xs" c={subColor} fw={600}>{ref.ref}</Text>}
        </Group>
        <Text size="sm" fw={600} c={textColor} lineClamp={1}>
          {ref.title || "Vazifa"}
        </Text>
        <Group gap={4} mt={2}>
          {ref.priority && <Badge size="xs" variant="light" color="orange">{ref.priority}</Badge>}
          {ref.score != null && <Badge size="xs" variant="light" color="green">{ref.score} ball</Badge>}
        </Group>
        {ref.url && (
          <Link href={ref.url} style={{ textDecoration: "none" }}>
            <Text size="xs" c={isOwn ? "#74c0fc" : "#1e3a5f"} fw={500} mt={4}>
              Ochish →
            </Text>
          </Link>
        )}
      </Paper>
    );
  }

  return null;
};

const MediaContent = ({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) => {
  const subColor = isOwn ? "rgba(255,255,255,0.7)" : "#868e96";
  const textColor = isOwn ? "#fff" : "#212529";

  switch (msg.type) {
    case "IMAGE":
      return (
        <Box mb={msg.content ? 6 : 0}>
          <Image
            src={msg.fileUrl}
            alt={msg.fileName || "image"}
            radius="sm"
            style={{ maxWidth: 280, maxHeight: 320, cursor: "pointer" }}
            onClick={() => msg.fileUrl && window.open(msg.fileUrl, "_blank")}
          />
        </Box>
      );

    case "VIDEO":
      return (
        <Box mb={msg.content ? 6 : 0}>
          <video
            src={msg.fileUrl}
            controls
            style={{ maxWidth: 280, maxHeight: 320, borderRadius: 6 }}
          />
        </Box>
      );

    case "VOICE":
      return msg.fileUrl ? (
        <Box mb={msg.content ? 6 : 0}>
          <VoicePlayer src={msg.fileUrl} duration={msg.duration} isOwn={isOwn} />
        </Box>
      ) : null;

    case "FILE":
      return (
        <Box
          mb={msg.content ? 6 : 0}
          p={8}
          style={{
            backgroundColor: isOwn ? "rgba(255,255,255,0.15)" : "#fff",
            border: `1px solid ${isOwn ? "rgba(255,255,255,0.2)" : "#e9ecef"}`,
            borderRadius: 6,
            cursor: "pointer",
          }}
          onClick={() => msg.fileUrl && window.open(msg.fileUrl, "_blank")}
        >
          <Group gap="sm" wrap="nowrap">
            <Box
              p={6}
              style={{
                backgroundColor: isOwn ? "rgba(255,255,255,0.2)" : "#e7f5ff",
                borderRadius: 6,
              }}
            >
              <IconFile size={20} color={isOwn ? "#fff" : "#1e3a5f"} />
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} c={textColor} lineClamp={1}>
                {msg.fileName || "Fayl"}
              </Text>
              <Text size="xs" c={subColor}>
                {formatBytes(msg.fileSize)}
              </Text>
            </Box>
            <IconDownload size={16} color={subColor} />
          </Group>
        </Box>
      );

    default:
      return null;
  }
};

export const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  showSenderName = false,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
  onForward,
  onAddReaction,
  onRemoveReaction,
}: Props) => {
  const isPending = message.pending;
  const isFailed = message.failed;
  const isRead = !!message.reads && message.reads.length > 0;
  const groupedReactions = groupReactions(message.reactions);
  const hasMedia = ["IMAGE", "VIDEO", "VOICE", "FILE"].includes(message.type);

  const bubbleBg = isOwn ? "#1e3a5f" : "#fff";
  const textColor = isOwn ? "#fff" : "#212529";
  const subTextColor = isOwn ? "rgba(255,255,255,0.7)" : "#868e96";

  const handleReactionClick = (emoji: string, hasMine: boolean) => {
    if (hasMine) {
      onRemoveReaction?.(message, emoji);
    } else {
      onAddReaction?.(message, emoji);
    }
  };

  return (
    <Group
      gap={6}
      align="flex-end"
      wrap="nowrap"
      justify={isOwn ? "flex-end" : "flex-start"}
      style={{
        marginBottom: 4,
        animation: isOwn ? "msgSlideInRight 0.18s ease-out" : "msgSlideInLeft 0.18s ease-out",
      }}
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
          p={hasMedia && !message.content ? 4 : 8}
          radius="md"
          style={{
            backgroundColor: bubbleBg,
            border: !isOwn ? "1px solid #e9ecef" : "none",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {/* Forward attribution */}
          {message.forwardedFrom && (
            <Box mb={6} pl={6} style={{ borderLeft: `2px solid ${isOwn ? "#fff" : "#1e3a5f"}` }}>
              <Text size="xs" c={subTextColor} fw={500}>
                Yo'naltirildi
              </Text>
              <Text size="xs" c={isOwn ? "#fff" : "#1e3a5f"} fw={600}>
                {message.forwardedFrom.user.fullname}
                {message.forwardedFrom.chat && (
                  <Text span size="xs" c={subTextColor} fw={400}>
                    {" "}— {message.forwardedFrom.chat.title}
                  </Text>
                )}
              </Text>
            </Box>
          )}

          {/* Reply preview */}
          {message.replyTo && (
            <Box
              mb={6}
              p={6}
              style={{
                borderLeft: `2px solid ${isOwn ? "#fff" : "#1e3a5f"}`,
                backgroundColor: isOwn ? "rgba(255,255,255,0.1)" : "#f1f3f5",
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

          {/* RefSnapshot (forward) */}
          {message.refSnapshot && <RefSnapshotCard msg={message} isOwn={isOwn} />}

          {/* Media */}
          {hasMedia && <MediaContent msg={message} isOwn={isOwn} />}

          {/* Text content */}
          {message.content && (
            <Text
              size="sm"
              c={textColor}
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {message.content}
            </Text>
          )}

          {/* Footer */}
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
                  <IconChecks size={14} color="#74c0fc" />
                ) : (
                  <IconCheck size={12} />
                )}
              </Box>
            )}
          </Group>
        </Paper>

        {/* Reactions */}
        {groupedReactions.length > 0 && (
          <Group gap={4} mt={4} justify={isOwn ? "flex-end" : "flex-start"}>
            {groupedReactions.map((r) => {
              const hasMine = r.userIds.includes(currentUserId);
              return (
                <Box
                  key={r.emoji}
                  onClick={() => handleReactionClick(r.emoji, hasMine)}
                  style={{
                    cursor: "pointer",
                    padding: "2px 6px",
                    borderRadius: 12,
                    backgroundColor: hasMine ? "#e7f5ff" : "#f1f3f5",
                    border: hasMine ? "1px solid #1e3a5f" : "1px solid transparent",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>{r.emoji}</span>
                  <span style={{ color: hasMine ? "#1e3a5f" : "#495057", fontWeight: 500 }}>
                    {r.count}
                  </span>
                </Box>
              );
            })}
          </Group>
        )}
      </Box>

      {!isPending && !isFailed && (
        <Group gap={2} align="center" style={{ alignSelf: "center" }}>
          {/* Quick reaction picker */}
          {onAddReaction && (
            <Menu shadow="md" position={isOwn ? "bottom-end" : "bottom-start"} withinPortal>
              <Menu.Target>
                <ActionIcon variant="subtle" size="xs" color="gray" style={{ opacity: 0.5 }}>
                  <IconMoodPlus size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown p={6}>
                <Group gap={4}>
                  {QUICK_REACTIONS.map((emoji) => (
                    <Box
                      key={emoji}
                      onClick={() => onAddReaction(message, emoji)}
                      style={{
                        cursor: "pointer",
                        fontSize: 20,
                        padding: 4,
                        borderRadius: 4,
                      }}
                    >
                      {emoji}
                    </Box>
                  ))}
                </Group>
              </Menu.Dropdown>
            </Menu>
          )}

          {/* Actions menu */}
          <Menu shadow="md" width={150} position={isOwn ? "bottom-end" : "bottom-start"} withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" size="xs" color="gray" style={{ opacity: 0.5 }}>
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {onReply && (
                <Menu.Item leftSection={<IconCornerDownRight size={14} />} onClick={() => onReply(message)}>
                  Javob berish
                </Menu.Item>
              )}
              {onForward && (
                <Menu.Item leftSection={<IconArrowForwardUp size={14} />} onClick={() => onForward(message)}>
                  Forward
                </Menu.Item>
              )}
              {isOwn && onEdit && message.type === "TEXT" && (
                <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(message)}>
                  Tahrirlash
                </Menu.Item>
              )}
              {onDelete && (
                <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete(message)}>
                  O'chirish
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      )}
    </Group>
  );
};
