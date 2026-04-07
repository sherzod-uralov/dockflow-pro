"use client";

import { useState, useEffect, useRef, useMemo, KeyboardEvent } from "react";
import {
  Box,
  Group,
  Text,
  Avatar,
  Stack,
  ScrollArea,
  Loader,
  Center,
  Textarea,
  ActionIcon,
  Paper,
  Tooltip,
} from "@mantine/core";
import {
  IconSend,
  IconUsers,
  IconX,
  IconCornerDownRight,
  IconPaperclip,
} from "@tabler/icons-react";
import { useGetChatMessages, useGetChatDetail, useSendTextMessage, useDeleteMessage, useEditMessage, useMarkChatRead } from "../hook/chat.hook";
import { useChatTyping } from "../hook/use-chat-typing";
import { chatSocket } from "../lib/chat-socket";
import { ChatMessage } from "../type/chat.type";
import { MessageBubble } from "./message-bubble";

interface Props {
  chatId: string;
  currentUserId: string;
}

export const ChatConversation = ({ chatId, currentUserId }: Props) => {
  const [inputValue, setInputValue] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [optimistic, setOptimistic] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: chat } = useGetChatDetail(chatId);
  const { data: messagesData, isLoading } = useGetChatMessages(chatId);
  const sendText = useSendTextMessage();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const markRead = useMarkChatRead();
  const { typingUsers, handleTyping } = useChatTyping(chatId);

  const isGroup = chat?.type === "GROUP";

  // Join chat room
  useEffect(() => {
    if (!chatId) return;
    chatSocket.joinChat(chatId);
    return () => chatSocket.leaveChat(chatId);
  }, [chatId]);

  // Mark as read when messages load or change
  useEffect(() => {
    if (chatId && messagesData?.messages?.length) {
      const lastMsg = messagesData.messages[messagesData.messages.length - 1];
      markRead.mutate({ id: chatId, upToMessageId: lastMsg.id });
    }
  }, [chatId, messagesData?.messages?.length]);

  // Combine server messages with optimistic
  const allMessages = useMemo(() => {
    const server = messagesData?.messages || [];
    const serverIds = new Set(server.map((m) => m.id));
    // Filter optimistic that already have server twin
    const stillPending = optimistic.filter((m) => !m.tempId || !serverIds.has(m.tempId));
    return [...server, ...stillPending];
  }, [messagesData?.messages, optimistic]);

  // Clear optimistic if server caught up
  useEffect(() => {
    if (!messagesData?.messages) return;
    setOptimistic((prev) => prev.filter((m) => m.pending || m.failed));
  }, [messagesData?.messages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [allMessages.length, typingUsers.length]);

  // Reset on chat change
  useEffect(() => {
    setReplyTo(null);
    setEditingMsg(null);
    setInputValue("");
    setOptimistic([]);
  }, [chatId]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    // Edit mode
    if (editingMsg) {
      editMessage.mutate(
        { messageId: editingMsg.id, content: text },
        {
          onSuccess: () => {
            setEditingMsg(null);
            setInputValue("");
          },
        }
      );
      return;
    }

    // New message — optimistic
    const tempId = `tmp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      tempId,
      chatId,
      senderId: currentUserId,
      sender: { id: currentUserId, fullname: "Siz", username: "" },
      type: "TEXT",
      content: text,
      replyToId: replyTo?.id || null,
      replyTo: replyTo
        ? {
            id: replyTo.id,
            content: replyTo.content,
            type: replyTo.type,
            senderId: replyTo.senderId,
            sender: { id: replyTo.sender.id, fullname: replyTo.sender.fullname },
          }
        : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pending: true,
    };

    setOptimistic((prev) => [...prev, optimisticMsg]);
    setInputValue("");
    const replyId = replyTo?.id;
    setReplyTo(null);

    try {
      await sendText.mutateAsync({
        id: chatId,
        payload: { content: text, replyToId: replyId },
      });
      // Server response keladi → optimistic'ni belgilaymiz tempId orqali
      setOptimistic((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, pending: false } : m))
      );
    } catch {
      setOptimistic((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m))
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Escape") {
      setReplyTo(null);
      setEditingMsg(null);
    }
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMsg(msg);
    setReplyTo(null);
    setInputValue(msg.content);
    inputRef.current?.focus();
  };

  const handleStartReply = (msg: ChatMessage) => {
    setReplyTo(msg);
    setEditingMsg(null);
    inputRef.current?.focus();
  };

  const handleDelete = (msg: ChatMessage) => {
    if (!confirm("Xabarni o'chirishni xohlaysizmi?")) return;
    deleteMessage.mutate({ messageId: msg.id, chatId });
  };

  if (!chat) {
    return (
      <Center style={{ height: "100%" }}>
        <Loader size="md" color="#1e3a5f" />
      </Center>
    );
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Group
        justify="space-between"
        p="sm"
        style={{ borderBottom: "1px solid #e9ecef", flexShrink: 0, backgroundColor: "#fff" }}
      >
        <Group gap="sm">
          <Avatar
            size="md"
            radius="xl"
            src={chat.avatarUrl || chat.peer?.avatarUrl}
            style={{ backgroundColor: isGroup ? "#fff3e0" : "#e7f5ff" }}
          >
            {isGroup ? <IconUsers size={20} color="#f39c12" /> : null}
          </Avatar>
          <Box>
            <Text size="sm" fw={600} c="#212529">
              {chat.title}
            </Text>
            <Text size="xs" c="dimmed">
              {isGroup ? `${chat.membersCount} a'zo` : "Onlayn"}
            </Text>
          </Box>
        </Group>
      </Group>

      {/* Messages */}
      <ScrollArea
        viewportRef={scrollRef}
        style={{ flex: 1, minHeight: 0, backgroundColor: "#f8f9fa" }}
        offsetScrollbars
      >
        <Box p="md">
          {isLoading ? (
            <Center py="xl">
              <Loader size="sm" color="#1e3a5f" />
            </Center>
          ) : allMessages.length === 0 ? (
            <Center py="xl">
              <Text size="sm" c="dimmed">
                Hali xabarlar yo'q
              </Text>
            </Center>
          ) : (
            <Stack gap={2}>
              {allMessages.map((msg, idx) => {
                const isOwn = msg.senderId === currentUserId;
                const prev = allMessages[idx - 1];
                const showAvatar = !prev || prev.senderId !== msg.senderId;
                const showSenderName = isGroup && !isOwn && showAvatar;
                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    showSenderName={showSenderName}
                    onEdit={isOwn ? handleStartEdit : undefined}
                    onDelete={handleDelete}
                    onReply={handleStartReply}
                  />
                );
              })}
              {typingUsers.length > 0 && (
                <Text size="xs" c="dimmed" pl={40} mt={4}>
                  {typingUsers.map((u) => u.username).join(", ")} yozmoqda...
                </Text>
              )}
            </Stack>
          )}
        </Box>
      </ScrollArea>

      {/* Reply / Edit preview */}
      {(replyTo || editingMsg) && (
        <Paper
          p="xs"
          style={{
            borderTop: "1px solid #e9ecef",
            backgroundColor: "#e7f5ff",
            borderLeft: "3px solid #1e3a5f",
            flexShrink: 0,
          }}
        >
          <Group justify="space-between" gap="xs">
            <Group gap="xs">
              {replyTo ? (
                <IconCornerDownRight size={14} color="#1e3a5f" />
              ) : (
                <Text size="xs" fw={600} c="#1e3a5f">
                  Tahrirlash
                </Text>
              )}
              <Box>
                {replyTo && (
                  <>
                    <Text size="xs" fw={600} c="#1e3a5f">
                      {replyTo.sender.fullname}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {replyTo.content}
                    </Text>
                  </>
                )}
              </Box>
            </Group>
            <ActionIcon
              variant="subtle"
              size="xs"
              onClick={() => {
                setReplyTo(null);
                setEditingMsg(null);
                if (editingMsg) setInputValue("");
              }}
            >
              <IconX size={14} />
            </ActionIcon>
          </Group>
        </Paper>
      )}

      {/* Input */}
      <Box
        p="sm"
        style={{ borderTop: "1px solid #e9ecef", backgroundColor: "#fff", flexShrink: 0 }}
      >
        <Group gap="xs" align="flex-end">
          <Tooltip label="Fayl biriktirish (tez orada)">
            <ActionIcon variant="subtle" size="lg" disabled>
              <IconPaperclip size={18} />
            </ActionIcon>
          </Tooltip>
          <Textarea
            ref={inputRef}
            placeholder="Xabar yozing..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            autosize
            minRows={1}
            maxRows={5}
            style={{ flex: 1 }}
            styles={{
              input: {
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
                "&:focus": { borderColor: "#1e3a5f" },
              },
            }}
          />
          <ActionIcon
            size="lg"
            radius="md"
            onClick={handleSend}
            disabled={!inputValue.trim() || sendText.isLoading}
            loading={sendText.isLoading || editMessage.isLoading}
            style={{ backgroundColor: "#1e3a5f", color: "#fff" }}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
      </Box>
    </Box>
  );
};
