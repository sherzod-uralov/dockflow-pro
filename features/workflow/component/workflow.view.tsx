"use client";

import { memo, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Text,
  Paper,
  Badge,
  Button,
  Group,
  Stack,
  Avatar,
  Divider,
  Modal,
  Textarea,
  Select,
  Checkbox,
  SimpleGrid,
} from "@mantine/core";
import {
  IconCopy,
  IconFileText,
  IconCircleCheck,
  IconFileSearch,
  IconSignature,
  IconClock,
  IconUser,
  IconAlertCircle,
  IconCircleX,
  IconMessage,
  IconRotate,
  IconArrowLeft,
  IconArrowRight,
  IconEdit,
  IconPlayerPlay,
  IconEye,
} from "@tabler/icons-react";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { formatDateTime, formatDate } from "@/lib/date-utils";
import {
  WorkflowApiResponse,
  WorkflowStepApiResponse,
  WorkflowStepStatus,
  getAvailableRollbackUsers,
  RollbackUser,
  validateAndExtractUserIds,
} from "../type/workflow.type";
import {
  useUpdateWorkflowStep,
  useCompleteWorkflowStep,
  useRejectWorkflowStep,
  useEnrichedRollbackUsers
} from "../hook/workflow.hook";
import { showError } from "@/utils/show-error";
import { useGetDocumentById } from "@/features/document";
import {
  createWorkflowDocumentEditUrl,
  createWorkflowDocumentViewUrl,
} from "@/utils/url-helper";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";

interface WorkflowViewProps {
  workflow: WorkflowApiResponse;
  onClose?: () => void;
}

interface RollbackHistoryItem {
  id: string;
  rejectedAt: string;
  rejectedBy: any;
  fromStepOrder: number;
  fromStepUser: any;
  toStepOrder: number;
  toStepUser: any;
  rejectionReason: string;
  comment?: string;
}

// Status configs
const getWorkflowStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; bg: string; color: string }> = {
    ACTIVE: { label: "Faol", bg: "#d0ebff", color: "#1971c2" },
    COMPLETED: { label: "Tugallangan", bg: "#d3f9d8", color: "#2b8a3e" },
    CANCELLED: { label: "Bekor qilingan", bg: "#ffe3e3", color: "#c92a2a" },
    DRAFT: { label: "Tayyorlanmoqda", bg: "#f1f3f5", color: "#495057" },
  };
  return configs[status] || configs.DRAFT;
};

const getStepStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; bg: string; color: string; Icon: any }> = {
    NOT_STARTED: { label: "Boshlanmagan", bg: "#f1f3f5", color: "#495057", Icon: IconClock },
    PENDING: { label: "Kutilmoqda", bg: "#f1f3f5", color: "#495057", Icon: IconClock },
    IN_PROGRESS: { label: "Jarayonda", bg: "#d0ebff", color: "#1971c2", Icon: IconPlayerPlay },
    COMPLETED: { label: "Tugallangan", bg: "#d3f9d8", color: "#2b8a3e", Icon: IconCircleCheck },
    REJECTED: { label: "Rad etilgan", bg: "#ffe3e3", color: "#c92a2a", Icon: IconCircleX },
  };
  return configs[status] || configs.NOT_STARTED;
};

const getActionTypeConfig = (actionType: string) => {
  const configs: Record<string, { label: string; bg: string; color: string; Icon: any }> = {
    APPROVAL: { label: "Tasdiqlash", bg: "#d3f9d8", color: "#2b8a3e", Icon: IconCircleCheck },
    REVIEW: { label: "Ko'rib chiqish", bg: "#d0ebff", color: "#1971c2", Icon: IconFileSearch },
    SIGN: { label: "Imzolash", bg: "#f3d9fa", color: "#9c36b5", Icon: IconSignature },
  };
  return configs[actionType] || configs.APPROVAL;
};

