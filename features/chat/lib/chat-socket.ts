import { io, Socket } from "socket.io-client";
import type { ChatMessage } from "../type/chat.type";

const WS_URL = (process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "").replace(/\/+$/, "");
const NAMESPACE = "/chat";

type Listener = (...args: any[]) => void;

class ChatSocket {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private joinedChats = new Set<string>();

  get isConnected() {
    return !!this.socket?.connected;
  }

  connect(token: string): void {
    if (this.socket?.connected) return;

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = io(`${WS_URL}${NAMESPACE}`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    this.setupBaseEvents();
    this.relayServerEvents();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.joinedChats.clear();
  }

  private setupBaseEvents() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      // Reconnect bo'lganda ochiq chatlarga qayta join
      this.joinedChats.forEach((chatId) => {
        this.socket?.emit("chat:join", { chatId });
      });
    });

    this.socket.on("disconnect", () => {});
    this.socket.on("error", (err) => {
      console.error("[ChatSocket] error", err);
    });
  }

  private relayServerEvents() {
    if (!this.socket) return;
    const events = [
      "message:new",
      "message:updated",
      "message:deleted",
      "message:reaction",
      "message:read",
      "chat:message",
      "chat:message-updated",
      "chat:message-deleted",
      "chat:created",
      "chat:updated",
      "chat:deleted",
      "chat:typing",
      "presence:update",
      "call:incoming",
      "call:status",
      "call:signal",
    ];
    events.forEach((event) => {
      this.socket?.on(event, (...args) => this.emit(event, ...args));
    });
  }

  joinChat(chatId: string) {
    if (!this.socket) return;
    this.joinedChats.add(chatId);
    this.socket.emit("chat:join", { chatId });
  }

  leaveChat(chatId: string) {
    if (!this.socket) return;
    this.joinedChats.delete(chatId);
    this.socket.emit("chat:leave", { chatId });
  }

  setTyping(chatId: string, isTyping: boolean) {
    if (!this.socket) return;
    this.socket.emit("chat:typing", { chatId, isTyping, action: "typing" });
  }

  sendTyping(chatId: string, isTyping: boolean, action: string = "typing") {
    if (!this.socket) return;
    this.socket.emit("chat:typing", { chatId, isTyping, action });
  }

  sendCallSignal(payload: {
    callId: string;
    type: "offer" | "answer" | "ice";
    targetUserId: string;
    payload: unknown;
  }) {
    this.socket?.emit("call:signal", payload);
  }

  on(event: string, listener: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach((l) => {
      try {
        l(...args);
      } catch (err) {
        console.error("[ChatSocket] listener error", err);
      }
    });
  }
}

export const chatSocket = new ChatSocket();

// Helper types for events
export type ChatMessageEvent = ChatMessage | { chatId: string; message: ChatMessage };
