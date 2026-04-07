"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  ActionIcon,
  Box,
  Group,
  Text,
  Textarea,
  ScrollArea,
  Stack,
  Loader,
  Tooltip,
  Button,
  Paper,
  Avatar,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconRobot,
  IconX,
  IconSend,
  IconTrash,
  IconClipboardList,
  IconClock,
  IconChartBar,
  IconRocket,
} from "@tabler/icons-react";
import {
  useGetChatHistory,
  useSendChatMessage,
  useClearChatHistory,
} from "../hook/ai-chat.hook";
import { AiHistoryMessage } from "../type/ai-chat.type";
import AiMessage from "./ai-message";

const SUGGESTED_QUESTIONS = [
  { icon: IconClipboardList, text: "Bugungi vazifalarim" },
  { icon: IconClock, text: "Muddati o'tgan vazifalar" },
  { icon: IconChartBar, text: "Mening KPI'm" },
  { icon: IconRocket, text: "Loyihalarim ro'yxati" },
];

const WELCOME_MESSAGE = `Salom! Men **DocFlow AI yordamchisiman**. Quyidagilarni so'rashingiz mumkin:

• Mening bugungi vazifalarim
• Muddati o'tgan vazifalar
• Mening KPI ko'rsatkichim
• Loyihalarim ro'yxati`;

