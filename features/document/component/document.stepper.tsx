"use client";

import React, { memo } from "react";
import {
  Paper,
  Text,
  Group,
  Box,
  Badge,
  Avatar,
  Stack,
  Divider,
  ScrollArea,
  Tooltip,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconClock,
  IconUser,
  IconQrcode,
  IconEye,
  IconEdit,
  IconUsers,
  IconWritingSign,
} from "@tabler/icons-react";
import { formatDateTime } from "@/lib/date-utils";
import { colors } from "@/lib/colors";
import Link from "next/link";


interface WorkflowStep {
  id?: string;
  assignedToUser: {
    fullname: string;
    username?: string;
    avatarUrl?: string;
  };
  status: string;
  isRejected: boolean;
  actionType: string;
  completedAt?: string;
  startedAt?: string;
  createdAt?: string;
  rejectionReason?: string;
  actions?: Array<{
    comment?: string;
    performedBy?: { fullname: string; username?: string };
  }>;
}

const getActionTypeName = (actionType: string) => {
  switch (actionType) {
    case "QR_CODE":
      return "QR kod qo'shish";
    case "APPROVAL":
      return "Tasdiqlash";
    case "VIEW":
    case "REVIEW":
      return "Ko'rib chiqish";
    case "EDIT":
      return "Tahrirlash";
    case "SIGN":
      return "Imzolash";
    case "ACKNOWLEDGE":
      return "Tasdiqlash";
    default:
      return "Tasdiqlash";
  }
};

const getActionIcon = (step: WorkflowStep) => {
  const { isRejected, status, actionType } = step;

  if (isRejected) {
    return <IconX size={16} />;
  }

  if (status !== "COMPLETED") {
    return <IconClock size={16} />;
  }

  switch (actionType) {
    case "QR_CODE":
      return <IconQrcode size={16} />;
    case "SIGN":
      return <IconWritingSign size={16} />;
    case "ACKNOWLEDGE":
      return <IconCheck size={16} />;
    case "VIEW":
    case "REVIEW":
      return <IconEye size={16} />;
    case "EDIT":
      return <IconEdit size={16} />;
    default:
      return <IconCheck size={16} />;
  }
};

const getStatusColor = (status: string, isRejected: boolean): string => {
  if (isRejected) return colors.errorDark;
  if (status === "COMPLETED") return colors.successDark;
  return colors.textDimmed;
};

const getStatusBgColor = (status: string, isRejected: boolean): string => {
  if (isRejected) return colors.errorBg;
  if (status === "COMPLETED") return colors.successBg;
  return colors.bgSubtle;
};

