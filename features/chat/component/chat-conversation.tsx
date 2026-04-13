"use client";

import { useState, useEffect, useRef, useMemo, KeyboardEvent } from "react";
import { useQueryClient } from "react-query";
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
  Tooltip,
  FileButton,
  Paper,
} from "@mantine/core";
import {
  IconSend,
  IconUsers,
  IconX,
  IconCornerDownRight,
  IconPaperclip,
  IconInfoCircle,
  IconSettings,
  IconMicrophone,
  IconMicrophoneOff,
  IconPhone,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useChatCall } from "../hook/use-chat-call";
import { useUserPresence } from "../hook/use-presence";
import { formatPresence } from "../lib/presence";
import { ChatMessagesResponse } from "../type/chat.type";
import {
  useGetChatMessages,
  useGetChatDetail,
  useSendTextMessage,
  useSendMediaMessage,
  useDeleteMessage,
  useEditMessage,
  useMarkChatRead,
  useAddReaction,
  useRemoveReaction,
} from "../hook/chat.hook";
import { useChatTyping } from "../hook/use-chat-typing";
import { chatSocket } from "../lib/chat-socket";
import { ChatMessage } from "../type/chat.type";
import { MessageBubble } from "./message-bubble";
import { ChatInfoDrawer } from "./chat-info-drawer";
import { ChatSettingsDrawer } from "./chat-settings-drawer";
import { ForwardModal } from "./forward-modal";
import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import { colors } from "@/lib/colors";

interface Props {
  chatId: string;
  currentUserId: string;
  onChatDeleted?: () => void;
  onBack?: () => void;
}

