"use client";

import { useEffect } from "react";
import { useQueryClient } from "react-query";
import { authService } from "@/features/login/service/login.service";
import { chatSocket } from "../lib/chat-socket";
import { ChatMessage, ChatMessagesResponse, ChatListResponse } from "../type/chat.type";
import { usePresenceSync } from "./use-presence";

/**
 * Mounts global chat socket connection (lifecycle managed by app).
 * Listens to message events and updates React Query cache directly
 * (no refetch — smooth real-time UX).
 */
export const useChatSocket = () => {
  const qc = useQueryClient();

  // Real-time online/offline sync
  usePresenceSync();

  useEffect(() => {
    const token = authService.getAccessToken();
    if (!token) return;

    chatSocket.connect(token);

    // ─── Helper: append message to cache ─────────────────
    const appendMessage = (chatId: string, message: ChatMessage) => {
      qc.setQueryData<ChatMessagesResponse | undefined>(
        ["chat-messages", chatId],
        (old) => {
          if (!old) return old;
          // Dedup by id
          if (old.messages.some((m) => m.id === message.id)) return old;
          return {
            ...old,
            count: old.count + 1,
            messages: [...old.messages, message],
          };
        }
      );

      // Update chat list lastMessage + lastMessageAt + reorder
      qc.setQueriesData<ChatListResponse | undefined>(["chat-list"], (old) => {
        if (!old) return old;
        const idx = old.chats.findIndex((c) => c.id === chatId);
        if (idx === -1) return old;
        const updatedChat = {
          ...old.chats[idx],
          lastMessage: {
            id: message.id,
            type: message.type,
            content: message.content,
            sender: { id: message.sender.id, fullname: message.sender.fullname },
            createdAt: message.createdAt,
          },
          lastMessageAt: message.createdAt,
        };
        // Move chat to top (after pinned)
        const without = [...old.chats.slice(0, idx), ...old.chats.slice(idx + 1)];
        const pinnedCount = without.filter((c) => c.isPinned).length;
        const insertAt = updatedChat.isPinned ? 0 : pinnedCount;
        return {
          ...old,
          chats: [...without.slice(0, insertAt), updatedChat, ...without.slice(insertAt)],
        };
      });
    };

    const updateMessage = (chatId: string, message: ChatMessage) => {
      qc.setQueryData<ChatMessagesResponse | undefined>(
        ["chat-messages", chatId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.map((m) => (m.id === message.id ? message : m)),
          };
        }
      );
    };

    const removeMessage = (chatId: string, messageId: string) => {
      qc.setQueryData<ChatMessagesResponse | undefined>(
        ["chat-messages", chatId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            count: Math.max(0, old.count - 1),
            messages: old.messages.filter((m) => m.id !== messageId),
          };
        }
      );
    };

    // ─── Listeners ───────────────────────────────────────

    // chat:message — yangi xabar (chatga ulanmagan bo'lsa ham keladi)
    const offChatMessage = chatSocket.on(
      "chat:message",
      (data: { chatId: string; message: ChatMessage }) => {
        appendMessage(data.chatId, data.message);
      }
    );

    // message:new — chatga join qilingandan keyin
    const offMessageNew = chatSocket.on("message:new", (msg: ChatMessage) => {
      appendMessage(msg.chatId, msg);
    });

    const offChatMessageUpdated = chatSocket.on(
      "chat:message-updated",
      (data: { chatId: string; message: ChatMessage }) => {
        updateMessage(data.chatId, data.message);
      }
    );

    const offMessageUpdated = chatSocket.on("message:updated", (msg: ChatMessage) => {
      updateMessage(msg.chatId, msg);
    });

    const offChatMessageDeleted = chatSocket.on(
      "chat:message-deleted",
      (data: { chatId: string; messageId: string }) => {
        removeMessage(data.chatId, data.messageId);
      }
    );

    const offMessageDeleted = chatSocket.on(
      "message:deleted",
      (data: { chatId: string; messageId: string }) => {
        removeMessage(data.chatId, data.messageId);
      }
    );

    const offReaction = chatSocket.on(
      "message:reaction",
      (data: { messageId: string; chatId?: string }) => {
        if (data.chatId) qc.invalidateQueries(["chat-messages", data.chatId]);
      }
    );

    const offChatCreated = chatSocket.on("chat:created", () => {
      qc.invalidateQueries(["chat-list"]);
    });

    const offChatDeleted = chatSocket.on(
      "chat:deleted",
      (data: { chatId: string }) => {
        qc.setQueriesData<ChatListResponse | undefined>(["chat-list"], (old) => {
          if (!old) return old;
          return { ...old, chats: old.chats.filter((c) => c.id !== data.chatId) };
        });
      }
    );

    return () => {
      offChatMessage();
      offMessageNew();
      offChatMessageUpdated();
      offMessageUpdated();
      offChatMessageDeleted();
      offMessageDeleted();
      offReaction();
      offChatCreated();
      offChatDeleted();
    };
  }, [qc]);
};
