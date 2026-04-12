"use client";

import { useState, useRef, useEffect } from "react";
import {
  Stack,
  Group,
  Text,
  Avatar,
  ActionIcon,
  Textarea,
  Box,
  ScrollArea,
  Loader,
  Menu,
  Paper,
  Popover,
  Tabs,
  SimpleGrid,
  Tooltip,
  Image,
} from "@mantine/core";
import {
  IconSend,
  IconDots,
  IconEdit,
  IconTrash,
  IconCornerDownRight,
  IconX,
  IconMoodSmile,
  IconPaperclip,
  IconMicrophone,
  IconFile,
  IconDownload,
  IconPhoto,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
} from "@tabler/icons-react";
import {
  useGetAllTaskComments,
  useCreateTaskComment,
  useUpdateTaskComment,
  useDeleteTaskComment,
} from "../hook/task-comment.hook";
import { useCreateAttachment } from "@/features/attachment/hook/attachment.hook";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";
import {
  GuardedMenuItem,
  usePermissionCheck,
} from "@/components/shared/permission";
import {
  TaskCommentGetResponse,
  CommentAttachment,
  CommentReplyTo,
} from "../type/task-comment.type";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";
import { colors } from "@/lib/colors";

interface TaskCommentsInlineProps {
  taskId: string;
}

// ============================================================================
// Emoji Data
// ============================================================================

const EMOJI_CATEGORIES = {
  smileys: {
    label: "Smayliklar",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍",
      "🥰", "😘", "😗", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫",
      "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥",
      "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵",
    ],
  },
  gestures: {
    label: "Imo-ishoralar",
    icon: "👍",
    emojis: [
      "👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🤲", "🤝",
    ],
  },
  hearts: {
    label: "Yuraklar",
    icon: "❤️",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕",
      "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️", "💌", "💐", "🌹", "🥀",
    ],
  },
  objects: {
    label: "Obyektlar",
    icon: "📎",
    emojis: [
      "📎", "📌", "📍", "🔖", "📁", "📂", "📝", "✏️", "🖊️", "🖋️", "📊", "📈",
      "🔒", "🔓", "🔑", "💡", "🔦", "⏰", "🔔", "📣", "📢", "💬", "💭", "🗯️",
    ],
  },
  symbols: {
    label: "Belgilar",
    icon: "✅",
    emojis: [
      "✅", "❌", "❓", "❗", "‼️", "⁉️", "💯", "🔥", "✨", "⭐", "🌟", "💫",
      "⚡", "💥", "💢", "💦", "♻️", "⚠️", "⛔", "🚫", "➡️", "⬅️", "⬆️", "⬇️",
    ],
  },
};

// ============================================================================
// Helpers
// ============================================================================

const isOnlyEmojis = (text: string): boolean => {
  const emojiRegex = /^[\p{Emoji}\p{Emoji_Component}\s]+$/u;
  const stripped = text.replace(/\s/g, "");
  return emojiRegex.test(text) && stripped.length <= 12;
};

const isImageMime = (mime?: string) => mime?.startsWith("image/");
const isVideoMime = (mime?: string) => mime?.startsWith("video/");
const isAudioMime = (mime?: string) => mime?.startsWith("audio/");

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ============================================================================
// Emoji Picker
// ============================================================================

