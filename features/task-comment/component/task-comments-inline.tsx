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
} from "@mantine/core";
import {
  IconSend,
  IconDots,
  IconEdit,
  IconTrash,
  IconCornerDownRight,
  IconX,
  IconMoodSmile,
} from "@tabler/icons-react";
import {
  useGetAllTaskComments,
  useCreateTaskComment,
  useUpdateTaskComment,
  useDeleteTaskComment,
} from "../hook/task-comment.hook";
import { TaskCommentGetResponse } from "../type/task-comment.type";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";

interface TaskCommentsInlineProps {
  taskId: string;
}

// Emoji categories with popular emojis
const EMOJI_CATEGORIES = {
  smileys: {
    label: "Smayliklar",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍",
      "🥰", "😘", "😗", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫",
      "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥",
      "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵",
      "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "😟",
      "🙁", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢",
      "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠",
    ],
  },
  gestures: {
    label: "Imo-ishoralar",
    icon: "👍",
    emojis: [
      "👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🤲", "🤝",
      "🙏", "✍️", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀",
      "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "💋", "🩸", "💅", "🤳", "💍",
    ],
  },
  hearts: {
    label: "Yuraklar",
    icon: "❤️",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕",
      "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️", "💌", "💐", "🌹", "🥀",
      "🌷", "🌸", "💮", "🏵️", "🌻", "🌼", "🌺", "🪷", "🪻", "🌾", "🌿", "☘️",
    ],
  },
  objects: {
    label: "Obyektlar",
    icon: "📎",
    emojis: [
      "📎", "📌", "📍", "🔖", "📁", "📂", "📝", "✏️", "🖊️", "🖋️", "📊", "📈",
      "📉", "📋", "📐", "📏", "🗂️", "📆", "📅", "🗓️", "📇", "🗃️", "🗄️", "🗑️",
      "🔒", "🔓", "🔑", "🗝️", "🔐", "💡", "🔦", "🕯️", "🧯", "⏰", "⏱️", "⏲️",
      "🔔", "🔕", "📣", "📢", "💬", "💭", "🗯️", "♠️", "♣️", "♥️", "♦️", "🎴",
    ],
  },
  symbols: {
    label: "Belgilar",
    icon: "✅",
    emojis: [
      "✅", "❌", "❓", "❗", "‼️", "⁉️", "💯", "🔥", "✨", "⭐", "🌟", "💫",
      "⚡", "💥", "💢", "💦", "💨", "🕳️", "💣", "💬", "👁️‍🗨️", "🗨️", "🗯️", "💭",
      "♻️", "⚠️", "🚸", "⛔", "🚫", "🚳", "🚭", "🚯", "🚱", "🚷", "📵", "🔞",
      "☢️", "☣️", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️", "↔️",
    ],
  },
  stickers: {
    label: "Stikerlar",
    icon: "🎉",
    emojis: [
      "🎉", "🎊", "🎈", "🎁", "🎀", "🎄", "🎃", "🎗️", "🎟️", "🎫", "🏆", "🥇",
      "🥈", "🥉", "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🎱", "🪀",
      "🎮", "🕹️", "🎲", "🧩", "♟️", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵",
      "🎶", "🎹", "🥁", "🪘", "🎷", "🎺", "🎸", "🪕", "🎻", "🪗", "🎪", "🤹",
    ],
  },
};

// Check if string contains only emojis
const isOnlyEmojis = (text: string): boolean => {
  const emojiRegex = /^[\p{Emoji}\p{Emoji_Component}\s]+$/u;
  const stripped = text.replace(/\s/g, "");
  return emojiRegex.test(text) && stripped.length <= 12;
};

