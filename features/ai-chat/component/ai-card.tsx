"use client";

import React from "react";
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
  IconUser,
  IconCircleCheck,
  IconSparkles,
  IconDownload,
} from "@tabler/icons-react";
import Link from "next/link";
import { AiCard as AiCardType } from "../type/ai-chat.type";
import { formatDate } from "@/lib/date-utils";
import { colors } from "@/lib/colors";

const TYPE_CONFIG: Record<
  AiCardType["type"],
  { icon: typeof IconClipboardList; color: string; label: string }
> = {
  task: { icon: IconClipboardList, color: colors.info, label: "Vazifa" },
  task_created: { icon: IconSparkles, color: colors.success, label: "Yaratildi" },
  action_result: { icon: IconCircleCheck, color: colors.success, label: "Bajarildi" },
  workflow: { icon: IconRefresh, color: "#9b59b6", label: "Jarayon" },
  document: { icon: IconFile, color: colors.primary, label: "Hujjat" },
  pdf: { icon: IconFileText, color: colors.error, label: "PDF" },
  kpi: { icon: IconChartBar, color: colors.success, label: "KPI" },
  notification: { icon: IconBell, color: colors.warning, label: "Bildirishnoma" },
  project: { icon: IconRocket, color: "#16a085", label: "Loyiha" },
  stats: { icon: IconTrendingUp, color: "#34495e", label: "Statistika" },
  user: { icon: IconUser, color: colors.info, label: "Foydalanuvchi" },
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

// Xavfsiz string converter — object/array kelsa name ni oladi yoki JSON qiladi
const safeText = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.name === "string") return obj.name;
    if (typeof obj.title === "string") return obj.title;
    if (typeof obj.label === "string") return obj.label;
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return "";
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#95a5a6",
  MEDIUM: colors.info,
  HIGH: colors.warning,
  URGENT: colors.error,
  CRITICAL: "#c0392b",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Past",
  MEDIUM: "O'rta",
  HIGH: "Yuqori",
  URGENT: "Shoshilinch",
  CRITICAL: "Juda muhim",
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
              <IconCalendar size={12} color={colors.textDimmed} />
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
                <IconCalendar size={12} color={colors.textDimmed} />
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
      const fileSize = meta.fileSize as number | undefined;
      return (
        <Group gap={6}>
          {fileName && (
            <Text size="xs" c="dimmed" lineClamp={1} style={{ flex: 1 }}>
              {fileName}
            </Text>
          )}
          {fileSize != null && (
            <Badge size="xs" variant="light" color="gray" radius="sm">
              {formatBytes(fileSize)}
            </Badge>
          )}
        </Group>
      );
    }

    case "task_created": {
      const ref = meta.ref as string | undefined;
      const priority = meta.priority as string | undefined;
      return (
        <Group gap="xs" wrap="wrap">
          {ref && (
            <Badge size="xs" variant="light" color="green" radius="sm">
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
        </Group>
      );
    }

    case "action_result": {
      const success = meta.success as boolean | undefined;
      return (
        <Badge
          size="xs"
          variant="light"
          color={success === false ? "red" : "green"}
          radius="sm"
        >
          {success === false ? "Xato" : "Muvaffaqiyatli"}
        </Badge>
      );
    }

    case "user": {
      const fullname = safeText(meta.fullname);
      const role = safeText(meta.role);
      const department = safeText(meta.department);
      return (
        <Stack gap={2}>
          {fullname && (
            <Text size="xs" c={colors.textSecondary} fw={500}>
              {fullname}
            </Text>
          )}
          <Group gap="xs">
            {role && (
              <Badge size="xs" variant="light" color="blue" radius="sm">
                {role}
              </Badge>
            )}
            {department && (
              <Text size="xs" c="dimmed">{department}</Text>
            )}
          </Group>
        </Stack>
      );
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
            <Text size="sm" fw={700} c={colors.primary}>{finalScore ?? 0}</Text>
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
          {message && <Text size="xs" c={colors.textSecondary} lineClamp={2}>{message}</Text>}
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
      // Statistika maydonlari uchun universal label'lar
      const STAT_LABELS: Record<string, string> = {
        kpiScore: "KPI ball",
        avgKpiScore: "O'rtacha KPI",
        completionRate: "Bajarilish %",
        tasksTotal: "Vazifalar",
        tasksActive: "Faol",
        tasksCompleted: "Bajarilgan",
        tasksOverdue: "Muddati o'tgan",
        projectsCount: "Loyihalar",
        documentsTotal: "Hujjatlar",
        documentsPending: "Kutilmoqda",
        documentsApproved: "Tasdiqlangan",
        activeWorkflows: "Faol jarayonlar",
        pendingMySteps: "Mening bosqichlarim",
        unreadNotifications: "O'qilmagan",
        totalUsers: "Foydalanuvchilar",
        activeTasks: "Faol vazifalar",
      };

      const STAT_COLORS: Record<string, string> = {
        kpiScore: colors.success,
        avgKpiScore: colors.success,
        completionRate: colors.success,
        tasksOverdue: colors.error,
        documentsPending: colors.warning,
        unreadNotifications: colors.warning,
      };

      const entries = Object.entries(meta)
        .filter(([_, value]) => typeof value === "number")
        .filter(([key]) => STAT_LABELS[key]);

      if (entries.length === 0) return null;

      return (
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: 8,
          }}
        >
          {entries.map(([key, value]) => (
            <Box
              key={key}
              p={6}
              style={{
                backgroundColor: colors.bg,
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Text size="xs" c="dimmed" lineClamp={1}>
                {STAT_LABELS[key]}
              </Text>
              <Text size="md" fw={700} c={STAT_COLORS[key] || colors.textPrimary}>
                {key === "completionRate" || key === "avgKpiScore" || key === "kpiScore"
                  ? `${value as number}${key === "completionRate" ? "%" : ""}`
                  : (value as number)}
              </Text>
            </Box>
          ))}
        </Box>
      );
    }

    default:
      return null;
  }
};

interface AiCardProps {
  card: AiCardType;
}

// Error boundary — agar card render xato bersa crash o'rniga fallback ko'rsatadi
class CardErrorBoundary extends React.Component<
  { children: React.ReactNode; cardType: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("AiCard render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper p="xs" radius="sm" withBorder style={{ borderColor: "#fde2e2", backgroundColor: "#fff3f3" }}>
          <Text size="xs" c="#a02525">
            Karta ko'rsatishda xato ({this.props.cardType})
          </Text>
        </Paper>
      );
    }
    return this.props.children;
  }
}

const AiCardInner = ({ card }: AiCardProps) => {
  const config = TYPE_CONFIG[card.type] || TYPE_CONFIG.task;
  const Icon = config.icon;

  return (
    <Paper
      p="xs"
      radius="sm"
      withBorder
      style={{
        borderColor: colors.border,
        backgroundColor: colors.white,
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
            <Text size="sm" fw={600} c=colors.textPrimary lineClamp={1}>
              {safeText(card.title)}
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
              {safeText(card.subtitle)}
            </Text>
          )}
          {renderMeta(card)}
          {card.actions && card.actions.filter((a) => a.url).length > 0 && (
            <Group gap={6} mt={8}>
              {card.actions
                .filter((action) => action.url)
                .map((action, idx) =>
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
                      style={{ backgroundColor: colors.bg, color: colors.primary }}
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
                      style={{ backgroundColor: colors.bg, color: colors.primary }}
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

export const AiCard = ({ card }: AiCardProps) => (
  <CardErrorBoundary cardType={card.type}>
    <AiCardInner card={card} />
  </CardErrorBoundary>
);

export default AiCard;