export const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<AiHistoryMessage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [lastUserText, setLastUserText] = useState<string>("");
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data: history, isLoading: isHistoryLoading } = useGetChatHistory(isOpen);
  const sendMutation = useSendChatMessage();
  const clearMutation = useClearChatHistory();

  // Initial history load → seed local state once
  useEffect(() => {
    if (history && !historyLoaded) {
      setMessages(history);
      setHistoryLoaded(true);
    }
  }, [history, historyLoaded]);

  // Auto-scroll to bottom on new messages or typing indicator
  useEffect(() => {
    if (scrollViewportRef.current) {
      requestAnimationFrame(() => {
        scrollViewportRef.current?.scrollTo({
          top: scrollViewportRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [messages.length, sendMutation.isLoading, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sendMutation.isLoading) return;

    const tempId = `tmp-${Date.now()}`;
    const optimistic: AiHistoryMessage = {
      id: tempId,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      pending: true,
    };

    // 1) Darhol user xabarini ko'rsatamiz
    setMessages((prev) => [...prev, optimistic]);
    setLastUserText(text);
    setInputValue("");

    try {
      const res = await sendMutation.mutateAsync(text);

      // 2) Pending'ni real user xabariga + assistant javobiga almashtiramiz
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        {
          id: `${res.id}-user`,
          role: "user",
          content: text,
          timestamp: res.timestamp,
        },
        {
          id: res.id,
          role: "assistant",
          content: res.message,
          cards: res.cards || [],
          timestamp: res.timestamp,
          error: res.error,
        },
      ]);
    } catch {
      // Xato bo'lsa pending xabarni olib tashlaymiz
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleRetry = () => {
    if (lastUserText && !sendMutation.isLoading) {
      sendMessage(lastUserText);
    }
  };

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    if (typeof window !== "undefined" && !window.confirm("Suhbat tarixini tozalashni xohlaysizmi?")) return;
    clearMutation.mutate(undefined, {
      onSuccess: () => {
        setMessages([]);
        setLastUserText("");
      },
    });
  };

  const isEmpty = !isHistoryLoading && messages.length === 0;
  const isSending = sendMutation.isLoading;

  // Floating button (closed state) — yarim ko'rinib turadi, hover'da to'liq chiqadi
  if (!isOpen) {
    return (
      <>
        <Tooltip label="DocFlow AI yordamchi" position="left" withArrow>
          <ActionIcon
            size={56}
            radius="xl"
            onClick={() => setIsOpen(true)}
            className="ai-bot-toggle"
            style={{
              position: "fixed",
              bottom: 24,
              right: -20,
              zIndex: 9999,
              backgroundColor: "#1e3a5f",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(30, 58, 95, 0.35)",
              transition: "right 0.25s ease, transform 0.25s ease",
            }}
          >
            <IconRobot size={26} />
          </ActionIcon>
        </Tooltip>
        <style jsx global>{`
          .ai-bot-toggle:hover {
            right: 16px !important;
            transform: scale(1.05);
          }
        `}</style>
      </>
    );
  }

  // Open panel
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }
    : {
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        width: 400,
        height: 600,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        borderRadius: 16,
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.2)",
        border: "1px solid #e9ecef",
        overflow: "hidden",
      };

  return (
    <Paper style={panelStyle} radius={isMobile ? 0 : "lg"}>
      {/* Header */}
      <Group
        justify="space-between"
        p="sm"
        style={{
          borderBottom: "1px solid #e9ecef",
          backgroundColor: "#1e3a5f",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <Group gap="sm">
          <Avatar size="sm" radius="xl" style={{ backgroundColor: "#fff", color: "#1e3a5f" }}>
            <IconRobot size={16} />
          </Avatar>
          <Box>
            <Text size="sm" fw={600} c="#fff">
              DocFlow AI
            </Text>
            <Text size="xs" c="rgba(255,255,255,0.7)">
              Yordamchi
            </Text>
          </Box>
        </Group>
        <Group gap={4}>
          {messages.length > 0 && (
            <Tooltip label="Tarixni tozalash" withArrow>
              <ActionIcon
                variant="subtle"
                size="md"
                onClick={handleClearHistory}
                loading={clearMutation.isLoading}
                style={{ color: "#fff" }}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          <ActionIcon
            variant="subtle"
            size="md"
            onClick={() => setIsOpen(false)}
            style={{ color: "#fff" }}
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Messages */}
      <ScrollArea
        viewportRef={scrollViewportRef}
        style={{ flex: 1, minHeight: 0 }}
        offsetScrollbars
      >
        <Box p="sm">
          {isHistoryLoading && messages.length === 0 ? (
            <Box style={{ display: "flex", justifyContent: "center", padding: 32 }}>
              <Loader size="sm" color="#1e3a5f" />
            </Box>
          ) : isEmpty ? (
            <Stack gap="md">
              <AiMessage
                message={{
                  id: "welcome",
                  role: "assistant",
                  content: WELCOME_MESSAGE,
                  timestamp: new Date().toISOString(),
                }}
              />
              <Stack gap={6}>
                {SUGGESTED_QUESTIONS.map((q) => {
                  const Icon = q.icon;
                  return (
                    <Button
                      key={q.text}
                      variant="light"
                      size="sm"
                      radius="md"
                      leftSection={<Icon size={14} />}
                      onClick={() => sendMessage(q.text)}
                      disabled={isSending}
                      styles={{
                        root: {
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #e9ecef",
                          color: "#1e3a5f",
                          justifyContent: "flex-start",
                          height: 36,
                        },
                        inner: { justifyContent: "flex-start" },
                      }}
                    >
                      {q.text}
                    </Button>
                  );
                })}
              </Stack>
            </Stack>
          ) : (
            <Stack gap="md">
              {messages.map((msg) => (
                <AiMessage
                  key={msg.id}
                  message={msg}
                  onRetry={msg.error ? handleRetry : undefined}
                />
              ))}
              {isSending && (
                <Group gap="sm" wrap="nowrap" align="flex-start">
                  <Avatar
                    size="sm"
                    radius="xl"
                    style={{ backgroundColor: "#e7f5ff", color: "#1e3a5f" }}
                  >
                    <IconRobot size={16} />
                  </Avatar>
                  <Paper
                    p="xs"
                    radius="md"
                    style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
                  >
                    <Group gap={4}>
                      <Text size="xs" c="dimmed">AI o'ylayapti</Text>
                      <span className="ai-typing-dots">
                        <span>.</span><span>.</span><span>.</span>
                      </span>
                    </Group>
                  </Paper>
                </Group>
              )}
            </Stack>
          )}
        </Box>
      </ScrollArea>

      {/* Input */}
      <Box
        p="sm"
        style={{
          borderTop: "1px solid #e9ecef",
          backgroundColor: "#fff",
          flexShrink: 0,
        }}
      >
        <Group gap="xs" align="flex-end">
          <Textarea
            ref={inputRef}
            placeholder={isSending ? "AI javob yozmoqda..." : "Savol yozing..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autosize
            minRows={1}
            maxRows={4}
            disabled={isSending}
            style={{ flex: 1 }}
            styles={{
              input: {
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
                "&:focus": { borderColor: "#1e3a5f" },
              },
            }}
          />
          <ActionIcon
            size="lg"
            radius="md"
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isSending}
            loading={isSending}
            style={{
              backgroundColor: "#1e3a5f",
              color: "#fff",
            }}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
      </Box>

      {/* Typing dots animation */}
      <style jsx global>{`
        .ai-typing-dots span {
          display: inline-block;
          animation: ai-typing-bounce 1.4s infinite ease-in-out;
          color: #868e96;
          font-weight: 700;
        }
        .ai-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ai-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ai-typing-bounce {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </Paper>
  );
};

export default AiChatWidget;
