"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useQueryClient } from "react-query";
import { chatSocket } from "../lib/chat-socket";
import { ChatListResponse, ChatDetail } from "../type/chat.type";

interface PresenceState {
  isOnline: boolean;
  lastSeen: string | null;
}

interface PresenceUpdate {
  userId: string;
  isOnline: boolean;
  lastSeen: string | null;
}

/**
 * Global presence store — chat namespace'dan keladigan
 * `presence:update` event'lariga reaktiv.
 */
class PresenceStore {
  private state = new Map<string, PresenceState>();
  private listeners = new Set<(state: Map<string, PresenceState>) => void>();

  set(userId: string, isOnline: boolean, lastSeen: string | null) {
    this.state.set(userId, { isOnline, lastSeen });
    this.notify();
  }

  get(userId: string): PresenceState | undefined {
    return this.state.get(userId);
  }

  getAll() {
    return this.state;
  }

  subscribe(listener: (state: Map<string, PresenceState>) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = new Map(this.state);
    this.listeners.forEach((l) => l(snapshot));
  }
}

const presenceStore = new PresenceStore();

/**
 * Global subscription — chat namespace'dan presence:update keladi va store'ga
 * yoziladi. Shu hook butun app uchun bir marta dashboard-shell'da ishga
 * tushadi (use-chat-socket ichida).
 */
export const usePresenceSync = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const off = chatSocket.on("presence:update", (data: PresenceUpdate) => {
      presenceStore.set(data.userId, data.isOnline, data.lastSeen);

      // Chat list cache'idagi peerlarni real-time yangilash
      qc.setQueriesData<ChatListResponse | undefined>(["chat-list"], (old) => {
        if (!old) return old;
        let changed = false;
        const updated = old.chats.map((chat) => {
          if (chat.type !== "DIRECT" || !chat.peer || chat.peer.id !== data.userId) return chat;
          changed = true;
          return {
            ...chat,
            peer: {
              ...chat.peer,
              isOnline: data.isOnline,
              lastSeen: data.lastSeen ?? chat.peer.lastSeen ?? null,
            },
          };
        });
        return changed ? { ...old, chats: updated } : old;
      });

      // Chat detail cache
      const detailQueries = qc.getQueryCache().findAll(["chat-detail"]);
      detailQueries.forEach((query) => {
        const detail = query.state.data as ChatDetail | undefined;
        if (!detail || detail.type !== "DIRECT" || !detail.peer || detail.peer.id !== data.userId)
          return;
        qc.setQueryData(query.queryKey, {
          ...detail,
          peer: {
            ...detail.peer,
            isOnline: data.isOnline,
            lastSeen: data.lastSeen ?? detail.peer.lastSeen ?? null,
          },
        });
      });
    });

    return () => {
      off();
    };
  }, [qc]);
};

/**
 * Foydalanuvchining onlayn holatini reaktiv qaytaradi.
 */
export const useUserPresence = (userId?: string | null) => {
  const [state, setState] = useState<PresenceState | undefined>(() =>
    userId ? presenceStore.get(userId) : undefined
  );

  useEffect(() => {
    if (!userId) return;
    setState(presenceStore.get(userId));
    return presenceStore.subscribe((all) => {
      setState(all.get(userId));
    });
  }, [userId]);

  return state;
};
