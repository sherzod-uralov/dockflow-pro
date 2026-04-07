"use client";

import { Paper, Group, Text, Badge, Box, Stack, Progress, ThemeIcon, Button } from "@mantine/core";
import {
  IconClipboardList,
  IconRefresh,
  IconFile,
  IconFileText,
  IconChartBar,
  IconBell,
  IconRocket,
  IconTrendingUp,
  IconExternalLink,
  IconCalendar,
} from "@tabler/icons-react";
import Link from "next/link";
import { AiCard as AiCardType } from "../type/ai-chat.type";

const TYPE_CONFIG: Record<
  AiCardType["type"],
  { icon: typeof IconClipboardList; color: string; label: string }
> = {
  task: { icon: IconClipboardList, color: "#3498db", label: "Vazifa" },
  workflow: { icon: IconRefresh, color: "#9b59b6", label: "Jarayon" },
  document: { icon: IconFile, color: "#1e3a5f", label: "Hujjat" },
  pdf: { icon: IconFileText, color: "#e74c3c", label: "PDF" },
  kpi: { icon: IconChartBar, color: "#2ecc71", label: "KPI" },
  notification: { icon: IconBell, color: "#f39c12", label: "Bildirishnoma" },
  project: { icon: IconRocket, color: "#16a085", label: "Loyiha" },
  stats: { icon: IconTrendingUp, color: "#34495e", label: "Statistika" },
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#95a5a6",
  MEDIUM: "#3498db",
  HIGH: "#f39c12",
  URGENT: "#e74c3c",
  CRITICAL: "#c0392b",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Past",
  MEDIUM: "O'rta",
  HIGH: "Yuqori",
  URGENT: "Shoshilinch",
  CRITICAL: "Juda muhim",
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];
    return `${day}-${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return dateString;
  }
};

const renderMeta = (card: AiCardType) => {
  const meta = card.meta || {};

  switch (card.type) {
    case "task": {
      const priority = meta.priority as string | undefined;
      const score = meta.score as number | undefined;
      const dueDate = meta.dueDate as string | undefined;
      const ref = meta.ref as string | undefined;
      const completed = meta.completed as boolean | undefined;
      return (
        <Group gap="xs" wrap="wrap">
          {ref && (
            <Badge size="xs" variant="light" color="gray" radius="sm">
              {ref}
            </Badge>
          )}
          {priority && (
            <Badge
              size="xs"
              variant="light"
              radius="sm"
              style={{
                backgroundColor: `${PRIORITY_COLORS[priority] || "#95a5a6"}20`,
                color: PRIORITY_COLORS[priority] || "#95a5a6",
              }}
            >
              {PRIORITY_LABELS[priority] || priority}
            </Badge>
          )}
          {score != null && (
            <Badge size="xs" variant="light" color="blue" radius="sm">
              {score} ball
            </Badge>
          )}
          {dueDate && (
            <Group gap={4}>
              <IconCalendar size={12} color="#868e96" />
              <Text size="xs" c="dimmed">{formatDate(dueDate)}</Text>
            </Group>
          )}
          {completed && (
            <Badge size="xs" variant="light" color="green" radius="sm">
              Bajarilgan
            </Badge>
          )}
        </Group>
      );
    }

    case "workflow": {
      const status = meta.status as string | undefined;
      const currentStep = meta.currentStep as number | undefined;
      const totalSteps = meta.totalSteps as number | undefined;
      const deadline = meta.deadline as string | undefined;
      const percent = currentStep && totalSteps ? Math.round((currentStep / totalSteps) * 100) : 0;
      return (
        <Stack gap={6}>
          <Group gap="xs">
            {status && (
              <Badge size="xs" variant="light" color="violet" radius="sm">
                {status}
              </Badge>
            )}
            {deadline && (
              <Group gap={4}>
                <IconCalendar size={12} color="#868e96" />
                <Text size="xs" c="dimmed">{formatDate(deadline)}</Text>
              </Group>
            )}
          </Group>
          {currentStep != null && totalSteps != null && (
            <Box>
              <Group justify="space-between" mb={2}>
                <Text size="xs" c="dimmed">{currentStep}/{totalSteps} bosqich</Text>
                <Text size="xs" c="dimmed">{percent}%</Text>
              </Group>
              <Progress value={percent} size={4} radius="xl" color="violet" />
            </Box>
          )}
        </Stack>
      );
    }

    case "document": {
      const status = meta.status as string | undefined;
      const type = meta.type as string | undefined;
      const createdBy = meta.createdBy as string | undefined;
      return (
        <Group gap="xs" wrap="wrap">
          {type && (
            <Badge size="xs" variant="light" color="indigo" radius="sm">
              {type}
            </Badge>
          )}
          {status && (
            <Badge size="xs" variant="light" color="blue" radius="sm">
              {status}
            </Badge>
          )}
          {createdBy && (
            <Text size="xs" c="dimmed">{createdBy}</Text>
          )}
        </Group>
      );
    }

    case "pdf": {
      const fileName = meta.fileName as string | undefined;
      return fileName ? (
        <Text size="xs" c="dimmed" lineClamp={1}>{fileName}</Text>
      ) : null;
    }

    case "kpi": {
      const finalScore = meta.finalScore as number | undefined;
      const tasksCompleted = meta.tasksCompleted as number | undefined;
      const tasksOnTime = meta.tasksOnTime as number | undefined;
      const tasksLate = meta.tasksLate as number | undefined;
      const percent = finalScore || 0;
      return (
        <Stack gap={6}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">Yakuniy ball</Text>
            <Text size="sm" fw={700} c="#1e3a5f">{finalScore ?? 0}</Text>
          </Group>
          <Progress value={percent} size={4} radius="xl" color="green" />
          <Group gap="xs">
            {tasksCompleted != null && (
              <Badge size="xs" variant="light" color="blue" radius="sm">
                {tasksCompleted} bajarilgan
              </Badge>
            )}
            {tasksOnTime != null && tasksOnTime > 0 && (
              <Badge size="xs" variant="light" color="green" radius="sm">
                {tasksOnTime} o'z vaqtida
              </Badge>
            )}
            {tasksLate != null && tasksLate > 0 && (
              <Badge size="xs" variant="light" color="red" radius="sm">
                {tasksLate} kech
              </Badge>
            )}
          </Group>
        </Stack>
      );
    }

    case "notification": {
      const message = meta.message as string | undefined;
      const createdAt = meta.createdAt as string | undefined;
      return (
        <Stack gap={4}>
          {message && <Text size="xs" c="#495057" lineClamp={2}>{message}</Text>}
          {createdAt && <Text size="xs" c="dimmed">{formatDate(createdAt)}</Text>}
        </Stack>
      );
    }

    case "project": {
      const status = meta.status as string | undefined;
      const tasksCount = meta.tasksCount as number | undefined;
      const membersCount = meta.membersCount as number | undefined;
      return (
        <Group gap="xs">
          {status && (
            <Badge size="xs" variant="light" color="teal" radius="sm">
              {status}
            </Badge>
          )}
          {tasksCount != null && (
            <Text size="xs" c="dimmed">{tasksCount} vazifa</Text>
          )}
          {membersCount != null && (
            <Text size="xs" c="dimmed">{membersCount} a'zo</Text>
          )}
        </Group>
      );
    }

    case "stats": {
      const totalUsers = meta.totalUsers as number | undefined;
      const activeTasks = meta.activeTasks as number | undefined;
      const completedTasks = meta.completedTasks as number | undefined;
      return (
        <Group gap="md">
          {totalUsers != null && (
            <Box>
              <Text size="xs" c="dimmed">Foydalanuvchi</Text>
              <Text size="sm" fw={600}>{totalUsers}</Text>
            </Box>
          )}
          {activeTasks != null && (
            <Box>
              <Text size="xs" c="dimmed">Faol</Text>
              <Text size="sm" fw={600}>{activeTasks}</Text>
            </Box>
          )}
          {completedTasks != null && (
            <Box>
              <Text size="xs" c="dimmed">Bajarilgan</Text>
              <Text size="sm" fw={600}>{completedTasks}</Text>
            </Box>
          )}
        </Group>
      );
    }

    default:
      return null;
  }
};

interface AiCardProps {
  card: AiCardType;
}

export const AiCard = ({ card }: AiCardProps) => {
  const config = TYPE_CONFIG[card.type] || TYPE_CONFIG.task;
  const Icon = config.icon;

  return (
    <Paper
      p="xs"
      radius="sm"
      withBorder
      style={{
        borderColor: "#e9ecef",
        backgroundColor: "#fff",
      }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <ThemeIcon
          size="md"
          radius="sm"
          variant="light"
          style={{ backgroundColor: `${config.color}15`, color: config.color, flexShrink: 0 }}
        >
          <Icon size={16} />
        </ThemeIcon>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" gap="xs" mb={2} wrap="nowrap">
            <Text size="sm" fw={600} c="#212529" lineClamp={1}>
              {card.title}
            </Text>
            <Badge
              size="xs"
              variant="light"
              radius="sm"
              style={{ backgroundColor: `${config.color}15`, color: config.color, flexShrink: 0 }}
            >
              {config.label}
            </Badge>
          </Group>
          {card.subtitle && (
            <Text size="xs" c="dimmed" mb={6} lineClamp={2}>
              {card.subtitle}
            </Text>
          )}
          {renderMeta(card)}
          {card.actions && card.actions.length > 0 && (
            <Group gap={6} mt={8}>
              {card.actions.map((action, idx) =>
                action.external ? (
                  <Button
                    key={idx}
                    size="compact-xs"
                    variant="light"
                    component="a"
                    href={action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    rightSection={<IconExternalLink size={10} />}
                    style={{ backgroundColor: "#f8f9fa", color: "#1e3a5f" }}
                  >
                    {action.label}
                  </Button>
                ) : (
                  <Button
                    key={idx}
                    size="compact-xs"
                    variant="light"
                    component={Link}
                    href={action.url}
                    style={{ backgroundColor: "#f8f9fa", color: "#1e3a5f" }}
                  >
                    {action.label}
                  </Button>
                )
              )}
            </Group>
          )}
        </Box>
      </Group>
    </Paper>
  );
};

export default AiCard;