// Emoji Picker Component
const EmojiPicker = ({
  onSelect,
  opened,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  opened: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<string>("smileys");

  return (
    <Popover opened={opened} onChange={onClose} position="top-end" width={320} shadow="md">
      <Popover.Target>
        <Tooltip label="Emoji">
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="sm"
            onClick={() => onClose()}
            style={{ color: opened ? "#1e3a5f" : "#868e96" }}
          >
            <IconMoodSmile size={20} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        <Tabs value={activeTab} onChange={(v) => setActiveTab(v || "smileys")}>
          <Tabs.List grow>
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <Tabs.Tab
                key={key}
                value={key}
                p="xs"
                style={{ fontSize: 16 }}
              >
                {category.icon}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
            <Tabs.Panel key={key} value={key}>
              <ScrollArea h={200} p="xs">
                <SimpleGrid cols={8} spacing={2}>
                  {category.emojis.map((emoji, index) => (
                    <ActionIcon
                      key={index}
                      variant="subtle"
                      size="md"
                      radius="sm"
                      onClick={() => {
                        onSelect(emoji);
                        onClose();
                      }}
                      style={{
                        fontSize: 20,
                        cursor: "pointer",
                        transition: "transform 0.1s",
                      }}
                      styles={{
                        root: {
                          "&:hover": {
                            transform: "scale(1.2)",
                            backgroundColor: "#f1f3f5",
                          },
                        },
                      }}
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

const CommentItem = ({
  comment,
  parentComment,
  onReply,
  onEdit,
  onDelete,
}: {
  comment: TaskCommentGetResponse;
  parentComment?: TaskCommentGetResponse;
  onReply: (comment: TaskCommentGetResponse) => void;
  onEdit: (comment: TaskCommentGetResponse) => void;
  onDelete: (id: string) => void;
}) => {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: uz,
  });

  return (
    <Group align="flex-start" gap="sm" wrap="nowrap">
      <Avatar size="sm" radius="xl" color="blue">
        {comment.user?.fullname?.charAt(0) || "?"}
      </Avatar>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs">
            <Text size="sm" fw={600} c="#212529">
              {comment.user?.fullname || "Noma'lum"}
            </Text>
            <Text size="xs" c="dimmed">
              {timeAgo}
            </Text>
            {comment.isEdited && (
              <Text size="xs" c="dimmed" fs="italic">
                (tahrirlangan)
              </Text>
            )}
          </Group>
          <Menu shadow="md" width={150} position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" size="xs" color="gray">
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconCornerDownRight size={14} />}
                onClick={() => onReply(comment)}
              >
                Javob berish
              </Menu.Item>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => onEdit(comment)}
              >
                Tahrirlash
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => onDelete(comment.id)}
              >
                O'chirish
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Reply quote - Telegram style */}
        {parentComment && (
          <Box
            mb={6}
            pl="sm"
            py={4}
            style={{
              borderLeft: "2px solid #1e3a5f",
              backgroundColor: "#f8f9fa",
              borderRadius: "0 4px 4px 0",
              cursor: "pointer",
            }}
          >
            <Text size="xs" fw={600} c="#1e3a5f" lineClamp={1}>
              {parentComment.user?.fullname}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {parentComment.content}
            </Text>
          </Box>
        )}

        <Text
          size={isOnlyEmojis(comment.content) ? "xl" : "sm"}
          c="#495057"
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: isOnlyEmojis(comment.content) ? 32 : undefined,
            lineHeight: isOnlyEmojis(comment.content) ? 1.2 : undefined,
          }}
        >
          {comment.content}
        </Text>
        {comment.repliesCount > 0 && (
          <Text size="xs" c="dimmed" mt={4}>
            {comment.repliesCount} ta javob
          </Text>
        )}
      </Box>
    </Group>
  );
};