const EmojiPicker = ({
  onSelect,
  opened,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  opened: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState("smileys");

  return (
    <Popover opened={opened} onChange={onClose} position="top-end" width={320} shadow="md">
      <Popover.Target>
        <Tooltip label="Emoji">
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="sm"
            onClick={onClose}
            style={{ color: opened ? colors.primary : colors.textDimmed }}
          >
            <IconMoodSmile size={20} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        <Tabs value={activeTab} onChange={(v) => setActiveTab(v || "smileys")}>
          <Tabs.List grow>
            {Object.entries(EMOJI_CATEGORIES).map(([key, cat]) => (
              <Tabs.Tab key={key} value={key} p="xs" style={{ fontSize: 16 }}>
                {cat.icon}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {Object.entries(EMOJI_CATEGORIES).map(([key, cat]) => (
            <Tabs.Panel key={key} value={key}>
              <ScrollArea h={200} p="xs">
                <SimpleGrid cols={8} spacing={2}>
                  {cat.emojis.map((emoji, i) => (
                    <ActionIcon
                      key={i}
                      variant="subtle"
                      size="md"
                      radius="sm"
                      onClick={() => { onSelect(emoji); onClose(); }}
                      style={{ fontSize: 20, cursor: "pointer" }}
                    >
                      {emoji}
                    </ActionIcon>
                  ))}
                </SimpleGrid>
              </ScrollArea>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Popover.Dropdown>
    </Popover>
  );
};

// ============================================================================
// Audio Mini-Player (Telegram style)
// ============================================================================

const formatTime = (sec: number) => {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const AudioPlayer = ({ src, isOwn }: { src: string; isOwn: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const accent = isOwn ? "rgba(255,255,255,0.85)" : colors.primary;
  const trackBg = isOwn ? "rgba(255,255,255,0.2)" : colors.borderLight;
  const timColor = isOwn ? "rgba(255,255,255,0.6)" : colors.textDimmed;

  return (
    <Box mb={4}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <Group gap={8} wrap="nowrap" align="center">
        {/* Play/Pause */}
        <ActionIcon
          size={36}
          radius="xl"
          variant="transparent"
          onClick={togglePlay}
          style={{ color: accent, flexShrink: 0 }}
        >
          {isPlaying ? <IconPlayerPauseFilled size={22} /> : <IconPlayerPlayFilled size={22} />}
        </ActionIcon>

        {/* Waveform / progress bar */}
        <Box style={{ flex: 1, minWidth: 100 }}>
          <Box
            onClick={handleSeek}
            style={{
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {/* Simplified waveform bars */}
            {Array.from({ length: 32 }).map((_, i) => {
              const barPct = ((i + 1) / 32) * 100;
              const isActive = barPct <= progress;
              // Pseudo-random bar heights for waveform look
              const h = [14, 20, 10, 24, 16, 28, 12, 22, 18, 26, 8, 20, 14, 24, 10, 28,
                         16, 22, 12, 26, 18, 20, 14, 24, 10, 28, 16, 22, 12, 26, 18, 8][i];
              return (
                <Box
                  key={i}
                  style={{
                    width: 2.5,
                    height: h,
                    borderRadius: 2,
                    backgroundColor: isActive ? accent : trackBg,
                    transition: "background-color 0.1s",
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </Box>

          {/* Time */}
          <Group justify="space-between" mt={-2}>
            <Text style={{ fontSize: 10, color: timColor }}>
              {formatTime(isPlaying || currentTime > 0 ? currentTime : 0)}
            </Text>
            <Text style={{ fontSize: 10, color: timColor }}>
              {formatTime(duration)}
            </Text>
          </Group>
        </Box>
      </Group>
    </Box>
  );
};

// ============================================================================
// Attachment Preview (inside bubble)
// ============================================================================

const AttachmentPreview = ({ att, isOwn }: { att: CommentAttachment; isOwn: boolean }) => {
  const file = att.attachment;
  if (!file) return null;

  if (isImageMime(file.mimeType)) {
    return (
      <Box mb={4} style={{ borderRadius: 8, overflow: "hidden", maxWidth: 260 }}>
        <Image
          src={file.fileUrl}
          alt={file.fileName}
          radius="sm"
          style={{ maxHeight: 200, objectFit: "cover", cursor: "pointer" }}
          onClick={() => window.open(file.fileUrl, "_blank")}
        />
      </Box>
    );
  }

  if (isVideoMime(file.mimeType)) {
    return (
      <Box mb={4} style={{ borderRadius: 8, overflow: "hidden", maxWidth: 280 }}>
        <video
          src={file.fileUrl}
          controls
          style={{ width: "100%", maxHeight: 200, borderRadius: 8 }}
        />
      </Box>
    );
  }

  if (isAudioMime(file.mimeType)) {
    return <AudioPlayer src={file.fileUrl} isOwn={isOwn} />;
  }

  // Generic file
  return (
    <Paper
      p="xs"
      mb={4}
      radius="sm"
      style={{
        backgroundColor: isOwn ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.04)",
        cursor: "pointer",
      }}
      onClick={() => window.open(file.fileUrl, "_blank")}
    >
      <Group gap="xs" wrap="nowrap">
        <IconFile size={20} color={isOwn ? "rgba(255,255,255,0.7)" : colors.textDimmed} />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" fw={500} c={isOwn ? colors.white : colors.textPrimary} lineClamp={1}>
            {file.fileName}
          </Text>
          <Text style={{ fontSize: 10 }} c={isOwn ? "rgba(255,255,255,0.5)" : colors.textMuted}>
            {formatBytes(file.fileSize)}
          </Text>
        </Box>
        <IconDownload size={14} color={isOwn ? "rgba(255,255,255,0.5)" : colors.textMuted} />
      </Group>
    </Paper>
  );
};

// ============================================================================
// Pending File Preview (before sending)
// ============================================================================

const PendingFilePreview = ({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (index: number) => void;
}) => {
  if (files.length === 0) return null;

  return (
    <Group gap={6} mb="xs" wrap="wrap">
      {files.map((file, index) => {
        const isImg = file.type.startsWith("image/");
        return (
          <Paper
            key={index}
            p={4}
            radius="sm"
            style={{
              backgroundColor: colors.bgSubtle,
              position: "relative",
              maxWidth: isImg ? 64 : 160,
            }}
          >
            {isImg ? (
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                w={56}
                h={56}
                radius="sm"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <Group gap={4} wrap="nowrap" px={4}>
                <IconFile size={14} color={colors.textDimmed} />
                <Text size="xs" lineClamp={1} style={{ maxWidth: 100 }}>
                  {file.name}
                </Text>
              </Group>
            )}
            <ActionIcon
              size={16}
              radius="xl"
              variant="filled"
              color="red"
              onClick={() => onRemove(index)}
              style={{ position: "absolute", top: -4, right: -4 }}
            >
              <IconX size={10} />
            </ActionIcon>
          </Paper>
        );
      })}
    </Group>
  );
};

// ============================================================================
// Comment Bubble
// ============================================================================

const getReplyPreviewText = (replyTo: CommentReplyTo) => {
  if (replyTo.content) return replyTo.content;
  if (replyTo.attachmentType?.startsWith("audio/")) return "🎤 Ovozli xabar";
  if (replyTo.attachmentType?.startsWith("image/")) return "📷 Rasm";
  if (replyTo.attachmentType?.startsWith("video/")) return "🎬 Video";
  if (replyTo.attachmentName) return "📎 " + replyTo.attachmentName;
  return "...";
};

const scrollToComment = (commentId: string) => {
  const el = document.getElementById(`comment-${commentId}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.style.transition = "background-color 0.3s";
    el.style.backgroundColor = "rgba(30,58,95,0.08)";
    el.style.borderRadius = "12px";
    setTimeout(() => {
      el.style.backgroundColor = "transparent";
    }, 1500);
  }
};

const CommentBubble = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  isOwn,
}: {
  comment: TaskCommentGetResponse;
  onReply: (c: TaskCommentGetResponse) => void;
  onEdit: (c: TaskCommentGetResponse) => void;
  onDelete: (id: string) => void;
  isOwn: boolean;
}) => {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: uz,
  });
  const onlyEmoji = isOnlyEmojis(comment.content);
  const attachments = comment.attachments || [];
  const hasAttachments = attachments.length > 0;
  const hasContent = !!comment.content.trim();
  const replyTo = comment.replyTo;

  return (
    <Group
      id={`comment-${comment.id}`}
      align="flex-end"
      gap={6}
      wrap="nowrap"
      justify={isOwn ? "flex-end" : "flex-start"}
      style={{ paddingLeft: isOwn ? 40 : 0, paddingRight: isOwn ? 0 : 40 }}
    >
      {!isOwn && (
        <Avatar size={28} radius="xl" color="blue" src={comment.user?.avatarUrl} style={{ flexShrink: 0, alignSelf: "flex-end" }}>
          {comment.user?.fullname?.charAt(0) || "?"}
        </Avatar>
      )}

      <Box
        px="sm"
        py={8}
        style={{
          backgroundColor: isOwn ? colors.primary : colors.bgSubtle,
          borderRadius: isOwn ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          maxWidth: "85%",
          minWidth: 80,
        }}
      >
        {!isOwn && (
          <Text size="xs" fw={600} c={colors.infoDark} mb={2}>
            {comment.user?.fullname || "Noma'lum"}
          </Text>
        )}

        {/* Reply preview — bosganda original commentga scroll */}
        {replyTo && (
          <Box
            mb={6}
            pl="xs"
            py={3}
            style={{
              borderLeft: isOwn ? "2px solid rgba(255,255,255,0.5)" : `2px solid ${colors.primary}`,
              backgroundColor: isOwn ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.04)",
              borderRadius: "0 4px 4px 0",
              cursor: "pointer",
            }}
            onClick={() => scrollToComment(replyTo.id)}
          >
            <Text size="xs" fw={600} c={isOwn ? "rgba(255,255,255,0.8)" : colors.infoDark} lineClamp={1}>
              {replyTo.user?.fullname}
            </Text>
            <Text size="xs" c={isOwn ? "rgba(255,255,255,0.6)" : colors.textDimmed} lineClamp={1}>
              {getReplyPreviewText(replyTo)}
            </Text>
          </Box>
        )}

        {/* Attachments */}
        {hasAttachments && attachments.map((att) => (
          <AttachmentPreview key={att.id} att={att} isOwn={isOwn} />
        ))}

        {/* Content */}
        {hasContent && (
          <Text
            size={onlyEmoji ? "xl" : "sm"}
            c={onlyEmoji ? undefined : isOwn ? colors.white : colors.textPrimary}
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: onlyEmoji ? 32 : undefined,
              lineHeight: onlyEmoji ? 1.2 : 1.5,
            }}
          >
            {comment.content}
          </Text>
        )}

        {/* Time + Menu */}
        <Group gap={4} justify="flex-end" mt={2} wrap="nowrap">
          {comment.isEdited && (
            <Text style={{ fontSize: 10 }} c={isOwn ? "rgba(255,255,255,0.5)" : colors.textMuted} fs="italic">
              tahrirlangan
            </Text>
          )}
          <Text style={{ fontSize: 10 }} c={isOwn ? "rgba(255,255,255,0.5)" : colors.textMuted}>
            {timeAgo}
          </Text>
          <Menu shadow="md" width={150} position={isOwn ? "bottom-start" : "bottom-end"} withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size={16}
                radius="sm"
                style={{ color: isOwn ? "rgba(255,255,255,0.5)" : colors.textMuted }}
              >
                <IconDots size={12} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <GuardedMenuItem permission="task-comment:create" leftSection={<IconCornerDownRight size={14} />} onClick={() => onReply(comment)}>
                Javob berish
              </GuardedMenuItem>
              {isOwn && (
                <GuardedMenuItem permission="task-comment:update" leftSection={<IconEdit size={14} />} onClick={() => onEdit(comment)}>
                  Tahrirlash
                </GuardedMenuItem>
              )}
              {isOwn && (
                <GuardedMenuItem permission="task-comment:delete" leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete(comment.id)}>
                  O'chirish
                </GuardedMenuItem>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Box>
    </Group>
  );
};


// ============================================================================
// Main Component
// ============================================================================

export const TaskCommentsInline = ({ taskId }: TaskCommentsInlineProps) => {
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<TaskCommentGetResponse | null>(null);
  const [replyingTo, setReplyingTo] = useState<TaskCommentGetResponse | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [micDenied, setMicDenied] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: profile } = useGetProfileQuery();
  const currentUserId = profile?.id;

  const { data: commentsData, isLoading } = useGetAllTaskComments({ taskId, pageSize: 100 });
  const createMutation = useCreateTaskComment();
  const updateMutation = useUpdateTaskComment();
  const deleteMutation = useDeleteTaskComment();
  const uploadMutation = useCreateAttachment();
  const { allowed: canCreateComment, reason: createReason } = usePermissionCheck("task-comment:create");

  const comments = commentsData?.data || [];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [comments.length]);

  const handleEmojiSelect = (emoji: string) => {
    setNewComment((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPendingFiles((prev) => [...prev, ...files]);
    }
    e.target.value = "";
  };

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const hasContent = newComment.trim().length > 0;
    const hasFiles = pendingFiles.length > 0;
    if (!hasContent && !hasFiles) return;

    if (editingComment) {
      updateMutation.mutate(
        { id: editingComment.id, data: { content: newComment.trim() } },
        { onSuccess: () => { setNewComment(""); setEditingComment(null); } },
      );
      return;
    }

    // Upload files first
    let attachmentIds: string[] = [];
    if (hasFiles) {
      try {
        const results = await Promise.all(
          pendingFiles.map((file) => uploadMutation.mutateAsync(file)),
        );
        attachmentIds = results.map((r: any) => r.id).filter(Boolean);
      } catch {
        return; // showError already handled by mutation
      }
    }

    createMutation.mutate(
      {
        taskId,
        content: newComment.trim(),
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
        parentCommentId: replyingTo?.id,
      },
      {
        onSuccess: () => {
          setNewComment("");
          setReplyingTo(null);
          setPendingFiles([]);
        },
      },
    );
  };

  const getSupportedMimeType = () => {
    const types = ["audio/webm", "audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"];
    for (const type of types) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
    }
    return undefined;
  };

  const startVoiceRecording = async () => {
    try {
      setMicDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recordChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const actualType = recorder.mimeType || mimeType || "audio/webm";
        const ext = actualType.includes("mp4") ? "m4a" : actualType.includes("ogg") ? "ogg" : "webm";
        const blob = new Blob(recordChunksRef.current, { type: actualType });
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setRecordDuration(0);

        // Upload and send
        try {
          const file = new File([blob], `voice-message.${ext}`, { type: actualType });
          const result: any = await uploadMutation.mutateAsync(file);
          if (result?.id) {
            createMutation.mutate({
              taskId,
              content: "",
              attachmentIds: [result.id],
              parentCommentId: replyingTo?.id,
            }, { onSuccess: () => setReplyingTo(null) });
          }
        } catch {
          // handled by mutation
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      recordTimerRef.current = setInterval(() => {
        setRecordDuration((d) => d + 1);
      }, 1000);
    } catch {
      setMicDenied(true);
    }
  };

  const stopVoiceRecording = () => {
    mediaRecorderRef.current?.stop();
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      // Stop mic
      mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    setRecordDuration(0);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  const formatRecordDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReply = (comment: TaskCommentGetResponse) => {
    if (isRecording) cancelVoiceRecording();
    setReplyingTo(comment);
    setEditingComment(null);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  const handleEdit = (comment: TaskCommentGetResponse) => {
    setEditingComment(comment);
    setNewComment(comment.content);
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const cancelAction = () => {
    setEditingComment(null);
    setReplyingTo(null);
    setNewComment("");
    setPendingFiles([]);
  };

  // Flat list — backend tartibida (createdAt asc), hech qanday guruhlash yo'q

  const isSending = createMutation.isLoading || updateMutation.isLoading || uploadMutation.isLoading;

  return (
    <Stack gap={0} style={{ height: "100%" }}>
      {/* Messages */}
      <ScrollArea
        style={{ flex: 1, backgroundColor: colors.white, borderRadius: 8 }}
        viewportRef={scrollAreaRef}
        offsetScrollbars
      >
        {isLoading ? (
          <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 150 }}>
            <Loader size="sm" color={colors.primary} />
          </Box>
        ) : comments.length === 0 ? (
          <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 150 }}>
            <Text c="dimmed" size="sm">Hali izohlar yo'q</Text>
          </Box>
        ) : (
          <Stack gap={6} pb="md" px={4} pt="sm">
            {comments.map((comment) => (
              <CommentBubble
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
                isOwn={comment.user?.id === currentUserId}
              />
            ))}
          </Stack>
        )}
      </ScrollArea>

      {/* Input area */}
      <Box pt="md" style={{ borderTop: `1px solid ${colors.border}` }}>
        {!canCreateComment ? (
          <Paper p="md" radius="sm" style={{ backgroundColor: colors.errorLight, border: `1px solid ${colors.errorBg}`, textAlign: "center" }}>
            <Text size="sm" c={colors.error}>
              {createReason || "Izoh yozish uchun ruxsat yo'q"}
            </Text>
          </Paper>
        ) : (
          <>
        {/* Reply / Edit bar */}
        {(replyingTo || editingComment) && (
          <Paper
            p="xs"
            mb="sm"
            radius="sm"
            style={{ backgroundColor: colors.primaryLight, borderLeft: `3px solid ${colors.primary}` }}
          >
            <Group justify="space-between">
              <Box>
                <Text size="xs" c={colors.primary} fw={500}>
                  {editingComment ? "Tahrirlash" : `@${replyingTo?.user?.fullname} ga javob`}
                </Text>
                {!editingComment && replyingTo && (
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {replyingTo.content || (replyingTo.attachments?.length ? "📎 Fayl" : "...")}
                  </Text>
                )}
              </Box>
              <ActionIcon variant="subtle" size="xs" color="gray" onClick={cancelAction}>
                <IconX size={14} />
              </ActionIcon>
            </Group>
          </Paper>
        )}

        {/* Pending files */}
        <PendingFilePreview files={pendingFiles} onRemove={handleRemovePendingFile} />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        {isRecording ? (
          /* Recording bar — Telegram style */
          <Group gap="sm" align="center">
            <Tooltip label="Bekor qilish">
              <ActionIcon variant="subtle" size="lg" radius="sm" color="gray" onClick={cancelVoiceRecording}>
                <IconTrash size={18} />
              </ActionIcon>
            </Tooltip>
            <Box
              w={8}
              h={8}
              style={{
                borderRadius: "50%",
                backgroundColor: colors.error,
                boxShadow: "0 0 0 3px rgba(231,76,60,0.25)",
              }}
            />
            <Text size="sm" c={colors.error} fw={600} style={{ fontVariantNumeric: "tabular-nums", minWidth: 36 }}>
              {formatRecordDuration(recordDuration)}
            </Text>
            <Text size="xs" c="dimmed" style={{ flex: 1 }}>Yozilmoqda...</Text>
            <Tooltip label="Yuborish">
              <ActionIcon size="lg" radius="xl" onClick={stopVoiceRecording} style={{ backgroundColor: colors.primary, color: colors.white }}>
                <IconSend size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ) : (
          <Group align="flex-end" gap="xs">
            {/* Attach */}
            <Tooltip label="Fayl biriktirish">
              <ActionIcon
                variant="subtle"
                size="lg"
                radius="sm"
                onClick={() => fileInputRef.current?.click()}
                style={{ color: colors.textDimmed }}
              >
                <IconPaperclip size={20} />
              </ActionIcon>
            </Tooltip>

            {/* Text input */}
            <Textarea
              ref={inputRef}
              placeholder="Izoh yozing..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              autosize
              minRows={1}
              maxRows={4}
              style={{ flex: 1 }}
              styles={{
                input: {
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  "&:focus": { borderColor: colors.primary },
                },
              }}
            />

            {/* Emoji */}
            <EmojiPicker
              opened={emojiPickerOpen}
              onClose={() => setEmojiPickerOpen(!emojiPickerOpen)}
              onSelect={handleEmojiSelect}
            />

            {/* Voice or Send */}
            {newComment.trim() || pendingFiles.length > 0 ? (
              <ActionIcon
                size="lg"
                radius="sm"
                onClick={handleSend}
                disabled={isSending}
                loading={isSending}
                style={{ backgroundColor: colors.primary, color: colors.white }}
              >
                <IconSend size={18} />
              </ActionIcon>
            ) : (
              <Tooltip label={micDenied ? "Mikrofonga ruxsat bering (brauzer sozlamalaridan)" : "Ovozli xabar"}>
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  radius="sm"
                  onClick={startVoiceRecording}
                  style={{ color: micDenied ? colors.error : colors.textDimmed }}
                >
                  <IconMicrophone size={20} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        )}
        </>
        )}
      </Box>
    </Stack>
  );
};

export default TaskCommentsInline;
