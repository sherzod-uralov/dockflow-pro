"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from "@tabler/icons-react";

interface Props {
  src: string;
  duration?: number;
  isOwn: boolean;
}

const formatTime = (sec: number) => {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// Statik waveform — har voice xabar uchun bir xil emas, src asosida hash
const generateWaveform = (src: string, bars: number) => {
  let seed = 0;
  for (let i = 0; i < src.length; i++) seed = (seed * 31 + src.charCodeAt(i)) & 0x7fffffff;
  const result: number[] = [];
  for (let i = 0; i < bars; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const v = 0.25 + (seed / 233280) * 0.75; // 0.25..1.0
    result.push(v);
  }
  return result;
};

export const VoicePlayer = ({ src, duration = 0, isOwn }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);

  const BAR_COUNT = 32;
  const waveform = useMemo(() => generateWaveform(src, BAR_COUNT), [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      if (isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.error("voice play", err));
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audioDuration;
    setCurrentTime(audio.currentTime);
  };

  const progress = audioDuration > 0 ? currentTime / audioDuration : 0;

  // Ranglar
  const playedColor = isOwn ? "#fff" : "#1e3a5f";
  const unplayedColor = isOwn ? "rgba(255, 255, 255, 0.4)" : "#cdd5dd";
  const buttonBg = isOwn ? "#fff" : "#1e3a5f";
  const buttonIcon = isOwn ? "#1e3a5f" : "#fff";
  const textColor = isOwn ? "rgba(255, 255, 255, 0.85)" : "#868e96";

  return (
    <Box>
      <Group gap={10} wrap="nowrap" style={{ minWidth: 220 }}>
        <ActionIcon
          size={36}
          radius="50%"
          onClick={togglePlay}
          style={{ backgroundColor: buttonBg, color: buttonIcon, flexShrink: 0 }}
        >
          {isPlaying ? <IconPlayerPauseFilled size={16} /> : <IconPlayerPlayFilled size={16} />}
        </ActionIcon>

        <Box style={{ flex: 1, minWidth: 0 }}>
          {/* Waveform */}
          <Box
            onClick={handleSeek}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              height: 28,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {waveform.map((amp, i) => {
              const barProgress = (i + 0.5) / BAR_COUNT;
              const played = barProgress <= progress;
              return (
                <Box
                  key={i}
                  style={{
                    flex: 1,
                    height: `${Math.max(4, amp * 24)}px`,
                    backgroundColor: played ? playedColor : unplayedColor,
                    borderRadius: 2,
                    transition: "background-color 0.1s",
                  }}
                />
              );
            })}
          </Box>

          {/* Duration */}
          <Text size="xs" c={textColor} mt={2}>
            {formatTime(isPlaying || currentTime > 0 ? currentTime : audioDuration)}
          </Text>
        </Box>
      </Group>

      <audio ref={audioRef} src={src} preload="metadata" style={{ display: "none" }} />
    </Box>
  );
};
