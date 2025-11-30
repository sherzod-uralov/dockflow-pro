"use client";

import { useState, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import {
  Paper,
  Box,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  Progress,
  ActionIcon,
  Modal,
  Textarea,
  Select,
  Skeleton,
  Avatar,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconClock,
  IconUser,
  IconFileText,
  IconAlertCircle,
  IconPencil,
  IconTrash,
  IconEye,
  IconFileDescription,
  IconQrcode,
  IconWritingSign,
  IconSearch,
} from "@tabler/icons-react";
import type { WorkflowStepApiResponse } from "@/features/workflow";
import {
  useCompleteWorkflowStep,
  useRejectWorkflowStep,
  useGetWorkflowById,
} from "@/features/workflow";
import { formatDate } from "@/lib/date-utils";
import { useGetUserByIdQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useGetDocumentById } from "@/features/document";
import {
  createWorkflowDocumentEditUrl,
  createWorkflowDocumentViewUrl,
} from "@/utils/url-helper";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";

interface TaskCardProps {
  task: WorkflowStepApiResponse & {
    workflow?: {
      id: string;
      documentId: string;
      currentStepOrder: number;
      status: string;
      document?: {
        id: string;
        title: string;
        documentNumber: string;
        description?: string;
        status: string;
        priority?: string;
      };
    };
  };
  onActionComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onCardClick?: () => void;
  showActions?: boolean;
}

// Status konfiguratsiyasi
const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; bg: string; color: string }> = {
    NOT_STARTED: { label: "Boshlanmagan", bg: "#f1f3f5", color: "#495057" },
    PENDING: { label: "Jarayonda", bg: "#fff3bf", color: "#e67700" },
    IN_PROGRESS: { label: "Bajarilmoqda", bg: "#d0ebff", color: "#1971c2" },
    COMPLETED: { label: "Tugallangan", bg: "#d3f9d8", color: "#2b8a3e" },
    REJECTED: { label: "Bekor qilingan", bg: "#ffe3e3", color: "#c92a2a" },
  };
  return configs[status] || configs.NOT_STARTED;
};

// Action type konfiguratsiyasi
const getActionTypeConfig = (actionType: string) => {
  const configs: Record<string, { label: string; icon: typeof IconCheck; canEdit: boolean }> = {
    APPROVAL: { label: "Tasdiqlash", icon: IconCheck, canEdit: false },
    REVIEW: { label: "Ko'rib chiqish", icon: IconSearch, canEdit: false },
    SIGN: { label: "Imzolash", icon: IconWritingSign, canEdit: true },
    QR_CODE: { label: "QR kod qo'shish", icon: IconQrcode, canEdit: true },
    ACKNOWLEDGE: { label: "Tanishish", icon: IconFileText, canEdit: false },
  };
  return configs[actionType] || configs.APPROVAL;
};

// Priority konfiguratsiyasi
const getPriorityConfig = (priority?: string) => {
  const configs: Record<string, { label: string; bg: string; color: string }> = {
    LOW: { label: "Oddiy", bg: "#f1f3f5", color: "#495057" },
    MEDIUM: { label: "O'rtacha", bg: "#fff3bf", color: "#e67700" },
    HIGH: { label: "Muhim", bg: "#ffe8cc", color: "#d9480f" },
    URGENT: { label: "Juda muhim", bg: "#ffe3e3", color: "#c92a2a" },
  };
  return priority ? configs[priority] : null;
};

