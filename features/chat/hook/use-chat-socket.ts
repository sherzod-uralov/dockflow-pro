"use client";

import { useEffect } from "react";
import { useQueryClient } from "react-query";
import { authService } from "@/features/login/service/login.service";
import { chatSocket } from "../lib/chat-socket";
import { ChatMessage } from "../type/chat.type";
import { usePresenceSync } from "./use-presence";

/**
 * Mounts global chat socket connection (lifecycle managed by app).
 * Listens to message events and updates React Query cache.
 */
export const useChatSocket = () => {
  const qc = useQueryClient();

  // Real-time online/offline sync from notification socket store
  usePresenceSync();

  useEffect(() => {
    const token = authService.getAccessToken();
    if (!token) return;

    chatSocket.connect(token);

    // chat:message — yangi xabar (chatga ulanmagan bo'lsa ham keladi)
    const offChatMessage = chatSocket.on(
      "chat:message",
      (data: { chatId: string; message: ChatMessage }) => {
        qc.invalidateQueries(["chat-messages", data.chatId]);
        qc.invalidateQueries(["chat-list"]);
      }
    );

    // message:new — chatga join qilingandan keyin
    const offMessageNew = chatSocket.on("message:new", (msg: ChatMessage) => {
      qc.invalidateQueries(["chat-messages", msg.chatId]);
      qc.invalidateQueries(["chat-list"]);
    });

    const offMessageUpdated = chatSocket.on("message:updated", (msg: ChatMessage) => {
      qc.invalidateQueries(["chat-messages", msg.chatId]);
    });

    const offMessageDeleted = chatSocket.on(
      "message:deleted",
      (data: { chatId: string; messageId: string }) => {
        qc.invalidateQueries(["chat-messages", data.chatId]);
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

    const offChatDeleted = chatSocket.on("chat:deleted", () => {
      qc.invalidateQueries(["chat-list"]);
    });

    return () => {
      offChatMessage();
      offMessageNew();
      offMessageUpdated();
      offMessageDeleted();
      offReaction();
      offChatCreated();
      offChatDeleted();
    };
  }, [qc]);
};
