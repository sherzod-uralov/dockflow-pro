"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { chatSocket } from "../lib/chat-socket";

export type TypingAction =
  | "typing"
  | "recording"
  | "uploading_file"
  | "uploading_photo"
  | "uploading_video"
  | "uploading_voice";

interface TypingUser {
  userId: string;
  username: string;
  action: TypingAction;
}

const ACTION_LABELS: Record<TypingAction, string> = {
  typing: "yozmoqda",
  recording: "ovozli xabar yozmoqda",
  uploading_file: "fayl yubormoqda",
  uploading_photo: "rasm yubormoqda",
  uploading_video: "video yubormoqda",
  uploading_voice: "ovozli xabar yubormoqda",
};

export const useChatTyping = (chatId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const lastEmitRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Listen to incoming typing events
  useEffect(() => {
    if (!chatId) return;
    const off = chatSocket.on(
      "chat:typing",
      (data: {
        chatId: string;
        userId: string;
        username: string;
        isTyping: boolean;
        action?: TypingAction;
      }) => {
        if (data.chatId !== chatId) return;
        const action: TypingAction = data.action || "typing";

        if (data.isTyping) {
          setTypingUsers((prev) => {
            const filtered = prev.filter((u) => u.userId !== data.userId);
            return [...filtered, { userId: data.userId, username: data.username, action }];
          });

          const existing = userTimersRef.current.get(data.userId);
          if (existing) clearTimeout(existing);
          const t = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
            userTimersRef.current.delete(data.userId);
          }, 4000);
          userTimersRef.current.set(data.userId, t);
        } else {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
          const t = userTimersRef.current.get(data.userId);
          if (t) {
            clearTimeout(t);
            userTimersRef.current.delete(data.userId);
          }
        }
      }
    );
    return () => {
      off();
      userTimersRef.current.forEach((t) => clearTimeout(t));
      userTimersRef.current.clear();
      setTypingUsers([]);
    };
  }, [chatId]);

  // Emit typing (debounced) — for text input
  const handleTyping = useCallback(() => {
    if (!chatId) return;
    const now = Date.now();
    if (now - lastEmitRef.current > 1500) {
      chatSocket.sendTyping(chatId, true, "typing");
      lastEmitRef.current = now;
    }
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      chatSocket.sendTyping(chatId, false, "typing");
      lastEmitRef.current = 0;
    }, 2000);
  }, [chatId]);

  // Emit specific action (recording, uploading)
  const sendAction = useCallback(
    (action: TypingAction) => {
      if (!chatId) return;
      chatSocket.sendTyping(chatId, true, action);
    },
    [chatId]
  );

  const stopAction = useCallback(
    (action: TypingAction = "typing") => {
      if (!chatId) return;
      chatSocket.sendTyping(chatId, false, action);
    },
    [chatId]
  );

  // Format display: "Asror yozmoqda", "Bobur va 2 boshqa yozmoqda"
  const typingLabel = typingUsers.length
    ? typingUsers.length === 1
      ? `${typingUsers[0].username} ${ACTION_LABELS[typingUsers[0].action]}...`
      : `${typingUsers[0].username} va yana ${typingUsers.length - 1} kishi ${ACTION_LABELS[typingUsers[0].action]}...`
    : "";

  return { typingUsers, typingLabel, handleTyping, sendAction, stopAction };
};
