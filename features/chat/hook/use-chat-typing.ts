"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { chatSocket } from "../lib/chat-socket";

interface TypingUser {
  userId: string;
  username: string;
}

export const useChatTyping = (chatId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const lastEmitRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Listen incoming typing events
  useEffect(() => {
    if (!chatId) return;
    const off = chatSocket.on(
      "chat:typing",
      (data: { chatId: string; userId: string; username: string; isTyping: boolean }) => {
        if (data.chatId !== chatId) return;
        if (data.isTyping) {
          setTypingUsers((prev) => {
            if (prev.some((u) => u.userId === data.userId)) return prev;
            return [...prev, { userId: data.userId, username: data.username }];
          });
          // Auto-remove after 3s
          const existing = userTimersRef.current.get(data.userId);
          if (existing) clearTimeout(existing);
          const t = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
            userTimersRef.current.delete(data.userId);
          }, 3000);
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

  // Emit typing (debounced) — call from input onChange
  const handleTyping = useCallback(() => {
    if (!chatId) return;
    const now = Date.now();
    if (now - lastEmitRef.current > 1500) {
      chatSocket.setTyping(chatId, true);
      lastEmitRef.current = now;
    }
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      chatSocket.setTyping(chatId, false);
      lastEmitRef.current = 0;
    }, 2000);
  }, [chatId]);

  return { typingUsers, handleTyping };
};
