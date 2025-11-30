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
import dayjs from "dayjs";
import "dayjs/locale/uz";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Link from "next/link";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("uz");

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
  if (isRejected) return "#c92a2a";
  if (status === "COMPLETED") return "#2b8a3e";
  return "#868e96";
};

const getStatusBgColor = (status: string, isRejected: boolean): string => {
  if (isRejected) return "#ffe3e3";
  if (status === "COMPLETED") return "#d3f9d8";
  return "#f1f3f5";
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
              {dayjs(step.startedAt).tz("Asia/Tashkent").format("DD MMM, HH:mm")}
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
              {dayjs(step.completedAt).tz("Asia/Tashkent").format("DD MMM, HH:mm")}
            </Text>
          </Box>
        </>
      )}

      {step.isRejected && step.rejectionReason && (
        <>
          <Divider />
          <Box>
            <Text size="xs" c="dimmed" fw={600}>Rad etish sababi</Text>
            <Text size="sm" c="#c92a2a" fs="italic">{step.rejectionReason}</Text>
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
              backgroundColor: "#fff",
              color: "#212529",
              border: "1px solid #e9ecef",
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
                    style={{ backgroundColor: "#1e3a5f" }}
                  >
                    <IconUser size={10} />
                  </Avatar>
                  <Text size="xs" fw={500} c="#212529" lineClamp={1}>
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
                    {dayjs(step.completedAt).tz("Asia/Tashkent").format("DD MMM, HH:mm")}
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
            backgroundColor: "#e9ecef",
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

  const totalTime = dayjs(steps[steps.length - 1]?.completedAt).diff(
    dayjs(steps[0]?.createdAt),
    "minute"
  );

  return (
    <Paper
      p="md"
      radius="sm"
      withBorder
      style={{ borderColor: "#e9ecef", marginBottom: 16 }}
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Box>
            <Group gap="xs">
              <IconUsers size={18} color="#1e3a5f" />
              <Text size="md" fw={600} c="#212529">
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
            style={{ backgroundColor: "#f1f3f5", color: "#495057" }}
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