export const ChatConversation = ({ chatId, currentUserId, onChatDeleted, onBack }: Props) => {
  const [inputValue, setInputValue] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [optimistic, setOptimistic] = useState<ChatMessage[]>([]);
  const [forwardingMsgId, setForwardingMsgId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number>(0);
  const forwardModal = useModal();
  const qc = useQueryClient();
  const { startCall, activeCall } = useChatCall();

  const { data: chat } = useGetChatDetail(chatId);
  const { data: messagesData, isLoading } = useGetChatMessages(chatId);
  const peerPresence = useUserPresence(chat?.peer?.id);
  const isPeerOnline = peerPresence?.isOnline ?? chat?.peer?.isOnline;
  const peerLastSeen = peerPresence?.lastSeen ?? chat?.peer?.lastSeen;
  const sendText = useSendTextMessage();
  const sendMedia = useSendMediaMessage();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const markRead = useMarkChatRead();
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const { typingLabel, handleTyping, sendAction, stopAction } = useChatTyping(chatId);

  const isGroup = chat?.type === "GROUP";

  // Join chat room
  useEffect(() => {
    if (!chatId) return;
    chatSocket.joinChat(chatId);
    return () => chatSocket.leaveChat(chatId);
  }, [chatId]);

  // Mark as read
  useEffect(() => {
    if (chatId && messagesData?.messages?.length) {
      const lastMsg = messagesData.messages[messagesData.messages.length - 1];
      markRead.mutate({ id: chatId, upToMessageId: lastMsg.id });
    }
  }, [chatId, messagesData?.messages?.length]);

  // Combine server + optimistic
  const allMessages = useMemo(() => {
    const server = messagesData?.messages || [];
    const stillPending = optimistic.filter((m) => m.pending || m.failed);
    return [...server, ...stillPending];
  }, [messagesData?.messages, optimistic]);

  useEffect(() => {
    if (!messagesData?.messages) return;
    setOptimistic((prev) => prev.filter((m) => m.pending || m.failed));
  }, [messagesData?.messages]);

  // Auto-scroll — birinchi yuklanganda darhol, keyinchalik smooth
  const isFirstScrollRef = useRef(true);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    const shouldScroll = isFirstScrollRef.current || isNearBottom;
    if (!shouldScroll) return;

    requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: isFirstScrollRef.current ? "auto" : "smooth",
      });
      isFirstScrollRef.current = false;
    });
  }, [allMessages.length, typingLabel]);

  // Reset scroll flag on chat change
  useEffect(() => {
    isFirstScrollRef.current = true;
  }, [chatId]);

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

    if (editingMsg) {
      editMessage.mutate(
        { messageId: editingMsg.id, content: text },
        { onSuccess: () => { setEditingMsg(null); setInputValue(""); } }
      );
      return;
    }

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
      const realMessage = await sendText.mutateAsync({
        id: chatId,
        payload: { content: text, replyToId: replyId },
      });

      // Server xabarini cache'ga darhol qo'shamiz (agar socket eventidan oldin kelsa)
      qc.setQueryData<ChatMessagesResponse | undefined>(
        ["chat-messages", chatId],
        (old) => {
          if (!old) return old;
          if (old.messages.some((m) => m.id === realMessage.id)) return old;
          return {
            ...old,
            count: old.count + 1,
            messages: [...old.messages, realMessage],
          };
        }
      );

      // Optimistic'ni darhol olib tashlaymiz
      setOptimistic((prev) => prev.filter((m) => m.id !== tempId));
    } catch {
      setOptimistic((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m))
      );
    }
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("Fayl hajmi 50 MB dan oshmasligi kerak");
      return;
    }
    const tempId = `tmp-${Date.now()}`;
    const fileType = file.type.startsWith("image/")
      ? "IMAGE"
      : file.type.startsWith("video/")
      ? "VIDEO"
      : file.type.startsWith("audio/")
      ? "VOICE"
      : "FILE";

    // Emit "uploading" action
    const uploadAction =
      fileType === "IMAGE"
        ? "uploading_photo"
        : fileType === "VIDEO"
        ? "uploading_video"
        : fileType === "VOICE"
        ? "uploading_voice"
        : "uploading_file";
    sendAction(uploadAction);

    const optimisticMsg: ChatMessage = {
      id: tempId,
      tempId,
      chatId,
      senderId: currentUserId,
      sender: { id: currentUserId, fullname: "Siz", username: "" },
      type: fileType as ChatMessage["type"],
      content: "",
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pending: true,
    };
    setOptimistic((prev) => [...prev, optimisticMsg]);

    try {
      const realMessage = await sendMedia.mutateAsync({ id: chatId, file });
      qc.setQueryData<ChatMessagesResponse | undefined>(
        ["chat-messages", chatId],
        (old) => {
          if (!old) return old;
          if (old.messages.some((m) => m.id === realMessage.id)) return old;
          return {
            ...old,
            count: old.count + 1,
            messages: [...old.messages, realMessage],
          };
        }
      );
      setOptimistic((prev) => prev.filter((m) => m.id !== tempId));
    } catch {
      setOptimistic((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)));
    } finally {
      stopAction(uploadAction);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recordedChunksRef.current = [];
      recordStartRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const duration = Math.round((Date.now() - recordStartRef.current) / 1000);
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());

        try {
          await sendMedia.mutateAsync({ id: chatId, file, extras: { duration } });
        } catch (err) {
          console.error(err);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      sendAction("recording");
    } catch (err) {
      alert("Mikrofonga ruxsat berilmadi");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    stopAction("recording");
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

  const handleForward = (msg: ChatMessage) => {
    setForwardingMsgId(msg.id);
    forwardModal.openModal();
  };

  const handleAddReaction = (msg: ChatMessage, emoji: string) => {
    addReaction.mutate({ messageId: msg.id, emoji, chatId });
  };

  const handleRemoveReaction = (msg: ChatMessage, emoji: string) => {
    removeReaction.mutate({ messageId: msg.id, emoji, chatId });
  };

  if (!chat) {
    return (
      <Center style={{ height: "100%" }}>
        <Loader size="md" color={colors.primary} />
      </Center>
    );
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Group
        justify="space-between"
        p="sm"
        gap="xs"
        wrap="nowrap"
        style={{ borderBottom: `1px solid ${colors.border}`, flexShrink: 0, backgroundColor: colors.white }}
      >
        {onBack && (
          <ActionIcon variant="subtle" color="gray" onClick={onBack}>
            <IconArrowLeft size={20} />
          </ActionIcon>
        )}
        <Group gap="sm" style={{ cursor: "pointer", flex: 1, minWidth: 0 }} onClick={() => setInfoOpen(true)}>
          <Avatar
            size="md"
            radius="xl"
            src={chat.avatarUrl || chat.peer?.avatarUrl}
            style={{ backgroundColor: isGroup ? colors.warningBg : colors.primaryLight }}
          >
            {isGroup ? <IconUsers size={20} color={colors.warning} /> : null}
          </Avatar>
          <Box>
            <Text size="sm" fw={600} c={colors.textPrimary}>
              {chat.title}
            </Text>
            <Text size="xs" c="dimmed">
              {isGroup
                ? `${chat.membersCount} a'zo`
                : formatPresence(isPeerOnline, peerLastSeen)}
            </Text>
          </Box>
        </Group>
        <Group gap={4}>
          {!isGroup && chat.peer && !activeCall && (
            <Tooltip label="Audio qo'ng'iroq">
              <ActionIcon
                variant="subtle"
                color="green"
                onClick={() =>
                  startCall({
                    chatId,
                    targetUserId: chat.peer!.id,
                    peerName: chat.peer!.fullname,
                    peerAvatar: chat.peer!.avatarUrl || undefined,
                  })
                }
              >
                <IconPhone size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Ma'lumot">
            <ActionIcon variant="subtle" color="gray" onClick={() => setInfoOpen(true)}>
              <IconInfoCircle size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Sozlamalar">
            <ActionIcon variant="subtle" color="gray" onClick={() => setSettingsOpen(true)}>
              <IconSettings size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Messages */}
      <ScrollArea
        viewportRef={scrollRef}
        style={{ flex: 1, minHeight: 0, backgroundColor: colors.bg }}
        offsetScrollbars
      >
        <Box p="md">
          {isLoading ? (
            <Center py="xl">
              <Loader size="sm" color={colors.primary} />
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
                    currentUserId={currentUserId}
                    onEdit={isOwn ? handleStartEdit : undefined}
                    onDelete={handleDelete}
                    onReply={handleStartReply}
                    onForward={handleForward}
                    onAddReaction={handleAddReaction}
                    onRemoveReaction={handleRemoveReaction}
                  />
                );
              })}
              {typingLabel && (
                <Group gap={6} pl={40} mt={4}>
                  <Box className="typing-indicator">
                    <span>•</span><span>•</span><span>•</span>
                  </Box>
                  <Text size="xs" c="dimmed">
                    {typingLabel}
                  </Text>
                </Group>
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
            borderTop: `1px solid ${colors.border}`,
            backgroundColor: colors.primaryLight,
            borderLeft: `3px solid ${colors.primary}`,
            flexShrink: 0,
          }}
        >
          <Group justify="space-between" gap="xs">
            <Group gap="xs">
              {replyTo ? <IconCornerDownRight size={14} color={colors.primary} /> : (
                <Text size="xs" fw={600} c={colors.primary}>Tahrirlash</Text>
              )}
              {replyTo && (
                <Box>
                  <Text size="xs" fw={600} c={colors.primary}>{replyTo.sender.fullname}</Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>{replyTo.content}</Text>
                </Box>
              )}
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
      <Box p="sm" style={{ borderTop: `1px solid ${colors.border}`, backgroundColor: colors.white, flexShrink: 0 }}>
        <Group gap="xs" align="flex-end">
          <FileButton onChange={handleFileSelect} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip">
            {(props) => (
              <Tooltip label="Fayl biriktirish">
                <ActionIcon variant="subtle" size="lg" color="gray" {...props}>
                  <IconPaperclip size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </FileButton>

          <Textarea
            ref={inputRef}
            placeholder={isRecording ? "Yozib olish davom etmoqda..." : "Xabar yozing..."}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            autosize
            minRows={1}
            maxRows={5}
            disabled={isRecording}
            style={{ flex: 1 }}
            styles={{
              input: {
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                "&:focus": { borderColor: colors.primary },
              },
            }}
          />

          {inputValue.trim() ? (
            <ActionIcon
              size="lg"
              radius="md"
              onClick={handleSend}
              disabled={sendText.isLoading}
              loading={sendText.isLoading || editMessage.isLoading}
              style={{ backgroundColor: colors.primary, color: colors.white }}
            >
              <IconSend size={18} />
            </ActionIcon>
          ) : (
            <Tooltip label={isRecording ? "To'xtatish" : "Ovozli xabar"}>
              <ActionIcon
                size="lg"
                radius="md"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                style={{
                  backgroundColor: isRecording ? colors.error : colors.primary,
                  color: colors.white,
                }}
              >
                {isRecording ? <IconMicrophoneOff size={18} /> : <IconMicrophone size={18} />}
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Box>

      {/* Drawers + Modals */}
      <ChatInfoDrawer
        opened={infoOpen}
        onClose={() => setInfoOpen(false)}
        chatId={chatId}
        currentUserId={currentUserId}
        onChatDeleted={onChatDeleted}
      />
      <ChatSettingsDrawer opened={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <CustomModal
        isOpen={forwardModal.isOpen}
        onClose={() => {
          forwardModal.closeModal();
          setForwardingMsgId(null);
        }}
        title="Forward"
        description="Xabarni boshqa suhbatga yuborish"
        size="md"
      >
        {forwardingMsgId && (
          <ForwardModal
            messageId={forwardingMsgId}
            onClose={() => {
              forwardModal.closeModal();
              setForwardingMsgId(null);
            }}
          />
        )}
      </CustomModal>

      {/* Animatsiyalar */}
      <style jsx global>{`
        @keyframes msgSlideInRight {
          from { opacity: 0; transform: translate3d(12px, 4px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes msgSlideInLeft {
          from { opacity: 0; transform: translate3d(-12px, 4px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        .typing-indicator span {
          display: inline-block;
          font-size: 18px;
          line-height: 1;
          animation: typingDot 1.4s infinite;
          color: #1e3a5f; /* colors.primary */
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
    </Box>
  );
};
