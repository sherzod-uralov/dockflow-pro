"use client";

import { useEffect, useState } from "react";
import { Box, Avatar, Text, ActionIcon, Stack, Group, Tooltip } from "@mantine/core";
import {
  IconPhone,
  IconPhoneOff,
  IconMicrophone,
  IconMicrophoneOff,
  IconChevronDown,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { useChatCall } from "../hook/use-chat-call";
import { colors } from "@/lib/colors";

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
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (!activeCall) {
      setIsMuted(false);
      setDuration(0);
      setMinimized(false);
    }
  }, [activeCall?.callId]);

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

  const statusText =
    activeCall.status === "ringing-out"
      ? "Qo'ng'iroq qilinmoqda..."
      : activeCall.status === "ringing-in"
      ? "Audio qo'ng'iroq..."
      : activeCall.status === "connecting"
      ? "Ulanmoqda..."
      : activeCall.status === "active"
      ? formatDuration(duration)
      : "";

  // ─── Minimized: kichik bar pastda ─────────────────────
  if (minimized && activeCall.status === "active") {
    return (
      <>
        <Box
          onClick={() => setMinimized(false)}
          style={{
            position: "fixed",
            bottom: 24,
            left: 24,
            zIndex: 9999,
            backgroundColor: colors.primary,
            borderRadius: 50,
            padding: "8px 16px 8px 8px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(30, 58, 95, 0.4)",
            color: colors.white,
            border: "2px solid rgba(46, 204, 113, 0.4)",
            animation: "callMinPulse 2s ease-in-out infinite",
          }}
        >
          <Avatar size={36} radius="50%" src={activeCall.peerAvatar} style={{ backgroundColor: colors.white, color: colors.primary }}>
            {getInitials(activeCall.peerName)}
          </Avatar>
          <Box>
            <Text size="xs" c={colors.white} fw={600} lineClamp={1}>
              {activeCall.peerName || "Noma'lum"}
            </Text>
            <Text size="xs" c="rgba(255,255,255,0.7)">
              {formatDuration(duration)}
            </Text>
          </Box>
          <ActionIcon
            size="sm"
            radius="50%"
            onClick={(e) => {
              e.stopPropagation();
              endCall();
            }}
            style={{ backgroundColor: colors.error, marginLeft: 8 }}
          >
            <IconPhoneOff size={14} color={colors.white} />
          </ActionIcon>
        </Box>
        <style jsx global>{`
          @keyframes callMinPulse {
            0%, 100% { box-shadow: 0 8px 24px rgba(30, 58, 95, 0.4), 0 0 0 0 rgba(46, 204, 113, 0.4); }
            50% { box-shadow: 0 8px 24px rgba(30, 58, 95, 0.4), 0 0 0 8px rgba(46, 204, 113, 0); }
          }
        `}</style>
      </>
    );
  }

  // ─── To'liq modal — incoming, ringing-out, connecting, active ─────
  return (
    <Box
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background:
          "radial-gradient(ellipse at center, rgba(30, 58, 95, 0.95) 0%, rgba(15, 30, 50, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "callOverlayFadeIn 0.3s ease",
      }}
    >
      {/* Minimize button (only when active) */}
      {activeCall.status === "active" && (
        <ActionIcon
          variant="subtle"
          size="lg"
          radius="50%"
          onClick={() => setMinimized(true)}
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          <IconChevronDown size={24} />
        </ActionIcon>
      )}

      <Stack align="center" gap={40} style={{ animation: "callContentSlide 0.4s ease" }}>
        {/* Avatar with pulse rings */}
        <Box pos="relative" style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Pulse rings */}
          {(activeCall.status === "ringing-in" || activeCall.status === "ringing-out") && (
            <>
              <Box className="call-ring call-ring-1" />
              <Box className="call-ring call-ring-2" />
              <Box className="call-ring call-ring-3" />
            </>
          )}
          <Avatar
            size={160}
            radius="50%"
            src={activeCall.peerAvatar}
            style={{
              border: "4px solid rgba(255, 255, 255, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: colors.white,
              fontSize: 48,
              fontWeight: 700,
              position: "relative",
              zIndex: 2,
            }}
          >
            {getInitials(activeCall.peerName)}
          </Avatar>
        </Box>

        {/* Name + Status */}
        <Stack align="center" gap={6}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: colors.white,
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            {activeCall.peerName || "Noma'lum"}
          </Text>
          <Text
            size="md"
            c="rgba(255, 255, 255, 0.7)"
            style={{
              fontVariantNumeric: "tabular-nums",
              letterSpacing: 0.5,
            }}
          >
            {statusText}
          </Text>
        </Stack>

        {/* Controls */}
        <Group gap={32} mt={20}>
          {activeCall.status === "ringing-in" ? (
            <>
              <Tooltip label="Rad etish" withArrow>
                <ActionIcon
                  size={72}
                  radius="50%"
                  onClick={rejectCall}
                  style={{
                    backgroundColor: colors.error,
                    boxShadow: "0 8px 24px rgba(231, 76, 60, 0.5)",
                    transform: "rotate(135deg)",
                  }}
                >
                  <IconPhone size={32} color={colors.white} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Qabul qilish" withArrow>
                <ActionIcon
                  size={72}
                  radius="50%"
                  onClick={acceptCall}
                  className="call-accept-btn"
                  style={{
                    backgroundColor: colors.success,
                    boxShadow: "0 8px 24px rgba(46, 204, 113, 0.5)",
                  }}
                >
                  <IconPhone size={32} color={colors.white} />
                </ActionIcon>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip label={isMuted ? "Mikrofonni yoqish" : "Mikrofonni o'chirish"} withArrow>
                <ActionIcon
                  size={64}
                  radius="50%"
                  onClick={handleToggleMute}
                  style={{
                    backgroundColor: isMuted ? "rgba(231, 76, 60, 0.3)" : "rgba(255, 255, 255, 0.15)",
                    border: isMuted ? "1px solid rgba(231, 76, 60, 0.5)" : "1px solid rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {isMuted ? (
                    <IconMicrophoneOff size={26} color="#ff6b6b" />
                  ) : (
                    <IconMicrophone size={26} color={colors.white} />
                  )}
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Tugatish" withArrow>
                <ActionIcon
                  size={72}
                  radius="50%"
                  onClick={endCall}
                  style={{
                    backgroundColor: colors.error,
                    boxShadow: "0 8px 24px rgba(231, 76, 60, 0.5)",
                    transform: "rotate(135deg)",
                  }}
                >
                  <IconPhone size={32} color={colors.white} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={isSpeakerOn ? "Karnayni o'chirish" : "Karnayni yoqish"} withArrow>
                <ActionIcon
                  size={64}
                  radius="50%"
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {isSpeakerOn ? (
                    <IconVolume size={26} color={colors.white} />
                  ) : (
                    <IconVolumeOff size={26} color={colors.white} />
                  )}
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </Group>
      </Stack>

      <style jsx global>{`
        @keyframes callOverlayFadeIn {
          from { opacity: 0; backdrop-filter: blur(0); }
          to { opacity: 1; backdrop-filter: blur(20px); }
        }
        @keyframes callContentSlide {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .call-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(46, 204, 113, 0.4);
          animation: callRingPulse 2.5s ease-out infinite;
        }
        .call-ring-1 { animation-delay: 0s; }
        .call-ring-2 { animation-delay: 0.8s; }
        .call-ring-3 { animation-delay: 1.6s; }
        @keyframes callRingPulse {
          0% { transform: scale(0.85); opacity: 1; border-width: 3px; }
          100% { transform: scale(1.4); opacity: 0; border-width: 1px; }
        }
        .call-accept-btn {
          animation: callAcceptBounce 1.5s ease-in-out infinite;
        }
        @keyframes callAcceptBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </Box>
  );
};
