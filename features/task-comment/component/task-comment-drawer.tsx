// ==========================================================================
// VAQTINCHALIK O'CHIRILGAN — Telegram modal oynasi
// Kerak bo'lganda commentdan chiqaring
// ==========================================================================

/*
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Drawer,
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
} from "@mantine/core";
import {
  IconSend,
  IconDots,
  IconEdit,
  IconTrash,
  IconCornerDownRight,
  IconX,
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

interface TaskCommentDrawerProps {
  taskId: string;
  taskTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentItem = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  isReply = false,
}: {
  comment: TaskCommentGetResponse;
  onReply: (comment: TaskCommentGetResponse) => void;
  onEdit: (comment: TaskCommentGetResponse) => void;
  onDelete: (id: string) => void;
  isReply?: boolean;
}) => {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: uz,
  });

  return (
    <Box
      style={{
        paddingLeft: isReply ? 40 : 0,
      }}
    >
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
            <Menu shadow="md" width={150} position="bottom-end">
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
          <Text
            size="sm"
            c="#495057"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {comment.content}
          </Text>
          {comment.repliesCount > 0 && !isReply && (
            <Text size="xs" c="blue" mt={4}>
              {comment.repliesCount} ta javob
            </Text>
          )}
        </Box>
      </Group>
    </Box>
  );
};

export const TaskCommentDrawer = ({
  taskId,
  taskTitle,
  isOpen,
  onClose,
}: TaskCommentDrawerProps) => {
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<TaskCommentGetResponse | null>(null);
  const [replyingTo, setReplyingTo] = useState<TaskCommentGetResponse | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const topLevelComments = comments.filter((c) => !c.parentCommentId);
  const repliesMap = comments.reduce((acc, comment) => {
    if (comment.parentCommentId) {
      if (!acc[comment.parentCommentId]) {
        acc[comment.parentCommentId] = [];
      }
      acc[comment.parentCommentId].push(comment);
    }
    return acc;
  }, {} as Record<string, TaskCommentGetResponse[]>);

  return (
    <Drawer
      opened={isOpen}
      onClose={onClose}
      position="right"
      size="md"
      title={
        <Box>
          <Text size="lg" fw={600} c="#212529">
            Izohlar
          </Text>
          {taskTitle && (
            <Text size="sm" c="dimmed" lineClamp={1}>
              {taskTitle}
            </Text>
          )}
        </Box>
      }
      styles={{
        header: {
          borderBottom: "1px solid #e9ecef",
          paddingBottom: 12,
        },
        body: {
          padding: 0,
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 80px)",
        },
      }}
    >
      <ScrollArea
        style={{ flex: 1 }}
        px="md"
        py="md"
        viewportRef={scrollAreaRef}
      >
        {isLoading ? (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
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
              height: 200,
            }}
          >
            <Text c="dimmed" size="sm">
              Hali izohlar yo'q. Birinchi bo'lib yozing!
            </Text>
          </Box>
        ) : (
          <Stack gap="md">
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
                      onReply={handleReply}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isReply
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Stack>
        )}
      </ScrollArea>

      <Box
        p="md"
        style={{
          borderTop: "1px solid #e9ecef",
          backgroundColor: "#f8f9fa",
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
                  {editingComment ? "Tahrirlash" : `@${replyingTo?.user?.fullname} ga javob`}
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

        <Group align="flex-end" gap="sm">
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
                backgroundColor: "#fff",
                border: "1px solid #e9ecef",
                "&:focus": {
                  borderColor: "#1e3a5f",
                },
              },
            }}
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
    </Drawer>
  );
};

export default TaskCommentDrawer;
*/
