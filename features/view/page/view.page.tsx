"use client";

import { useVerifyDocument } from "../hook/view.hook";
import { useDownloadDocument } from "@/features/workflow/hook/workflow.hook";
import {
  Paper,
  Badge,
  Alert,
  Stack,
  Group,
  Text,
  Title,
  Loader,
  Timeline,
  Box,
  Divider,
  ThemeIcon,
  Container,
  Button,
} from "@mantine/core";
import {
  IconFileText,
  IconUser,
  IconCalendar,
  IconCircleCheck,
  IconX,
  IconClock,
  IconAlertCircle,
  IconShieldCheck,
  IconHash,
  IconBuilding,
  IconCheckbox,
  IconDownload,
} from "@tabler/icons-react";
import { WorkflowStepStatus, WorkflowActionType, WorkflowStatus } from "@/features/workflow/type/workflow.type";
import { WorkflowStepInfo } from "../type/view.type";
import { formatDate, formatDateTime } from "@/lib/date-utils";

interface ViewPageProps {
  documentId: string;
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; color: string }> = {
    APPROVED: { label: "Tasdiqlangan", color: "gov" },
    PUBLISHED: { label: "Chop etilgan", color: "gov" },
    PENDING: { label: "Kutilmoqda", color: "gray" },
    DRAFT: { label: "Qoralama", color: "gray" },
    REJECTED: { label: "Rad etilgan", color: "gray" },
    ARCHIVED: { label: "Arxivlangan", color: "gray" },
  };
  const config = statusConfig[status] || { label: status, color: "gray" };
  return <Badge color={config.color} variant="light">{config.label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const priorityConfig: Record<string, { label: string; color: string }> = {
    HIGH: { label: "Yuqori", color: "red" },
    MEDIUM: { label: "O'rtacha", color: "yellow" },
    LOW: { label: "Past", color: "green" },
  };
  const config = priorityConfig[priority] || { label: priority, color: "gray" };
  return <Badge color={config.color} variant="light">{config.label}</Badge>;
};

const getStepStatusIcon = (status: WorkflowStepStatus, isRejected: boolean) => {
  if (isRejected) {
    return <IconX size={20} color="var(--mantine-color-gray-6)" />;
  }
  switch (status) {
    case WorkflowStepStatus.COMPLETED:
      return <IconCircleCheck size={20} color="var(--mantine-color-gov-6)" />;
    case WorkflowStepStatus.IN_PROGRESS:
    case WorkflowStepStatus.PENDING:
      return <IconClock size={20} color="var(--mantine-color-gray-6)" />;
    case WorkflowStepStatus.NOT_STARTED:
      return <IconAlertCircle size={20} color="var(--mantine-color-gray-4)" />;
    case WorkflowStepStatus.REJECTED:
      return <IconX size={20} color="var(--mantine-color-gray-6)" />;
    default:
      return <IconAlertCircle size={20} color="var(--mantine-color-gray-4)" />;
  }
};

const getActionTypeLabel = (actionType: WorkflowActionType) => {
  const labels: Record<WorkflowActionType, string> = {
    [WorkflowActionType.APPROVAL]: "Tasdiqlash",
    [WorkflowActionType.REVIEW]: "Ko'rib chiqish",
    [WorkflowActionType.SIGN]: "Imzolash",
    [WorkflowActionType.ACKNOWLEDGE]: "Tanishish",
    [WorkflowActionType.VERIFICATION]: "Tekshirish (Fayl)",
  };
  return labels[actionType] || actionType;
};

const getStepStatusLabel = (status: WorkflowStepStatus, isRejected: boolean) => {
  if (isRejected) return "Rad etilgan";
  const labels: Record<WorkflowStepStatus, string> = {
    [WorkflowStepStatus.COMPLETED]: "Bajarilgan",
    [WorkflowStepStatus.IN_PROGRESS]: "Jarayonda",
    [WorkflowStepStatus.PENDING]: "Kutilmoqda",
    [WorkflowStepStatus.NOT_STARTED]: "Boshlanmagan",
    [WorkflowStepStatus.REJECTED]: "Rad etilgan",
  };
  return labels[status] || status;
};

const getStepBulletColor = (status: WorkflowStepStatus, isRejected: boolean) => {
  if (isRejected) return "gray";
  switch (status) {
    case WorkflowStepStatus.COMPLETED:
      return "gov";
    case WorkflowStepStatus.IN_PROGRESS:
    case WorkflowStepStatus.PENDING:
      return "gray";
    case WorkflowStepStatus.NOT_STARTED:
      return "gray";
    case WorkflowStepStatus.REJECTED:
      return "gray";
    default:
      return "gray";
  }
};