export const TaskCommentsInline = ({ taskId }: TaskCommentsInlineProps) => {
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] =
    useState<TaskCommentGetResponse | null>(null);
  const [replyingTo, setReplyingTo] = useState<TaskCommentGetResponse | null>(
    null
  );
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    setNewComment((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const { data: commentsData, isLoading } = useGetAllTaskComments({
    taskId,
    pageSize: 100,
  });

  const createMutation = useCreateTaskComment();
  const updateMutation = useUpdateTaskComment();
  const deleteMutation = useDeleteTaskComment();

  const comments = commentsData?.data || [];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [comments.length]);

  const handleSend = () => {
    if (!newComment.trim()) return;

    if (editingComment) {
      updateMutation.mutate(
        { id: editingComment.id, data: { content: newComment.trim() } },
        {
          onSuccess: () => {
            setNewComment("");
            setEditingComment(null);
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          taskId,
          content: newComment.trim(),
          parentCommentId: replyingTo?.id,
        },
        {
          onSuccess: () => {
            setNewComment("");
            setReplyingTo(null);
          },
        }
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReply = (comment: TaskCommentGetResponse) => {
    setReplyingTo(comment);
    setEditingComment(null);
    inputRef.current?.focus();
  };

  const handleEdit = (comment: TaskCommentGetResponse) => {
    setEditingComment(comment);
    setNewComment(comment.content);
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const cancelAction = () => {
    setEditingComment(null);
    setReplyingTo(null);
    setNewComment("");
  };

  // Group comments - build comments map and find root parent for nested replies
  const commentsById = comments.reduce((acc, comment) => {
    acc[comment.id] = comment;
    return acc;
  }, {} as Record<string, TaskCommentGetResponse>);

  // Find root parent (top-level comment) for any reply
  const findRootParent = (commentId: string): string | null => {
    const comment = commentsById[commentId];
    if (!comment || !comment.parentCommentId) return commentId;
    const parent = commentsById[comment.parentCommentId];
    if (!parent) return commentId;
    if (!parent.parentCommentId) return parent.id;
    return findRootParent(parent.id);
  };

  const topLevelComments = comments.filter((c) => !c.parentCommentId);

  // Group all replies under their root parent (top-level comment)
  const repliesMap = comments.reduce((acc, comment) => {
    if (comment.parentCommentId) {
      const rootParentId = findRootParent(comment.parentCommentId);
      if (rootParentId) {
        if (!acc[rootParentId]) {
          acc[rootParentId] = [];
        }
        acc[rootParentId].push(comment);
      }
    }
    return acc;
  }, {} as Record<string, TaskCommentGetResponse[]>);

  // Sort replies by creation date
  Object.keys(repliesMap).forEach((key) => {
    repliesMap[key].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  });

  return (
    <Stack gap={0} style={{ height: "100%" }}>
      {/* Comments list */}
      <ScrollArea
        style={{ flex: 1 }}
        viewportRef={scrollAreaRef}
        offsetScrollbars
      >
        {isLoading ? (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 150,
            }}
          >
            <Loader size="sm" color="#1e3a5f" />
          </Box>
        ) : comments.length === 0 ? (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 150,
            }}
          >
            <Text c="dimmed" size="sm">
              Hali izohlar yo'q
            </Text>
          </Box>
        ) : (
          <Stack gap="md" pb="md">
            {topLevelComments.map((comment) => (
              <Box key={comment.id}>
                <CommentItem
                  comment={comment}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                {repliesMap[comment.id]?.map((reply) => (
                  <Box key={reply.id} mt="sm">
                    <CommentItem
                      comment={reply}
                      parentComment={reply.parentCommentId ? commentsById[reply.parentCommentId] : undefined}
                      onReply={handleReply}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Stack>
        )}
      </ScrollArea>

      {/* Input area */}
      <Box
        pt="md"
        style={{
          borderTop: "1px solid #e9ecef",
        }}
      >
        {(replyingTo || editingComment) && (
          <Paper
            p="xs"
            mb="sm"
            radius="sm"
            style={{
              backgroundColor: "#e7f5ff",
              borderLeft: "3px solid #1e3a5f",
            }}
          >
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="#1e3a5f" fw={500}>
                  {editingComment
                    ? "Tahrirlash"
                    : `@${replyingTo?.user?.fullname} ga javob`}
                </Text>
                {!editingComment && replyingTo && (
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {replyingTo.content}
                  </Text>
                )}
              </Box>
              <ActionIcon
                variant="subtle"
                size="xs"
                color="gray"
                onClick={cancelAction}
              >
                <IconX size={14} />
              </ActionIcon>
            </Group>
          </Paper>
        )}

        <Group align="flex-end" gap="xs">
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
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
                "&:focus": {
                  borderColor: "#1e3a5f",
                },
              },
            }}
          />
          <EmojiPicker
            opened={emojiPickerOpen}
            onClose={() => setEmojiPickerOpen(!emojiPickerOpen)}
            onSelect={handleEmojiSelect}
          />
          <ActionIcon
            size="lg"
            radius="sm"
            onClick={handleSend}
            disabled={
              !newComment.trim() ||
              createMutation.isLoading ||
              updateMutation.isLoading
            }
            loading={createMutation.isLoading || updateMutation.isLoading}
            style={{
              backgroundColor: "#1e3a5f",
              color: "#fff",
            }}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
      </Box>
    </Stack>
  );
};

export default TaskCommentsInline;
