"use client";

import { Group, Avatar, Box, Paper, Stack, Text, Button } from "@mantine/core";
import { IconRobot, IconAlertTriangle, IconRefresh, IconAlertCircle } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import { AiHistoryMessage } from "../type/ai-chat.type";
import AiCard from "./ai-card";

interface AiMessageProps {
  message: AiHistoryMessage;
  onRetry?: () => void;
}

const MarkdownContent = ({ content }: { content: string }) => (
  <Box
    style={{
      fontSize: 14,
      color: "inherit",
      lineHeight: 1.5,
      wordBreak: "break-word",
    }}
  >
    <ReactMarkdown
      components={{
        p: ({ children }) => <p style={{ margin: "4px 0" }}>{children}</p>,
        ul: ({ children }) => <ul style={{ margin: "4px 0", paddingLeft: 18 }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ margin: "4px 0", paddingLeft: 18 }}>{children}</ol>,
        li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1e3a5f", textDecoration: "underline" }}
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code
            style={{
              backgroundColor: "rgba(0,0,0,0.06)",
              padding: "1px 4px",
              borderRadius: 3,
              fontSize: 12,
            }}
          >
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </Box>
);

export const AiMessage = ({ message, onRetry }: AiMessageProps) => {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <Group justify="flex-end" gap="sm" wrap="nowrap" align="flex-start">
        <Paper
          p="xs"
          radius="md"
          style={{
            backgroundColor: "#1e3a5f",
            maxWidth: "80%",
            opacity: message.pending ? 0.6 : 1,
          }}
        >
          <Text size="sm" c="#fff" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {message.content}
          </Text>
        </Paper>
      </Group>
    );
  }

  // Assistant — error bubbles
  const isRateLimit = message.error === "RATE_LIMIT";
  const isAiError = message.error === "AI_ERROR";

  let bubbleStyle: React.CSSProperties = {
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    color: "#212529",
  };

  if (isRateLimit) {
    bubbleStyle = {
      backgroundColor: "#fff8e1",
      border: "1px solid #ffe082",
      color: "#7a5a00",
    };
  } else if (isAiError) {
    bubbleStyle = {
      backgroundColor: "#fff3f3",
      border: "1px solid #fde2e2",
      color: "#a02525",
    };
  }

  return (
    <Group gap="sm" wrap="nowrap" align="flex-start">
      <Avatar
        size="sm"
        radius="xl"
        style={{
          backgroundColor: isAiError ? "#ffe5e5" : isRateLimit ? "#fff3cc" : "#e7f5ff",
          color: isAiError ? "#a02525" : isRateLimit ? "#7a5a00" : "#1e3a5f",
          flexShrink: 0,
        }}
      >
        {isAiError ? (
          <IconAlertCircle size={16} />
        ) : isRateLimit ? (
          <IconAlertTriangle size={16} />
        ) : (
          <IconRobot size={16} />
        )}
      </Avatar>
      <Box style={{ flex: 1, minWidth: 0, maxWidth: "calc(100% - 40px)" }}>
        <Paper p="xs" radius="md" style={bubbleStyle}>
          <MarkdownContent content={message.content} />
          {(isRateLimit || isAiError) && onRetry && (
            <Button
              size="compact-xs"
              variant="light"
              leftSection={<IconRefresh size={12} />}
              onClick={onRetry}
              mt={6}
              styles={{
                root: {
                  backgroundColor: isRateLimit ? "#ffe082" : "#fde2e2",
                  color: isRateLimit ? "#7a5a00" : "#a02525",
                },
              }}
            >
              Qayta urinish
            </Button>
          )}
        </Paper>
        {message.cards && message.cards.length > 0 && (
          <Stack gap={6} mt={6}>
            {message.cards.map((card) => (
              <AiCard key={card.id} card={card} />
            ))}
          </Stack>
        )}
      </Box>
    </Group>
  );
};

export default AiMessage;