const TaskCard = memo(({
  task,
  onActionComplete,
  onEdit,
  onDelete,
  onCardClick,
  showActions = true,
}: TaskCardProps) => {
  const router = useRouter();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [comment, setComment] = useState("");
  const [rollbackToUserId, setRollbackToUserId] = useState<string>("");

  const completeMutation = useCompleteWorkflowStep();
  const rejectMutation = useRejectWorkflowStep();

  const { data: currentUserProfile } = useGetProfileQuery();
  const { data: userData, isLoading: isUserLoading } = useGetUserByIdQuery(
    task.assignedToUserId
  );
  const { data: workflowData } = useGetWorkflowById(task.workflowId);

  const documentId = task.workflow?.document?.id || "";
  // @ts-ignore
  const { data: documentData } = useGetDocumentById(documentId);

  const isLoading = completeMutation.isLoading || rejectMutation.isLoading;

  // Rollback uchun foydalanuvchilar
  const rollbackUsers = useMemo(() => {
    const users: Array<{ id: string; name: string; isCreator?: boolean }> = [];

    if (documentData?.createdBy) {
      users.push({
        id: documentData.createdBy.id,
        name: `${documentData.createdBy.fullname} (Yaratuvchi)`,
        isCreator: true,
      });
    }

    const previousStepUsers =
      workflowData?.workflowSteps
        .filter(
          (step) =>
            step.order < task.order &&
            step.assignedToUser &&
            step.assignedToUserId !== documentData?.createdBy?.id
        )
        .map((step) => ({
          id: step.assignedToUserId,
          name: `${step.assignedToUser?.fullname || step.assignedToUser?.username} (Bosqich ${step.order})`,
        })) || [];

    users.push(...previousStepUsers);
    return users;
  }, [workflowData, task.order, documentData]);

  const handleComplete = () => {
    completeMutation.mutate(task.id, {
      onSuccess: () => {
        setShowCompleteDialog(false);
        onActionComplete?.();
      },
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      return;
    }

    if (!rollbackToUserId) {
      return;
    }

    const payload: any = {
      rejectionReason: rejectReason.trim(),
      rollbackToUserId: rollbackToUserId,
    };

    if (comment.trim()) {
      payload.comment = comment.trim();
    }

    rejectMutation.mutate(
      { id: task.id, data: payload },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          setRejectReason("");
          setComment("");
          setRollbackToUserId("");
          onActionComplete?.();
        },
      }
    );
  };

  const handleEditDocument = () => {
    if (documentData?.attachments?.[0]?.id && documentId) {
      const editUrl = createWorkflowDocumentEditUrl(
        documentData.attachments[0].id,
        documentId,
        task.actionType
      );
      router.push(editUrl);
    }
  };

  const handleViewDocument = () => {
    if (documentData?.attachments?.[0]?.id && documentId) {
      const viewUrl = createWorkflowDocumentViewUrl(
        documentData.attachments[0].id,
        documentId,
        task.actionType
      );
      router.push(viewUrl);
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const actionConfig = getActionTypeConfig(task.actionType);
  const ActionIcon_ = actionConfig.icon;
  const priorityConfig = getPriorityConfig(task.workflow?.document?.priority);

  const isCurrentUserAssigned = currentUserProfile?.id === task.assignedToUserId;
  const canPerformActions =
    isCurrentUserAssigned &&
    (task.status === "NOT_STARTED" ||
      task.status === "PENDING" ||
      task.status === "IN_PROGRESS");

  const canEditDocument =
    isCurrentUserAssigned &&
    task.status === "IN_PROGRESS" &&
    actionConfig.canEdit &&
    documentData?.attachments &&
    documentData.attachments.length > 0;

  const document = task.workflow?.document;

  // Progress hisoblash
  const progress = useMemo(() => {
    if (!workflowData?.workflowSteps) return 0;
    const totalSteps = workflowData.workflowSteps.length;
    const completedSteps = workflowData.workflowSteps.filter(
      (step) => step.status === "COMPLETED"
    ).length;
    return (completedSteps / totalSteps) * 100;
  }, [workflowData]);

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";

  return (
    <>
      <Paper
        p="md"
        radius="sm"
        withBorder
        style={{
          borderColor: "#e9ecef",
          cursor: onCardClick ? "pointer" : "default",
          transition: "all 0.2s",
        }}
        onClick={onCardClick}
        onMouseEnter={(e) => {
          if (onCardClick) {
            e.currentTarget.style.borderColor = "#1e3a5f";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e9ecef";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: "#f1f3f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconFileText size={20} color="#1e3a5f" />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="md" fw={600} c="#212529" lineClamp={1}>
                  {document?.title || "Hujjat topilmadi"}
                </Text>
                <Group gap="xs">
                  <Badge
                    size="sm"
                    radius="sm"
                    variant="outline"
                    style={{ borderColor: "#e9ecef", color: "#495057", fontFamily: "monospace" }}
                  >
                    {document?.documentNumber || "—"}
                  </Badge>
                </Group>
              </Box>
            </Group>

            <Group gap="xs">
              <Badge
                size="sm"
                radius="sm"
                variant="filled"
                style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
              >
                {statusConfig.label}
              </Badge>
              {priorityConfig && (
                <Badge
                  size="sm"
                  radius="sm"
                  variant="filled"
                  style={{ backgroundColor: priorityConfig.bg, color: priorityConfig.color }}
                >
                  {priorityConfig.label}
                </Badge>
              )}
              {showActions && (onEdit || onDelete) && (
                <Group gap={4}>
                  {onEdit && (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="gray"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  )}
                  {onDelete && (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </Group>
              )}
            </Group>
          </Group>

          {/* Description */}
          {document?.description && (
            <Text size="sm" c="dimmed" lineClamp={2}>
              {document.description}
            </Text>
          )}

          {/* Progress */}
          {workflowData && (
            <Box p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}>
              <Group justify="space-between" mb={6}>
                <Text size="xs" fw={500} c="#495057">
                  Jarayon
                </Text>
                <Text size="xs" c="dimmed">
                  {Math.round(progress)}%
                </Text>
              </Group>
              <Progress value={progress} size="sm" radius="sm" color="#1e3a5f" />
              <Group justify="space-between" mt={6}>
                <Text size="xs" c="dimmed">
                  Bosqich {task.order} / {workflowData.workflowSteps.length}
                </Text>
                <Text size="xs" c="dimmed">
                  {workflowData.workflowSteps.filter((s) => s.status === "COMPLETED").length}{" "}
                  tugallangan
                </Text>
              </Group>
            </Box>
          )}

          {/* Action type */}
          <Group gap="sm" p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}>
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActionIcon_ size={16} color="#1e3a5f" />
            </Box>
            <Box>
              <Text size="sm" fw={600} c="#212529">
                {actionConfig.label}
              </Text>
              <Text size="xs" c="dimmed">
                Bosqich {task.order}
              </Text>
            </Box>
          </Group>

          {/* Info cards */}
          <Group grow>
            {task.dueDate && (
              <Box
                p="sm"
                style={{
                  backgroundColor: isOverdue ? "#ffe3e3" : "#f8f9fa",
                  borderRadius: 4,
                }}
              >
                <Group gap="xs">
                  {isOverdue ? (
                    <IconAlertCircle size={16} color="#c92a2a" />
                  ) : (
                    <IconClock size={16} color="#868e96" />
                  )}
                  <Box>
                    <Text size="xs" c={isOverdue ? "#c92a2a" : "dimmed"}>
                      Muddat
                    </Text>
                    <Text size="sm" fw={500} c={isOverdue ? "#c92a2a" : "#212529"}>
                      {formatDate(task.dueDate)}
                    </Text>
                    {isOverdue && (
                      <Text size="xs" c="#c92a2a" fw={500}>
                        Muddati o'tgan
                      </Text>
                    )}
                  </Box>
                </Group>
              </Box>
            )}

            <Box p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}>
              <Group gap="xs">
                <IconUser size={16} color="#868e96" />
                <Box>
                  <Text size="xs" c="dimmed">
                    Mas'ul
                  </Text>
                  {isUserLoading ? (
                    <Skeleton height={16} width={100} />
                  ) : (
                    <Text size="sm" fw={500} c="#212529" lineClamp={1}>
                      {userData?.fullname || userData?.username || "—"}
                    </Text>
                  )}
                </Box>
              </Group>
            </Box>
          </Group>

          {/* Rejection info */}
          {task.isRejected && task.rejectionReason && (
            <Box
              p="sm"
              style={{
                backgroundColor: "#ffe3e3",
                borderRadius: 4,
                border: "1px solid #ffc9c9",
              }}
            >
              <Group gap="xs" mb={4}>
                <IconX size={16} color="#c92a2a" />
                <Text size="sm" fw={600} c="#c92a2a">
                  Bekor qilish sababi:
                </Text>
              </Group>
              <Text size="sm" c="#862e2e">
                {task.rejectionReason}
              </Text>
            </Box>
          )}

          {/* View button for completed */}
          {task.status === "COMPLETED" &&
            documentData?.attachments &&
            documentData.attachments.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                radius="sm"
                fullWidth
                leftSection={<IconEye size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDocument();
                }}
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
            )}

          {/* Action buttons */}
          {canPerformActions && (
            <Stack gap="xs">
              {canEditDocument && (
                <Button
                  variant="outline"
                  size="sm"
                  radius="sm"
                  fullWidth
                  leftSection={<IconFileDescription size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditDocument();
                  }}
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
                  {task.actionType === "QR_CODE" ? "QR kod qo'shish" : "Hujjatni tahrirlash"}
                </Button>
              )}
              <Group grow>
                <Button
                  size="sm"
                  radius="sm"
                  leftSection={<IconCheck size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCompleteDialog(true);
                  }}
                  disabled={isLoading}
                  style={{ backgroundColor: "#2b8a3e" }}
                >
                  Tasdiqlash
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  radius="sm"
                  leftSection={<IconX size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (documentData?.createdBy?.id) {
                      setRollbackToUserId(documentData.createdBy.id);
                    }
                    setShowRejectDialog(true);
                  }}
                  disabled={isLoading}
                  color="red"
                >
                  Bekor qilish
                </Button>
              </Group>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Complete Dialog */}
      <Modal
        opened={showCompleteDialog}
        onClose={() => setShowCompleteDialog(false)}
        title={<Text fw={600} c="#212529">Vazifani tasdiqlash</Text>}
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Siz haqiqatan ham bu vazifani tasdiqlashni xohlaysizmi?
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button
              variant="outline"
              size="sm"
              radius="sm"
              onClick={() => setShowCompleteDialog(false)}
              disabled={isLoading}
              styles={{
                root: {
                  borderColor: "#e9ecef",
                  color: "#495057",
                },
              }}
            >
              Bekor qilish
            </Button>
            <Button
              size="sm"
              radius="sm"
              onClick={handleComplete}
              loading={isLoading}
              style={{ backgroundColor: "#2b8a3e" }}
            >
              Tasdiqlash
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Reject Dialog */}
      <Modal
        opened={showRejectDialog}
        onClose={() => {
          setShowRejectDialog(false);
          setRejectReason("");
          setComment("");
          setRollbackToUserId("");
        }}
        title={<Text fw={600} c="#212529">Vazifani bekor qilish</Text>}
        centered
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Qaytarish uchun foydalanuvchi"
            placeholder="Foydalanuvchini tanlang"
            data={rollbackUsers.map((user) => ({
              value: user.id,
              label: user.name,
            }))}
            value={rollbackToUserId}
            onChange={(value) => setRollbackToUserId(value || "")}
            required
            size="sm"
            radius="sm"
            styles={{
              input: {
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
              },
              label: {
                color: "#495057",
                fontWeight: 500,
                marginBottom: 4,
              },
            }}
          />

          <Box>
            <Text size="sm" fw={500} c="#495057" mb={4}>
              Bekor qilish sababi <Text span c="red">*</Text>
            </Text>
            <Textarea
              placeholder="Kamida 10 ta belgi kiriting..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              minRows={3}
              maxLength={500}
              size="sm"
              radius="sm"
              styles={{
                input: {
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                },
              }}
            />
            <Group justify="space-between" mt={4}>
              {rejectReason.length < 10 ? (
                <Text size="xs" c="red">
                  {rejectReason.length === 0
                    ? "Bu maydon majburiy"
                    : `Yana ${10 - rejectReason.length} ta belgi kerak`}
                </Text>
              ) : (
                <Text size="xs" c="green">
                  Yetarli
                </Text>
              )}
              <Text size="xs" c="dimmed">
                {rejectReason.length}/500
              </Text>
            </Group>
          </Box>

          <Box>
            <Text size="sm" fw={500} c="#495057" mb={4}>
              Qo'shimcha izoh
            </Text>
            <Textarea
              placeholder="Qo'shimcha ma'lumot..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              minRows={2}
              maxLength={1000}
              size="sm"
              radius="sm"
              styles={{
                input: {
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                },
              }}
            />
          </Box>

          <Group justify="flex-end" gap="xs" pt="sm" style={{ borderTop: "1px solid #e9ecef" }}>
            <Button
              variant="outline"
              size="sm"
              radius="sm"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
                setComment("");
                setRollbackToUserId("");
              }}
              disabled={isLoading}
              styles={{
                root: {
                  borderColor: "#e9ecef",
                  color: "#495057",
                },
              }}
            >
              Bekor qilish
            </Button>
            <Button
              size="sm"
              radius="sm"
              color="red"
              onClick={handleReject}
              loading={isLoading}
              disabled={!rejectReason.trim() || rejectReason.length < 10 || !rollbackToUserId}
            >
              Bekor qilish
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
});

TaskCard.displayName = "TaskCard";

export default TaskCard;
