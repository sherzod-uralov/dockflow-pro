"use client";

import { useEffect, useState } from "react";
import { Box, Group, Avatar, Text, ActionIcon, Stack, Paper, Tooltip } from "@mantine/core";
import {
  IconPhone,
  IconPhoneOff,
  IconMicrophone,
  IconMicrophoneOff,
} from "@tabler/icons-react";
import { useChatCall } from "../hook/use-chat-call";

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((n) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2);

const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const CallOverlay = () => {
  const { activeCall, acceptCall, rejectCall, endCall, toggleMute } = useChatCall();
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  // Reset mute on call change
  useEffect(() => {
    if (!activeCall) {
      setIsMuted(false);
      setDuration(0);
    }
  }, [activeCall?.callId]);

  // Duration timer
  useEffect(() => {
    if (activeCall?.status !== "active" || !activeCall.startedAt) return;
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - (activeCall.startedAt || 0)) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCall?.status, activeCall?.startedAt]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    toggleMute(next);
  };

  if (!activeCall) return null;

  // ─── Incoming call modal (full screen overlay) ─────────
  if (activeCall.status === "ringing-in") {
    return (
      <Box
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <Stack align="center" gap="xl">
          <Stack align="center" gap="md">
            <Avatar
              size={120}
              radius="50%"
              src={activeCall.peerAvatar}
              style={{
                border: "4px solid #fff",
                boxShadow: "0 0 0 8px rgba(30, 58, 95, 0.3)",
                animation: "pulse 2s infinite",
              }}
            >
              <Text size="xl" fw={600}>
                {getInitials(activeCall.peerName)}
              </Text>
            </Avatar>
            <Text size="xl" fw={600} c="#fff">
              {activeCall.peerName || "Noma'lum"}
            </Text>
            <Text size="sm" c="rgba(255,255,255,0.7)">
              Audio qo'ng'iroq...
            </Text>
          </Stack>

          <Group gap="xl">
            <Tooltip label="Rad etish">
              <ActionIcon
                size={64}
                radius="50%"
                onClick={rejectCall}
                style={{ backgroundColor: "#e74c3c" }}
              >
                <IconPhoneOff size={28} color="#fff" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Qabul qilish">
              <ActionIcon
                size={64}
                radius="50%"
                onClick={acceptCall}
                style={{ backgroundColor: "#2ecc71" }}
              >
                <IconPhone size={28} color="#fff" />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Stack>

        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 8px rgba(30, 58, 95, 0.3); }
            50% { box-shadow: 0 0 0 16px rgba(30, 58, 95, 0.1); }
          }
        `}</style>
      </Box>
    );
  }

  // ─── Active call — floating bar ───────────────────────
  const statusText =
    activeCall.status === "ringing-out"
      ? "Qo'ng'iroq..."
      : activeCall.status === "connecting"
      ? "Ulanmoqda..."
      : activeCall.status === "active"
      ? formatDuration(duration)
      : "";

  return (
    <Paper
      shadow="xl"
      radius="md"
      p="md"
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 9998,
        backgroundColor: "#1e3a5f",
        color: "#fff",
        minWidth: 320,
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Avatar
            size="md"
            radius="xl"
            src={activeCall.peerAvatar}
            style={{
              backgroundColor: "#fff",
              color: "#1e3a5f",
            }}
          >
            {getInitials(activeCall.peerName)}
          </Avatar>
          <Box>
            <Text size="sm" fw={600} c="#fff" lineClamp={1}>
              {activeCall.peerName || "Noma'lum"}
            </Text>
            <Text size="xs" c="rgba(255,255,255,0.7)">
              {statusText}
            </Text>
          </Box>
        </Group>
        <Group gap={6}>
          <Tooltip label={isMuted ? "Mikrofonni yoqish" : "Mikrofonni o'chirish"}>
            <ActionIcon
              size="lg"
              radius="50%"
              onClick={handleToggleMute}
              style={{
                backgroundColor: isMuted ? "rgba(231, 76, 60, 0.3)" : "rgba(255, 255, 255, 0.15)",
              }}
            >
              {isMuted ? (
                <IconMicrophoneOff size={18} color="#ff6b6b" />
              ) : (
                <IconMicrophone size={18} color="#fff" />
              )}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Tugatish">
            <ActionIcon
              size="lg"
              radius="50%"
              onClick={endCall}
              style={{ backgroundColor: "#e74c3c" }}
            >
              <IconPhoneOff size={18} color="#fff" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
};