// Step Card komponenti
const StepCard = memo(({ step, isLast }: { step: WorkflowStep; isLast: boolean }) => {
  const statusColor = getStatusColor(step.status, step.isRejected);
  const statusBgColor = getStatusBgColor(step.status, step.isRejected);

  const tooltipContent = (
    <Stack gap="xs" p="xs">
      <Box>
        <Text size="xs" c="dimmed" fw={600}>Foydalanuvchi</Text>
        <Text size="sm" fw={500}>{step.assignedToUser.fullname}</Text>
        {step.assignedToUser.username && (
          <Text size="xs" c="dimmed">@{step.assignedToUser.username}</Text>
        )}
      </Box>

      <Divider />

      <Box>
        <Text size="xs" c="dimmed" fw={600}>Harakat turi</Text>
        <Text size="sm">{getActionTypeName(step.actionType)}</Text>
      </Box>

      <Divider />

      <Box>
        <Text size="xs" c="dimmed" fw={600}>Holati</Text>
        <Group gap={6} mt={4}>
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: statusColor,
            }}
          />
          <Text size="sm" style={{ color: statusColor }}>
            {step.isRejected ? "Rad etildi" : step.status === "COMPLETED" ? "Tugallandi" : "Kutilmoqda"}
          </Text>
        </Group>
      </Box>

      {step.startedAt && (
        <>
          <Divider />
          <Box>
            <Text size="xs" c="dimmed" fw={600}>Boshlandi</Text>
            <Text size="sm">
              {formatDateTime(step.startedAt)}
            </Text>
          </Box>
        </>
      )}

      {step.completedAt && (
        <>
          <Divider />
          <Box>
            <Text size="xs" c="dimmed" fw={600}>Tugallandi</Text>
            <Text size="sm">
              {formatDateTime(step.completedAt)}
            </Text>
          </Box>
        </>
      )}

      {step.isRejected && step.rejectionReason && (
        <>
          <Divider />
          <Box>
            <Text size="xs" c="dimmed" fw={600}>Rad etish sababi</Text>
            <Text size="sm" c={colors.errorDark} fs="italic">{step.rejectionReason}</Text>
          </Box>
        </>
      )}

      {step.actions?.[0]?.comment && (
        <>
          <Divider />
          <Box>
            <Text size="xs" c="dimmed" fw={600}>Izoh</Text>
            <Text size="sm" fs="italic">"{step.actions[0].comment}"</Text>
          </Box>
        </>
      )}
    </Stack>
  );

  return (
    <Group gap={0} wrap="nowrap" align="flex-start">
      {/* Step content */}
      <Box style={{ minWidth: 120, maxWidth: 150 }}>
        <Tooltip
          label={tooltipContent}
          position="top"
          withArrow
          multiline
          w={280}
          styles={{
            tooltip: {
              backgroundColor: colors.white,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Link
            href={`/dashboard/workflow/43204a7f-adb8-4e21-8e2e-fd6ead0a4da9#${step.id}`}
            style={{ textDecoration: "none" }}
          >
            <Stack gap="xs" align="center">
              {/* Icon */}
              <ThemeIcon
                size="lg"
                radius="xl"
                style={{
                  backgroundColor: statusBgColor,
                  color: statusColor,
                }}
              >
                {getActionIcon(step)}
              </ThemeIcon>

              {/* User info */}
              <Stack gap={4} align="center">
                <Group gap={4}>
                  <Avatar
                    size="xs"
                    radius="xl"
                    src={step.assignedToUser.avatarUrl}
                    style={{ backgroundColor: colors.primary }}
                  >
                    <IconUser size={10} />
                  </Avatar>
                  <Text size="xs" fw={500} c={colors.textPrimary} lineClamp={1}>
                    {step.assignedToUser.fullname.split(" ")[0]}
                  </Text>
                </Group>

                {step.isRejected && (
                  <Badge size="xs" radius="sm" color="red" variant="light">
                    Rad etildi
                  </Badge>
                )}

                <Text size="xs" c="dimmed">
                  {getActionTypeName(step.actionType)}
                </Text>

                {step.completedAt && (
                  <Text size="xs" c="dimmed">
                    {formatDateTime(step.completedAt)}
                  </Text>
                )}
              </Stack>
            </Stack>
          </Link>
        </Tooltip>
      </Box>

      {/* Connector line */}
      {!isLast && (
        <Box
          style={{
            flex: 1,
            height: 2,
            backgroundColor: colors.border,
            marginTop: 18,
            minWidth: 24,
          }}
        />
      )}
    </Group>
  );
});

StepCard.displayName = "StepCard";

const WorkflowTracker = ({ workflow }: { workflow: any }) => {
  if (!workflow || workflow.length === 0) return null;

  const workflowData = workflow[0];
  const steps: WorkflowStep[] = workflowData?.workflowSteps || [];

  const lastCompleted = steps[steps.length - 1]?.completedAt;
  const firstCreated = steps[0]?.createdAt;
  const totalTime =
    lastCompleted && firstCreated
      ? Math.round(
          (new Date(lastCompleted).getTime() - new Date(firstCreated).getTime()) / 60000
        )
      : 0;

  return (
    <Paper
      p="md"
      radius="sm"
      withBorder
      style={{ borderColor: colors.border, marginBottom: 16 }}
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Box>
            <Group gap="xs">
              <IconUsers size={18} color={colors.primary} />
              <Text size="md" fw={600} c={colors.textPrimary}>
                Jarayon Tarixi
              </Text>
            </Group>
            <Text size="sm" c="dimmed" mt={4}>
              {steps.length} bosqich • Jami {totalTime} daqiqa
            </Text>
          </Box>
          <Badge
            size="md"
            radius="sm"
            variant="light"
            style={{ backgroundColor: colors.bgSubtle, color: colors.textSecondary }}
          >
            {steps.length}
          </Badge>
        </Group>

        <Divider />

        {/* Steps */}
        <ScrollArea type="auto" scrollbarSize={6}>
          <Group gap={0} wrap="nowrap" py="sm">
            {steps.map((step, index) => (
              <StepCard
                key={step.id || index}
                step={step}
                isLast={index === steps.length - 1}
              />
            ))}
          </Group>
        </ScrollArea>
      </Stack>
    </Paper>
  );
};

export default WorkflowTracker;