export default function ViewPage({ documentId }: ViewPageProps) {
  const { data, isLoading, isError } = useVerifyDocument(documentId);
  const downloadMutation = useDownloadDocument();

  const handleDownload = () => {
    if (documentId) {
      downloadMutation.mutate({ documentId });
    }
  };

  if (isLoading) {
    return (
      <Box style={{ backgroundColor: "#f8f9fa", padding: "2rem 0" }}>
        <Container size="lg">
          <Stack gap="xl" align="center" justify="center" style={{ minHeight: "50vh" }}>
            <Loader size="lg" color="gov" />
            <Text c="dimmed">Hujjat yuklanmoqda...</Text>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box style={{ backgroundColor: "#f8f9fa", padding: "2rem 0" }}>
        <Container size="lg">
          <Alert
            variant="light"
            color="yellow"
            title="Ish jarayoni hali yakunlanmagan"
            icon={<IconClock size={20} />}
          >
            Hujjat ish jarayoni hali tugallanmagan. Iltimos, yakunlanishini kuting va qayta urinib ko'ring.
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box style={{ backgroundColor: "#f8f9fa", padding: "2rem 0" }}>
        <Container size="lg">
          <Alert
            variant="light"
            color="red"
            title="Hujjat topilmadi"
            icon={<IconAlertCircle size={20} />}
          >
            Berilgan ID bo'yicha hujjat topilmadi.
          </Alert>
        </Container>
      </Box>
    );
  }

  const isWorkflowComplete = data.workflow?.status === WorkflowStatus.COMPLETED;

  return (
    <Box style={{ backgroundColor: "#f8f9fa", padding: "2rem 0" }}>
      <Container size="lg">
        <Stack gap="lg">
          {/* Header */}
          <Paper p="xl" shadow="xs" style={{ backgroundColor: "#1864ab", color: "white" }}>
            <Group justify="space-between" align="center">
              <Group gap="md">
                <ThemeIcon size={56} radius="md" variant="white" color="gov">
                  <IconShieldCheck size={32} />
                </ThemeIcon>
                <div>
                  <Title order={2}>Hujjat aylanmalari</Title>
                  <Text size="sm" opacity={0.9}>Barcha hujjat aylanmalarini boshariq</Text>
                </div>
              </Group>

              {isWorkflowComplete && (
                <Button
                  justify="center"
                  leftSection={<IconDownload size={20} />}
                  variant="white"
                  c="gov"
                  loading={downloadMutation.isLoading}
                  onClick={handleDownload}
                >
                  Tasdiqlangan hujjatni yuklab olish
                </Button>
              )}
            </Group>
          </Paper>

          {/* Verification Status */}
          {isWorkflowComplete && (
            <Alert
              variant="light"
              color="gov"
              title="Hujjat tasdiqlangan"
              icon={<IconCircleCheck size={20} />}
            >
              Ushbu hujjat barcha ish jarayonlarini muvaffaqiyatli o'tgan va tasdiqlangan.
            </Alert>
          )}

          {/* Document Info */}
          <Paper p="xl" shadow="sm" withBorder>
            <Stack gap="md">
              <Group gap="xs">
                <IconFileText size={20} color="var(--mantine-color-gov-6)" />
                <Title order={3} c="gov.8">Hujjat ma'lumotlari</Title>
              </Group>
              <Divider />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Sarlavha</Text>
                  <Text fw={600}>{data.title}</Text>
                </Stack>

                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Tavsif</Text>
                  <Text>{data.description || "-"}</Text>
                </Stack>

                <Stack gap="xs">
                  <Group gap="xs">
                    <IconHash size={16} color="var(--mantine-color-dimmed)" />
                    <Text size="sm" c="dimmed">Hujjat raqami</Text>
                  </Group>
                  <Text fw={500} ff="monospace">{data.documentNumber}</Text>
                </Stack>

                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Status</Text>
                  <div>{getStatusBadge(data.status)}</div>
                </Stack>

                <Stack gap="xs">
                  <Group gap="xs">
                    <IconBuilding size={16} color="var(--mantine-color-dimmed)" />
                    <Text size="sm" c="dimmed">Hujjat turi</Text>
                  </Group>
                  <Text fw={500}>{data.documentType?.name || "-"}</Text>
                </Stack>

                <Stack gap="xs">
                  <Group gap="xs">
                    <IconUser size={16} color="var(--mantine-color-dimmed)" />
                    <Text size="sm" c="dimmed">Yaratuvchi</Text>
                  </Group>
                  <Text fw={500}>{data.createdBy?.fullname || "-"}</Text>
                  {data.createdBy?.username && (
                    <Text size="xs" c="dimmed">@{data.createdBy.username}</Text>
                  )}
                </Stack>

                <Stack gap="xs">
                  <Group gap="xs">
                    <IconCalendar size={16} color="var(--mantine-color-dimmed)" />
                    <Text size="sm" c="dimmed">Yaratilgan</Text>
                  </Group>
                  <Text size="sm">{formatDate(data.createdAt)}</Text>
                </Stack>
              </div>
            </Stack>
          </Paper>

          {/* Workflow Info */}
          {data.workflow && (
            <Paper p="xl" shadow="sm" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconClock size={20} color="var(--mantine-color-gov-6)" />
                    <Title order={3} c="gov.8">Ish jarayoni</Title>
                  </Group>
                  <Badge
                    color={data.workflow.status === WorkflowStatus.COMPLETED ? "gov" : "gray"}
                    variant="light"
                    size="lg"
                  >
                    {data.workflow.status === WorkflowStatus.COMPLETED
                      ? "Yakunlangan"
                      : data.workflow.status === WorkflowStatus.ACTIVE
                        ? "Faol"
                        : data.workflow.status === WorkflowStatus.CANCELLED
                          ? "Bekor qilingan"
                          : "Qoralama"}
                  </Badge>
                </Group>
                <Divider />

                {data.workflow.steps && data.workflow.steps.length > 0 ? (
                  <Timeline active={data.workflow.currentStepOrder - 1} bulletSize={28} lineWidth={2}>
                    {data.workflow.steps
                      .sort((a, b) => a.order - b.order)
                      .map((step) => (
                        <Timeline.Item
                          key={step.id}
                          bullet={getStepStatusIcon(step.status, step.isRejected)}
                          title={
                            <Group gap="sm">
                              <Text fw={600} size="md">
                                {step.order}. {getActionTypeLabel(step.actionType)}
                              </Text>
                              <Badge color={getStepBulletColor(step.status, step.isRejected)} size="sm">
                                {getStepStatusLabel(step.status, step.isRejected)}
                              </Badge>
                            </Group>
                          }
                          color={getStepBulletColor(step.status, step.isRejected)}
                        >
                          <Stack gap="xs" mt="xs">
                            <Group gap="xs">
                              <IconUser size={16} color="var(--mantine-color-dimmed)" />
                              <Text size="sm" c="dimmed">
                                {step.assignedToUser?.fullname || "Noma'lum"}
                              </Text>
                              {step.assignedToUser?.username && (
                                <Text size="xs" c="dimmed">(@{step.assignedToUser.username})</Text>
                              )}
                            </Group>

                            {step.completedAt && (
                              <Group gap="xs">
                                <IconCircleCheck size={16} color="var(--mantine-color-green-6)" />
                                <Text size="sm" c="dimmed">
                                  Bajarilgan: {formatDate(step.completedAt)}
                                </Text>
                              </Group>
                            )}

                            {step.isRejected && step.rejectionReason && (
                              <Alert
                                variant="light"
                                color="gray"
                                title="Rad etilish sababi"
                                icon={<IconX size={16} />}
                                mt="xs"
                              >
                                <Text size="sm">{step.rejectionReason}</Text>
                              </Alert>
                            )}

                            {step.actions && step.actions.length > 0 && (
                              <Stack gap="xs" mt="xs">
                                <Text size="sm" fw={500} c="dimmed">Harakatlar:</Text>
                                {step.actions.map((action) => (
                                  <Paper key={action.id} p="sm" withBorder bg="gray.0">
                                    <Stack gap={4}>
                                      <Group gap="xs">
                                        <IconCheckbox size={14} />
                                        <Text size="sm" fw={500}>
                                          {action.performedBy?.fullname}
                                        </Text>
                                        {action.performedBy?.username && (
                                          <Text size="xs" c="dimmed">
                                            (@{action.performedBy.username})
                                          </Text>
                                        )}
                                      </Group>
                                      <Text size="xs" c="dimmed">
                                        {formatDate(action.createdAt)}
                                      </Text>
                                      {action.comment && (
                                        <Text size="sm" mt={4}>
                                          {action.comment}
                                        </Text>
                                      )}
                                    </Stack>
                                  </Paper>
                                ))}
                              </Stack>
                            )}
                          </Stack>
                        </Timeline.Item>
                      ))}
                  </Timeline>
                ) : (
                  <Text c="dimmed" ta="center" py="md">
                    Ish jarayoni qadamlari mavjud emas
                  </Text>
                )}
              </Stack>
            </Paper>
          )}

          {!data.workflow && (
            <Alert
              variant="light"
              color="gray"
              title="Ish jarayoni mavjud emas"
              icon={<IconAlertCircle size={20} />}
            >
              Ushbu hujjat uchun ish jarayoni tayinlanmagan.
            </Alert>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