const WorkflowView = memo(({ workflow, onClose }: WorkflowViewProps) => {
  const router = useRouter();
  const updateStepMutation = useUpdateWorkflowStep();
  const completeMutation = useCompleteWorkflowStep();
  const rejectMutation = useRejectWorkflowStep();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStepApiResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [comment, setComment] = useState("");
  const [enableRollback, setEnableRollback] = useState(false);
  const [selectedRollbackUserId, setSelectedRollbackUserId] = useState("");

  const { data: currentUserProfile } = useGetProfileQuery();
  const { data: documentData } = useGetDocumentById(workflow.document?.id || "");

  const isLoading =
    updateStepMutation.isLoading ||
    completeMutation.isLoading ||
    rejectMutation.isLoading;

  // Start step
  const handleStartStep = useCallback((stepId: string) => {
    updateStepMutation.mutate(
      {
        id: stepId,
        data: {
          status: WorkflowStepStatus.IN_PROGRESS,
          startedAt: new Date().toISOString(),
        },
      },
      {
        onError: (error) => showError(error),
      }
    );
  }, [updateStepMutation]);

  // Complete step
  const handleCompleteStep = useCallback((stepId: string) => {
    completeMutation.mutate(stepId);
  }, [completeMutation]);

  // Edit document
  const handleEditDocument = useCallback((actionType?: string) => {
    if (documentData?.attachments?.[0]?.id && workflow.documentId) {
      const editUrl = createWorkflowDocumentEditUrl(
        documentData.attachments[0].id,
        workflow.documentId,
        actionType,
      );
      router.push(editUrl);
    }
  }, [documentData, workflow.documentId, router]);

  // View document
  const handleViewDocument = useCallback((actionType?: string) => {
    if (documentData?.attachments?.[0]?.id && workflow.documentId) {
      const viewUrl = createWorkflowDocumentViewUrl(
        documentData.attachments[0].id,
        workflow.documentId,
        actionType,
      );
      router.push(viewUrl);
    }
  }, [documentData, workflow.documentId, router]);

  const canEditDocument = documentData?.attachments && documentData.attachments.length > 0;

  const workflowValidation = useMemo(
    () => validateAndExtractUserIds(workflow),
    [workflow],
  );

  // Available rollback users
  const availableRollbackUsers = useMemo(() => {
    if (!selectedStep) return [];

    const users: RollbackUser[] = [];

    if (documentData?.createdBy) {
      users.push({
        userId: documentData.createdBy.id,
        userName: documentData.createdBy.fullname,
        stepOrder: 0,
        userEmail: undefined,
        userRole: "Yaratuvchi",
        stepActionType: "CREATOR",
        stepStatus: "CREATOR",
      });
    }

    const workflowUsers = getAvailableRollbackUsers(selectedStep, workflow);
    const filteredWorkflowUsers = workflowUsers.filter(
      (user) => user.userId !== documentData?.createdBy?.id,
    );

    users.push(...filteredWorkflowUsers);
    return users;
  }, [selectedStep, workflow, documentData]);

  const { enrichedUsers, isLoading: isLoadingUsers } = useEnrichedRollbackUsers(
    availableRollbackUsers,
  );

  // Open reject dialog
  const handleRejectClick = useCallback((step: WorkflowStepApiResponse) => {
    const validation = validateAndExtractUserIds(workflow);
    if (!validation.isValid) {
      alert(validation.error || "Rad etish uchun mavjud bosqichlar yo'q");
      return;
    }

    setSelectedStep(step);
    setRejectionReason("");
    setComment("");
    setEnableRollback(true);
    if (documentData?.createdBy?.id) {
      setSelectedRollbackUserId(documentData.createdBy.id);
    } else {
      setSelectedRollbackUserId("");
    }
    setRejectDialogOpen(true);
  }, [workflow, documentData]);

  // Confirm reject
  const handleConfirmReject = useCallback(() => {
    if (!selectedStep) return;

    if (!rejectionReason.trim()) {
      alert("Iltimos, rad etish sababini kiriting");
      return;
    }
    if (rejectionReason.trim().length < 10) {
      alert("Rad etish sababi kamida 10 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (enableRollback && !selectedRollbackUserId) {
      alert("Iltimos, qaytarish uchun foydalanuvchini tanlang");
      return;
    }

    const payload: any = {
      rejectionReason: rejectionReason.trim(),
    };

    if (comment.trim()) {
      payload.comment = comment.trim();
    }

    if (enableRollback && selectedRollbackUserId) {
      payload.rollbackToUserId = selectedRollbackUserId;
    }

    rejectMutation.mutate(
      {
        id: selectedStep.id,
        data: payload,
      },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectionReason("");
          setComment("");
          setEnableRollback(false);
          setSelectedRollbackUserId("");
          setSelectedStep(null);
        },
      },
    );
  }, [selectedStep, rejectionReason, comment, enableRollback, selectedRollbackUserId, rejectMutation]);

  // Rollback history
  const rollbackHistory = useMemo((): RollbackHistoryItem[] => {
    const history: RollbackHistoryItem[] = [];

    workflow.workflowSteps.forEach((step) => {
      const rejectedActions =
        step.actions?.filter(
          (action: any) =>
            action.actionType === "REJECTED" &&
            action.metadata?.rollbackToUserId,
        ) || [];

      rejectedActions.forEach((rejectedAction: any) => {
        const metadata = rejectedAction.metadata;
        const targetStep = workflow.workflowSteps.find(
          (s) => s.id === metadata.rollbackToStepId,
        );

        history.push({
          id: rejectedAction.id,
          rejectedAt: rejectedAction.createdAt,
          rejectedBy: rejectedAction.performedBy,
          fromStepOrder: step.order,
          fromStepUser: step.assignedToUser,
          toStepOrder: metadata.rollbackToStepOrder,
          toStepUser: targetStep?.assignedToUser,
          rejectionReason: metadata.rejectionReason || "",
          comment: rejectedAction.comment,
        });
      });
    });

    return history.sort((a, b) => {
      const dateA = new Date(a.rejectedAt).getTime();
      const dateB = new Date(b.rejectedAt).getTime();
      return dateB - dateA;
    });
  }, [workflow]);

  // Close dialog
  const handleCloseDialog = useCallback(() => {
    setRejectDialogOpen(false);
    setRejectionReason("");
    setComment("");
    setEnableRollback(false);
    setSelectedRollbackUserId("");
    setSelectedStep(null);
  }, []);

  // Render step
  const renderStep = (step: WorkflowStepApiResponse, isCurrentStep: boolean) => {
    const filteredActions =
      step.actions?.filter(
        (action) => action.performedBy?.id === step.assignedToUser?.id,
      ) || [];

    const isCurrentUserAssigned = currentUserProfile?.id === step.assignedToUserId;
    const stepStatusConfig = getStepStatusConfig(step.status);
    const StatusIcon = stepStatusConfig.Icon;

    return (
      <Box
        key={step.id}
        style={{
          position: "relative",
          paddingLeft: 32,
          paddingBottom: 24,
          borderLeft: `2px solid ${isCurrentStep ? "#1e3a5f" : "#e9ecef"}`,
        }}
      >
        {/* Timeline dot */}
        <Box
          style={{
            position: "absolute",
            left: -8,
            top: 0,
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: "2px solid",
            borderColor: isCurrentStep
              ? "#1e3a5f"
              : step.status === "COMPLETED"
                ? "#2b8a3e"
                : step.status === "REJECTED"
                  ? "#c92a2a"
                  : "#dee2e6",
            backgroundColor: isCurrentStep
              ? "#1e3a5f"
              : step.status === "COMPLETED"
                ? "#2b8a3e"
                : step.status === "REJECTED"
                  ? "#c92a2a"
                  : "#dee2e6",
          }}
        />

        <Paper
          p="md"
          radius="sm"
          withBorder
          style={{
            borderColor: isCurrentStep ? "#1e3a5f" : "#e9ecef",
            boxShadow: isCurrentStep ? "0 2px 8px rgba(30, 58, 95, 0.15)" : undefined,
          }}
        >
          <Stack gap="sm">
            {/* Header */}
            <Group justify="space-between">
              <Group gap="xs">
                <Text size="sm" fw={600} c="#212529">
                  Bosqich {step.order}
                </Text>
                {isCurrentStep && (
                  <Badge
                    size="sm"
                    style={{ backgroundColor: "#1e3a5f" }}
                  >
                    Joriy
                  </Badge>
                )}
              </Group>
              <Badge
                size="sm"
                leftSection={<StatusIcon size={12} />}
                style={{
                  backgroundColor: stepStatusConfig.bg,
                  color: stepStatusConfig.color,
                }}
              >
                {stepStatusConfig.label}
              </Badge>
            </Group>

            {/* Assigned user */}
            <Box>
              <Group gap="xs" mb={8}>
                <IconUser size={16} color="#868e96" />
                <Text size="sm" fw={500} c="#495057">
                  Mas'ul shaxs
                </Text>
              </Group>
              <Group gap="sm">
                <Avatar size="sm" radius="xl" color="blue">
                  {step.assignedToUser?.fullname
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "??"}
                </Avatar>
                <Box>
                  <Text size="sm" fw={500} c="#212529">
                    {step.assignedToUser?.fullname || "N/A"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    @{step.assignedToUser?.username || "N/A"}
                  </Text>
                </Box>
              </Group>
            </Box>

            {/* Dates */}
            <SimpleGrid cols={2} spacing="sm">
              {step.startedAt && (
                <Box>
                  <Text size="xs" c="dimmed">Boshlangan</Text>
                  <Text size="sm" fw={500} c="#212529">
                    {formatDateTime(step.startedAt)}
                  </Text>
                </Box>
              )}
              {step.completedAt && (
                <Box>
                  <Text size="xs" c="dimmed">Tugallangan</Text>
                  <Text size="sm" fw={500} c="#212529">
                    {formatDateTime(step.completedAt)}
                  </Text>
                </Box>
              )}
              {step.dueDate && (
                <Box>
                  <Text size="xs" c="dimmed">Muddat</Text>
                  <Text size="sm" fw={500} c="#212529">
                    {formatDate(step.dueDate)}
                  </Text>
                </Box>
              )}
            </SimpleGrid>

            {/* Rejection Info */}
            {step.isRejected && step.rejectionReason && (
              <Box
                p="sm"
                style={{
                  backgroundColor: "#fff5f5",
                  border: "1px solid #ffe3e3",
                  borderRadius: 4,
                }}
              >
                <Group gap="xs" align="flex-start">
                  <IconAlertCircle size={16} color="#c92a2a" style={{ marginTop: 2 }} />
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" fw={500} c="#c92a2a">
                      Rad etilgan sabab:
                    </Text>
                    <Text size="sm" c="#862e2e" mt={4}>
                      {step.rejectionReason}
                    </Text>
                    {step.rejectedAt && (
                      <Text size="xs" c="#c92a2a" mt={4}>
                        {formatDateTime(step.rejectedAt)}
                      </Text>
                    )}
                  </Box>
                </Group>
              </Box>
            )}

            {/* Actions History */}
            {filteredActions.length > 0 && (
              <Box>
                <Group gap="xs" mb={8}>
                  <IconMessage size={16} color="#868e96" />
                  <Text size="sm" fw={500} c="#495057">
                    Amallar tarixi
                  </Text>
                </Group>
                <Stack gap="xs">
                  {filteredActions.map((action) => {
                    const actionBg =
                      action.actionType === "REJECTED"
                        ? "#fff5f5"
                        : action.actionType === "APPROVED"
                          ? "#ebfbee"
                          : "#e7f5ff";
                    const actionBorder =
                      action.actionType === "REJECTED"
                        ? "#ffe3e3"
                        : action.actionType === "APPROVED"
                          ? "#d3f9d8"
                          : "#d0ebff";
                    const actionColor =
                      action.actionType === "REJECTED"
                        ? "#c92a2a"
                        : action.actionType === "APPROVED"
                          ? "#2b8a3e"
                          : "#1971c2";

                    return (
                      <Box
                        key={action.id}
                        p="sm"
                        style={{
                          backgroundColor: actionBg,
                          border: `1px solid ${actionBorder}`,
                          borderRadius: 4,
                        }}
                      >
                        <Group justify="space-between" mb={8}>
                          <Group gap="xs">
                            <Avatar size="xs" radius="xl">
                              {action.performedBy?.fullname
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "??"}
                            </Avatar>
                            <Box>
                              <Text size="xs" fw={500}>
                                {action.performedBy?.fullname || "N/A"}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {formatDateTime(action.createdAt)}
                              </Text>
                            </Box>
                          </Group>
                          <Badge
                            size="xs"
                            style={{
                              backgroundColor: actionBorder,
                              color: actionColor,
                            }}
                          >
                            {action.actionType === "REJECTED"
                              ? "Rad etildi"
                              : action.actionType === "APPROVED"
                                ? "Tasdiqlandi"
                                : action.actionType === "REVIEWED"
                                  ? "Ko'rildi"
                                  : action.actionType === "SIGNED"
                                    ? "Imzolandi"
                                    : "Xabarnoma"}
                          </Badge>
                        </Group>
                        {action.comment && (
                          <Text size="sm" c="#495057" mt={8}>
                            {action.comment}
                          </Text>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* View button for completed steps */}
            {step.status === "COMPLETED" && canEditDocument && (
              <Box pt="sm" style={{ borderTop: "1px solid #e9ecef" }}>
                <Button
                  variant="outline"
                  size="sm"
                  radius="sm"
                  fullWidth
                  leftSection={<IconEye size={16} />}
                  onClick={() => handleViewDocument(step.actionType)}
                  styles={{
                    root: {
                      borderColor: "#e9ecef",
                      color: "#495057",
                      "&:hover": {
                        backgroundColor: "#f8f9fa",
                      },
                    },
                  }}
                >
                  Hujjatni ko'rish
                </Button>
              </Box>
            )}

            {/* Action Buttons */}
            {isCurrentStep &&
              isCurrentUserAssigned &&
              step.status !== "COMPLETED" &&
              step.status !== "REJECTED" && (
                <Box pt="sm" style={{ borderTop: "1px solid #e9ecef" }}>
                  <Stack gap="xs">
                    {canEditDocument && (
                      <Button
                        variant="outline"
                        size="sm"
                        radius="sm"
                        fullWidth
                        leftSection={<IconEdit size={16} />}
                        onClick={() => handleEditDocument(step.actionType)}
                        disabled={isLoading}
                        styles={{
                          root: {
                            borderColor: "#e9ecef",
                            color: "#495057",
                            "&:hover": {
                              backgroundColor: "#f8f9fa",
                            },
                          },
                        }}
                      >
                        Hujjatni tahrirlash
                      </Button>
                    )}

                    {step.status === "IN_PROGRESS" && (
                      <Group gap="xs" grow>
                        <Button
                          size="sm"
                          radius="sm"
                          onClick={() => handleCompleteStep(step.id)}
                          disabled={isLoading}
                          style={{ backgroundColor: "#2b8a3e" }}
                          leftSection={<IconCircleCheck size={16} />}
                        >
                          {isLoading ? "Yuklanmoqda..." : "Tasdiqlash"}
                        </Button>
                        <Button
                          size="sm"
                          radius="sm"
                          onClick={() => handleRejectClick(step)}
                          disabled={isLoading}
                          style={{ backgroundColor: "#c92a2a" }}
                          leftSection={<IconCircleX size={16} />}
                        >
                          Rad etish
                        </Button>
                      </Group>
                    )}
                  </Stack>
                </Box>
              )}
          </Stack>
        </Paper>
      </Box>
    );
  };

  const workflowStatusConfig = getWorkflowStatusConfig(workflow.status);
  const firstStepActionConfig = workflow.workflowSteps[0]
    ? getActionTypeConfig(workflow.workflowSteps[0].actionType)
    : null;
  const ActionIcon = firstStepActionConfig?.Icon;

  return (
    <Stack gap="lg">
      {/* Main Info Card */}
      <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
        <Group justify="space-between" align="flex-start" mb="md">
          <Box>
            <Group gap="xs" mb={4}>
              <IconFileText size={20} color="#1e3a5f" />
              <Text size="lg" fw={600} c="#212529">
                {workflow.document.title}
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              Hujjat aylanmasi haqida batafsil ma'lumotlar
            </Text>
          </Box>
          {workflow.id && (
            <Badge
              variant="outline"
              size="sm"
              style={{
                cursor: "pointer",
                borderColor: "#e9ecef",
                color: "#495057",
              }}
              rightSection={<IconCopy size={12} />}
              onClick={() => handleCopyToClipboard(workflow.id, "ID nusxalandi")}
            >
              ID: {workflow.id.slice(0, 8)}...
            </Badge>
          )}
        </Group>

        {/* Document Info */}
        <Box mb="md">
          <Group gap="xs" mb={8}>
            <IconFileText size={16} color="#868e96" />
            <Text size="sm" fw={500} c="#495057">
              Hujjat ma'lumotlari
            </Text>
          </Group>
          <Box
            p="sm"
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: 4,
            }}
          >
            <Stack gap={4}>
              <Text size="sm" c="#495057">
                <Text span fw={500}>Raqam:</Text> {workflow.document.documentNumber}
              </Text>
              <Text size="sm" c="#495057">
                <Text span fw={500}>Versiya:</Text> {workflow.document.version}
              </Text>
              {workflow.document.description && (
                <Text size="sm" c="#495057">
                  <Text span fw={500}>Tavsif:</Text> {workflow.document.description}
                </Text>
              )}
            </Stack>
          </Box>
        </Box>

        <Divider color="#e9ecef" mb="md" />

        {/* Status and Type */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
          <Box>
            <Text size="sm" c="dimmed" mb={4}>Holat</Text>
            <Badge
              size="md"
              style={{
                backgroundColor: workflowStatusConfig.bg,
                color: workflowStatusConfig.color,
              }}
            >
              {workflowStatusConfig.label}
            </Badge>
          </Box>
          <Box>
            <Text size="sm" c="dimmed" mb={4}>Amal turi</Text>
            {firstStepActionConfig && ActionIcon && (
              <Badge
                size="md"
                leftSection={<ActionIcon size={12} />}
                style={{
                  backgroundColor: firstStepActionConfig.bg,
                  color: firstStepActionConfig.color,
                }}
              >
                {firstStepActionConfig.label}
              </Badge>
            )}
          </Box>
          <Box>
            <Text size="sm" c="dimmed" mb={4}>Jarayon</Text>
            <Text size="sm" fw={600} c="#212529" style={{ fontFamily: "monospace" }}>
              {workflow.currentStepOrder} / {workflow.workflowSteps.length}
            </Text>
          </Box>
        </SimpleGrid>

        <Divider color="#e9ecef" mb="md" />

        {/* Timestamps */}
        <SimpleGrid cols={2} spacing="md">
          <Box>
            <Text size="sm" c="dimmed" mb={4}>Yaratilgan</Text>
            <Text size="sm" fw={500} c="#212529">
              {formatDateTime(workflow.createdAt)}
            </Text>
          </Box>
          <Box>
            <Text size="sm" c="dimmed" mb={4}>Yangilangan</Text>
            <Text size="sm" fw={500} c="#212529">
              {formatDateTime(workflow.updatedAt)}
            </Text>
          </Box>
        </SimpleGrid>
      </Paper>

      {/* Rollback History Card */}
      {rollbackHistory.length > 0 && (
        <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group gap="xs" mb={4}>
            <IconRotate size={20} color="#e67700" />
            <Text size="lg" fw={600} c="#212529">
              Qaytarishlar tarixi
            </Text>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            Jami {rollbackHistory.length} ta qaytarish amalga oshirilgan
          </Text>

          <Stack gap="sm">
            {rollbackHistory.map((rollback) => (
              <Box
                key={rollback.id}
                p="md"
                style={{
                  backgroundColor: "#fff8f1",
                  border: "1px solid #ffe8cc",
                  borderRadius: 4,
                }}
              >
                <Group gap="sm" align="flex-start">
                  <Box
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#ffe8cc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconArrowLeft size={20} color="#e67700" />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    {/* Header */}
                    <Group justify="space-between" mb="sm">
                      <Group gap="xs">
                        <Avatar size="sm" radius="xl">
                          {rollback.rejectedBy?.fullname
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "??"}
                        </Avatar>
                        <Box>
                          <Text size="sm" fw={500}>
                            {rollback.rejectedBy?.fullname || "N/A"}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatDateTime(rollback.rejectedAt)}
                          </Text>
                        </Box>
                      </Group>
                      <Badge
                        size="sm"
                        leftSection={<IconRotate size={12} />}
                        style={{
                          backgroundColor: "#ffe8cc",
                          color: "#e67700",
                        }}
                      >
                        Qaytarildi
                      </Badge>
                    </Group>

                    {/* Rollback Flow */}
                    <Box
                      p="sm"
                      mb="sm"
                      style={{
                        backgroundColor: "white",
                        border: "1px solid #ffe8cc",
                        borderRadius: 4,
                      }}
                    >
                      <Group gap="xs" justify="space-between">
                        <Group gap="xs">
                          <Badge size="xs" variant="light" color="gray">
                            Bosqich {rollback.fromStepOrder}
                          </Badge>
                          <Box>
                            <Text size="xs" fw={500}>
                              {rollback.fromStepUser?.fullname}
                            </Text>
                            <Text size="xs" c="dimmed">
                              @{rollback.fromStepUser?.username}
                            </Text>
                          </Box>
                        </Group>

                        <Group gap={4}>
                          <Text size="xs" fw={500} c="#e67700">
                            qaytarildi
                          </Text>
                          <IconArrowRight size={14} color="#e67700" />
                        </Group>

                        <Group gap="xs">
                          <Badge size="xs" variant="light" color="gray">
                            Bosqich {rollback.toStepOrder}
                          </Badge>
                          <Box>
                            <Text size="xs" fw={500}>
                              {rollback.toStepUser?.fullname}
                            </Text>
                            <Text size="xs" c="dimmed">
                              @{rollback.toStepUser?.username}
                            </Text>
                          </Box>
                        </Group>
                      </Group>
                    </Box>

                    {/* Rollback Reason */}
                    <Box
                      p="sm"
                      style={{
                        backgroundColor: "white",
                        border: "1px solid #ffe8cc",
                        borderRadius: 4,
                      }}
                    >
                      <Text size="xs" fw={500} c="#e67700" mb={4}>
                        Rad etish sababi:
                      </Text>
                      <Text size="sm" c="#495057">
                        {rollback.rejectionReason}
                      </Text>
                      {rollback.comment && rollback.comment !== rollback.rejectionReason && (
                        <>
                          <Text size="xs" fw={500} c="#e67700" mt={8} mb={4}>
                            Qo'shimcha izoh:
                          </Text>
                          <Text size="sm" c="#495057">
                            {rollback.comment}
                          </Text>
                        </>
                      )}
                    </Box>
                  </Box>
                </Group>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Workflow Steps Timeline */}
      <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
        <Text size="lg" fw={600} c="#212529" mb={4}>
          Hujjat aylanmasi bosqichlari
        </Text>
        <Text size="sm" c="dimmed" mb="lg">
          Jami {workflow.workflowSteps.length} ta bosqich
        </Text>

        <Box>
          {workflow.workflowSteps
            .sort((a, b) => a.order - b.order)
            .map((step) => renderStep(step, step.order === workflow.currentStepOrder))}
        </Box>
      </Paper>

      {/* Close Button */}
      {onClose && (
        <Group justify="flex-end" pt="md">
          <Button
            variant="outline"
            size="sm"
            radius="sm"
            onClick={onClose}
            styles={{
              root: {
                borderColor: "#e9ecef",
                color: "#495057",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                },
              },
            }}
          >
            Yopish
          </Button>
        </Group>
      )}

      {/* Reject Dialog */}
      <Modal
        opened={rejectDialogOpen}
        onClose={handleCloseDialog}
        title={
          <Text fw={600} c="#212529">
            Bosqichni rad etish
          </Text>
        }
        size="lg"
        radius="sm"
        centered
        styles={{
          header: {
            borderBottom: "1px solid #e9ecef",
            paddingBottom: 12,
          },
          body: {
            paddingTop: 16,
          },
        }}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Iltimos, rad etish sababini kiriting va qaytarish (rollback) parametrlarini sozlang.
          </Text>

          {/* Rejection Reason */}
          <Box>
            <Group gap={4} mb={4}>
              <Text size="sm" fw={500} c="#495057">
                Rad etish sababi
              </Text>
              <Text size="sm" c="#c92a2a">*</Text>
              <Text size="xs" c="dimmed">(kamida 10 ta belgi)</Text>
            </Group>
            <Textarea
              placeholder="Rad etish sababini batafsil yozing (kamida 10 ta belgi)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={isLoading}
              error={
                rejectionReason.length > 0 && rejectionReason.length < 10
                  ? `Yana ${10 - rejectionReason.length} ta belgi kerak`
                  : undefined
              }
              styles={{
                input: {
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  "&:focus": {
                    borderColor: "#1e3a5f",
                  },
                },
              }}
            />
            <Group justify="space-between" mt={4}>
              {rejectionReason.length === 0 ? (
                <Text size="xs" c="#c92a2a">
                  Bu maydon majburiy (kamida 10 ta belgi)
                </Text>
              ) : rejectionReason.length < 10 ? (
                <Text size="xs" c="#c92a2a">
                  Yana {10 - rejectionReason.length} ta belgi kerak
                </Text>
              ) : (
                <Text size="xs" c="#2b8a3e">✓ Yetarli</Text>
              )}
              <Text size="xs" c="dimmed">
                {rejectionReason.length}/500
              </Text>
            </Group>
          </Box>

          {/* Additional Comment */}
          <Box>
            <Text size="sm" fw={500} c="#495057" mb={4}>
              Qo'shimcha izoh
            </Text>
            <Textarea
              placeholder="Qo'shimcha ma'lumot kiriting..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              maxLength={1000}
              disabled={isLoading}
              styles={{
                input: {
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  "&:focus": {
                    borderColor: "#1e3a5f",
                  },
                },
              }}
            />
            <Text size="xs" c="dimmed" ta="right" mt={4}>
              {comment.length}/1000
            </Text>
          </Box>

          {/* Rollback Option */}
          <Box pt="sm" style={{ borderTop: "1px solid #e9ecef" }}>
            <Checkbox
              label="Hujjatni qaytarish (rollback)"
              checked={enableRollback}
              onChange={(e) => {
                setEnableRollback(e.currentTarget.checked);
                if (!e.currentTarget.checked) {
                  setSelectedRollbackUserId("");
                } else if (documentData?.createdBy?.id) {
                  setSelectedRollbackUserId(documentData.createdBy.id);
                }
              }}
              disabled={isLoading || isLoadingUsers}
              styles={{
                label: {
                  fontWeight: 500,
                  color: "#495057",
                },
              }}
            />

            {!enableRollback && (
              <Text size="xs" c="dimmed" ml={28} mt={4}>
                ℹ️ Hujjatni qaytarmasdan rad etish
              </Text>
            )}

            {enableRollback && (
              <Box ml={28} mt="sm">
                <Group gap={4} mb={4}>
                  <Text size="sm" fw={500} c="#495057">
                    Qaytarish uchun foydalanuvchi
                  </Text>
                  <Text size="sm" c="#c92a2a">*</Text>
                </Group>

                {isLoadingUsers ? (
                  <Text size="sm" c="dimmed">
                    Foydalanuvchilar yuklanmoqda...
                  </Text>
                ) : enrichedUsers.length === 0 ? (
                  <Text size="sm" c="#c92a2a">
                    Avvalgi foydalanuvchilar topilmadi
                  </Text>
                ) : (
                  <>
                    <Select
                      value={selectedRollbackUserId}
                      onChange={(value) => setSelectedRollbackUserId(value || "")}
                      data={enrichedUsers.map((user) => {
                        const isCreator = user.stepOrder === 0;
                        const userDisplay = isCreator
                          ? `🔖 ${user.userName} (Yaratuvchi)`
                          : [
                            `Bosqich ${user.stepOrder}`,
                            user.userName,
                            user.username && `@${user.username}`,
                            user.userRole && `- ${user.userRole}`,
                          ]
                            .filter(Boolean)
                            .join(" ");

                        return {
                          value: user.userId,
                          label: userDisplay,
                        };
                      })}
                      placeholder="Foydalanuvchini tanlang"
                      disabled={isLoading}
                      size="sm"
                      radius="sm"
                      styles={{
                        input: {
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #e9ecef",
                          "&:focus": {
                            borderColor: "#1e3a5f",
                          },
                        },
                      }}
                    />
                    {documentData?.createdBy && (
                      <Text size="xs" c="dimmed" mt={4}>
                        💡 Sukut bo'yicha hujjat yaratuvchiga qaytariladi
                      </Text>
                    )}
                  </>
                )}
                <Text size="xs" c="dimmed" mt={4}>
                  ⚠️ Hujjat aylanmasi ushbu foydalanuvchining bosqichidan qayta boshlanadi
                </Text>
              </Box>
            )}
          </Box>

          {/* Validation Error */}
          {!workflowValidation.isValid && (
            <Box
              p="sm"
              style={{
                backgroundColor: "#fff5f5",
                border: "1px solid #ffe3e3",
                borderRadius: 4,
              }}
            >
              <Text size="sm" c="#c92a2a">
                ⚠️ {workflowValidation.error}
              </Text>
            </Box>
          )}

          {/* Footer */}
          <Group justify="flex-end" gap="xs" pt="md" style={{ borderTop: "1px solid #e9ecef" }}>
            <Button
              variant="outline"
              size="sm"
              radius="sm"
              onClick={handleCloseDialog}
              disabled={isLoading}
              styles={{
                root: {
                  borderColor: "#e9ecef",
                  color: "#495057",
                  "&:hover": {
                    backgroundColor: "#f8f9fa",
                  },
                },
              }}
            >
              Bekor qilish
            </Button>
            <Button
              size="sm"
              radius="sm"
              onClick={handleConfirmReject}
              disabled={
                isLoading ||
                !rejectionReason.trim() ||
                rejectionReason.trim().length < 10 ||
                (enableRollback && !selectedRollbackUserId)
              }
              loading={isLoading}
              style={{ backgroundColor: "#c92a2a" }}
            >
              {isLoading ? "Rad etilmoqda..." : "Rad etish"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
});

WorkflowView.displayName = "WorkflowView";

export default WorkflowView;
