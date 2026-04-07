"use client";

import { Group, Avatar, Box, Paper, Stack, Text } from "@mantine/core";
import { IconRobot } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import { AiHistoryMessage } from "../type/ai-chat.type";
import AiCard from "./ai-card";

interface AiMessageProps {
  message: AiHistoryMessage;
}

export const AiMessage = ({ message }: AiMessageProps) => {
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
          }}
        >
          <Text size="sm" c="#fff" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {message.content}
          </Text>
        </Paper>
      </Group>
    );
  }

  return (
    <Group gap="sm" wrap="nowrap" align="flex-start">
      <Avatar
        size="sm"
        radius="xl"
        style={{ backgroundColor: "#e7f5ff", color: "#1e3a5f", flexShrink: 0 }}
      >
        <IconRobot size={16} />
      </Avatar>
      <Box style={{ flex: 1, minWidth: 0, maxWidth: "calc(100% - 40px)" }}>
        <Paper
          p="xs"
          radius="md"
          style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid #e9ecef",
          }}
        >
          <Box
            className="ai-markdown"
            style={{
              fontSize: 14,
              color: "#212529",
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
                      backgroundColor: "#e9ecef",
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
              {message.content}
            </ReactMarkdown>
          </Box>
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
