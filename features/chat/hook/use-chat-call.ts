"use client";

import { useEffect, useState, useCallback } from "react";
import { chatSocket } from "../lib/chat-socket";
import { callManager, ActiveCall } from "../lib/call-manager";
import { chatService } from "../service/chat.service";
import { showError } from "@/utils/show-error";

export const useChatCall = () => {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  useEffect(() => {
    return callManager.subscribe(setActiveCall);
  }, []);

  // Listen to incoming calls + signals + status updates
  useEffect(() => {
    const offIncoming = chatSocket.on(
      "call:incoming",
      (data: {
        chatId: string;
        call: {
          id: string;
          type: "AUDIO" | "VIDEO";
          callerId?: string;
          initiator?: { id: string; fullname: string; username: string; avatarUrl?: string | null };
          caller?: { id: string; fullname: string; avatarUrl?: string | null };
          chat?: { id: string; type: "DIRECT" | "GROUP"; title: string; avatarUrl?: string | null };
        };
      }) => {
        const initiator = data.call.initiator || data.call.caller;
        const fromUserId = initiator?.id || data.call.callerId || "";
        const isGroup = data.call.chat?.type === "GROUP";
        const peerName = isGroup
          ? `${data.call.chat?.title || "Guruh"} · ${initiator?.fullname || "Noma'lum"}`
          : initiator?.fullname || "Noma'lum";

        callManager.setIncoming({
          callId: data.call.id,
          chatId: data.chatId,
          fromUserId,
          peerName,
          peerAvatar: initiator?.avatarUrl || data.call.chat?.avatarUrl || undefined,
          type: data.call.type,
        });
      }
    );

    const offSignal = chatSocket.on("call:signal", (data) => {
      callManager.handleSignal(data).catch((err) => console.error("[Call] signal", err));
    });

    const offStatus = chatSocket.on(
      "call:status",
      (data: {
        callId: string;
        chatId?: string;
        action: "accepted" | "rejected" | "ended" | "missed";
        userId?: string;
        user?: { fullname: string };
        duration?: number;
      }) => {
        const current = callManager.getCurrent();
        if (!current || current.callId !== data.callId) return;

        if (data.action === "accepted") {
          callManager.setStatus("connecting");
          callManager.processPendingOffer().catch(console.error);
        } else if (
          data.action === "rejected" ||
          data.action === "ended" ||
          data.action === "missed"
        ) {
          callManager.cleanup();
        }
      }
    );

    return () => {
      offIncoming();
      offSignal();
      offStatus();
    };
  }, []);

  const startCall = useCallback(
    async (params: {
      chatId: string;
      targetUserId: string;
      peerName?: string;
      peerAvatar?: string;
    }) => {
      try {
        const session = await chatService.startCall(params.chatId, "AUDIO");
        await callManager.startCall({
          callId: session.id,
          chatId: params.chatId,
          targetUserId: params.targetUserId,
          peerName: params.peerName,
          peerAvatar: params.peerAvatar,
        });
      } catch (err) {
        showError(err);
        callManager.cleanup();
      }
    },
    []
  );

  const acceptCall = useCallback(async () => {
    const current = callManager.getCurrent();
    if (!current) return;
    try {
      await chatService.acceptCall(current.callId);
      await callManager.acceptIncoming();
      // If offer already arrived, process it
      await callManager.processPendingOffer();
    } catch (err) {
      showError(err);
      callManager.cleanup();
    }
  }, []);

  const rejectCall = useCallback(async () => {
    const current = callManager.getCurrent();
    if (!current) return;
    try {
      await chatService.rejectCall(current.callId);
    } catch (err) {
      console.error(err);
    } finally {
      callManager.cleanup();
    }
  }, []);

  const endCall = useCallback(async () => {
    const current = callManager.getCurrent();
    if (!current) return;
    try {
      await chatService.endCall(current.callId);
    } catch (err) {
      console.error(err);
    } finally {
      callManager.cleanup();
    }
  }, []);

  const toggleMute = useCallback((muted: boolean) => {
    callManager.toggleMute(muted);
  }, []);

  return {
    activeCall,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
  };
};
