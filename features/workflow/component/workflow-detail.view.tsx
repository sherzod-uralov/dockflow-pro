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
  Progress,
  Modal,
  Textarea,
  Select,
  SimpleGrid,
  Timeline,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import {
  IconFileText,
  IconUser,
  IconClock,
  IconCircleX,
  IconEye,
  IconAlertCircle,
  IconSignature,
  IconQrcode,
  IconClipboardCheck,
  IconBookmark,
  IconCheck, IconDownload,
  IconFile,
} from "@tabler/icons-react";
import { formatDateTime } from "@/lib/date-utils";
import {
  WorkflowApiResponse,
  WorkflowStepApiResponse,
} from "../type/workflow.type";
import {
  useCompleteWorkflowStep,
  useRejectWorkflowStep,
} from "../hook/workflow.hook";
import { useGetDocumentById } from "@/features/document";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";
import Link from "next/link";

interface WorkflowDetailViewProps {
  workflow: WorkflowApiResponse;
}

const ACTION_LABELS: Record<string, { label: string; icon: any }> = {
  APPROVAL: { label: "Tasdiqlash", icon: IconClipboardCheck },
  SIGN: { label: "Imzolash", icon: IconSignature },
  QR_CODE: { label: "QR kod qo'yish", icon: IconQrcode },
  REVIEW: { label: "Ko'rib chiqish", icon: IconEye },
  ACKNOWLEDGE: { label: "Tanishish", icon: IconBookmark },
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Faol",
  COMPLETED: "Tugallangan",
  CANCELLED: "Bekor qilingan",
  PAUSED: "To'xtatilgan",
  DRAFT: "Tayyorlanmoqda",
};

const STEP_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NOT_STARTED: { label: "Kutilmoqda", color: "gray" },
  PENDING: { label: "Kutilmoqda", color: "gray" },
  IN_PROGRESS: { label: "Jarayonda", color: "blue" },
  COMPLETED: { label: "Bajarildi", color: "green" },
  REJECTED: { label: "Rad etildi", color: "red" },
};

const WorkflowDetailView = memo(({ workflow }: WorkflowDetailViewProps) => {
  const router = useRouter();
  const completeMutation = useCompleteWorkflowStep();
  const rejectMutation = useRejectWorkflowStep();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStepApiResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rollbackUserId, setRollbackUserId] = useState("");

  const { data: currentUser } = useGetProfileQuery();
  const { data: documentData } = useGetDocumentById(workflow.document?.id || "");

  const isLoading = completeMutation.isLoading || rejectMutation.isLoading;

  // Progress
  const totalSteps = workflow.workflowSteps?.length || 0;
  const completedSteps = workflow.workflowSteps?.filter(s => s.status === "COMPLETED").length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Current step
  const currentStep = workflow.workflowSteps?.find(
    step => step.order === workflow.currentStepOrder
  );

  // Current action config
  const currentActionLabel = currentStep
    ? ACTION_LABELS[currentStep.actionType] || ACTION_LABELS.APPROVAL
    : null;

  // Can edit document
  const canEditDocument = documentData?.attachments && documentData.attachments.length > 0;

  // Is current user assigned
  const isCurrentUserAssigned = currentUser?.id === currentStep?.assignedToUserId;
  const canTakeAction = currentStep && isCurrentUserAssigned &&
    currentStep.status !== "COMPLETED" && currentStep.status !== "REJECTED";

  // Rollback users
  const rollbackUsers = useMemo(() => {
    if (!selectedStep) return [];

    const users: { value: string; label: string }[] = [];

    if (documentData?.createdBy) {
      users.push({
        value: documentData.createdBy.id,
        label: `${documentData.createdBy.fullname} (Yaratuvchi)`,
      });
    }

    const previousSteps = workflow.workflowSteps
      .filter(step => step.order < selectedStep.order && step.assignedToUser)
      .sort((a, b) => b.order - a.order);

    previousSteps.forEach(step => {
      if (step.assignedToUser && !users.some(u => u.value === step.assignedToUserId)) {
        users.push({
          value: step.assignedToUserId,
          label: `${step.assignedToUser.fullname} (Bosqich ${step.order + 1})`,
        });
      }
    });

    return users;
  }, [selectedStep, workflow, documentData]);

  // Handlers
  const handleComplete = useCallback((stepId: string) => {
    completeMutation.mutate(stepId);
  }, [completeMutation]);

  const handleOpenReject = useCallback((step: WorkflowStepApiResponse) => {
    setSelectedStep(step);
    setRejectReason("");
    if (documentData?.createdBy?.id) {
      setRollbackUserId(documentData.createdBy.id);
    }
    setRejectModalOpen(true);
  }, [documentData]);

  const handleConfirmReject = useCallback(() => {
    if (!selectedStep || !rejectReason.trim() || rejectReason.length < 10 || !rollbackUserId) return;

    rejectMutation.mutate(
      {
        id: selectedStep.id,
        data: {
          rejectionReason: rejectReason.trim(),
          rollbackToUserId: rollbackUserId,
        },
      },
      {
        onSuccess: () => {
          setRejectModalOpen(false);
          setRejectReason("");
          setRollbackUserId("");
          setSelectedStep(null);
        },
      }
    );
  }, [selectedStep, rejectReason, rollbackUserId, rejectMutation]);

  const handlePdfAction = useCallback((actionType: string) => {
    if (documentData?.id) {
      router.push(`/pdf/${documentData.id}?workflowId=${workflow.id}&actionType=${actionType}`);
    }
  }, [documentData, workflow.id, router]);

  const handleViewDocument = useCallback(() => {
    if (documentData?.attachments?.[0]?.id && workflow.documentId) {
      router.push(`/document-edit?id=${documentData.attachments[0].id}&documentId=${workflow.documentId}&readonly=true`);
    }
  }, [documentData, workflow.documentId, router]);

  const handleDownloadDocument = useCallback(() => {
    if (workflow.document?.pdfUrl) {
      const link = document.createElement('a');
      link.href = workflow.document.pdfUrl;
      link.download = `${workflow.document.title || 'document'}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [workflow.document]);

  return (
    <Stack gap="md">
      {canTakeAction && currentActionLabel && currentStep && (
        <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
          <Group justify="space-between" mb="md">
            <Group gap="sm">
              <ThemeIcon size={40} radius="sm" variant="light" color="dark">
                <currentActionLabel.icon size={22} />
              </ThemeIcon>
              <Box>
                <Text size="sm" c="dimmed">Sizning vazifangiz</Text>
                <Text size="lg" fw={600} c="#212529">
                  {currentActionLabel.label}
                </Text>
              </Box>
            </Group>
            <Badge variant="light" color="gray" size="lg">
              {completedSteps}/{totalSteps} bosqich
            </Badge>
          </Group>

          <Progress value={progress} size="sm" radius="xl" mb="lg" color="dark" />
          <Stack gap="sm">

            {currentStep.actionType === "QR_CODE" && canEditDocument && (
              <Button
                variant="outline"
                size="md"
                radius="sm"
                fullWidth
                leftSection={<IconQrcode size={18} />}
                onClick={() => handlePdfAction("QR_CODE")}
                disabled={isLoading}
                color="dark"
              >
                QR kod qo'yish
              </Button>
            )}

            {/* SIGN - go to PDF editor for signature */}
            {currentStep.actionType === "SIGN" && canEditDocument && (
              <Button
                variant="outline"
                size="md"
                radius="sm"
                fullWidth
                leftSection={<IconSignature size={18} />}
                onClick={() => handlePdfAction("SIGN")}
                disabled={isLoading}
                color="dark"
              >
                imzolash
              </Button>
            )}

            {(currentStep.actionType === "REVIEW" || currentStep.actionType === "ACKNOWLEDGE" || currentStep.actionType === "APPROVAL") && canEditDocument && (
              <Button
                variant="outline"
                size="md"
                radius="sm"
                fullWidth
                leftSection={<IconEye size={18} />}
                onClick={handleViewDocument}
                disabled={isLoading}
                color="dark"
              >
                Hujjat bilan tanishish
              </Button>
            )}

            {/* Main actions */}
            <Group grow>
              <Button
                size="md"
                radius="sm"
                leftSection={<IconCheck size={18} />}
                onClick={() => handleComplete(currentStep.id)}
                disabled={isLoading}
                loading={completeMutation.isLoading}
                style={{ backgroundColor: "#1e3a5f" }}
              >
                {currentActionLabel.label === "QR kod qo'yish" ? "Tasdiqlash" : currentActionLabel.label}
              </Button>
              <Button
                variant="outline"
                size="md"
                radius="sm"
                leftSection={<IconCircleX size={18} />}
                onClick={() => handleOpenReject(currentStep)}
                disabled={isLoading}
                color="red"
              >
                Rad etish
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

      {!canTakeAction && currentStep &&
        currentStep.status !== "COMPLETED" &&
        currentStep.status !== "REJECTED" &&
        workflow.status !== "COMPLETED" && (
          <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef", backgroundColor: "#f8f9fa" }}>
            <Group gap="sm">
              <Avatar size="md" radius="xl" color="dark">
                {currentStep.assignedToUser?.fullname
                  ?.split(" ")
                  .map(n => n[0])
                  .join("") || "??"}
              </Avatar>
              <Box style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">Kutilmoqda</Text>
                <Text size="sm" fw={500} c="#212529">
                  {currentStep.assignedToUser?.fullname || "Tayinlanmagan"}
                </Text>
              </Box>
              <Badge variant="light" color="gray" size="sm">
                {ACTION_LABELS[currentStep.actionType]?.label || currentStep.actionType}
              </Badge>
            </Group>
          </Paper>
        )}

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
        {/* Steps timeline */}
        <Box style={{ gridColumn: "span 2" }}>
          <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
            <Group justify="space-between" mb="lg">
              <Text size="md" fw={600} c="#212529">Bosqichlar</Text>
              <Badge variant="light" color={workflow.status === "COMPLETED" ? "green" : "gray"}>
                {STATUS_LABELS[workflow.status] || workflow.status}
              </Badge>
            </Group>

            <Timeline active={workflow.currentStepOrder} bulletSize={32} lineWidth={2}>
              {workflow.workflowSteps
                .sort((a, b) => a.order - b.order)
                .map((step) => {
                  const stepStatus = STEP_STATUS_LABELS[step.status] || STEP_STATUS_LABELS.NOT_STARTED;
                  const actionLabel = ACTION_LABELS[step.actionType] || ACTION_LABELS.APPROVAL;
                  const ActionIcon = actionLabel.icon;
                  const isCurrentStep = step.order === workflow.currentStepOrder;

                  return (
                    <Timeline.Item
                      key={step.id}
                      bullet={
                        <ThemeIcon
                          size={32}
                          radius="xl"
                          color={stepStatus.color}
                          variant={step.status === "COMPLETED" || isCurrentStep ? "filled" : "light"}
                        >
                          <ActionIcon size={16} />
                        </ThemeIcon>
                      }
                      title={
                        <Group gap="xs">
                          <Text size="sm" fw={500} c="#212529">
                            {actionLabel.label}
                          </Text>
                          {isCurrentStep && (
                            <Badge size="xs" variant="light" color="blue">Joriy</Badge>
                          )}
                        </Group>
                      }
                    >
                      <Paper p="sm" mt="xs" radius="sm" bg={isCurrentStep ? "#f8f9fa" : "transparent"}>
                        <Group gap="sm">
                          <Avatar size="sm" radius="xl" color="dark">
                            {step.assignedToUser?.fullname
                              ?.split(" ")
                              .map(n => n[0])
                              .join("") || "??"}
                          </Avatar>
                          <Box style={{ flex: 1 }}>
                            <Text size="sm" c="#212529">
                              {step.assignedToUser?.fullname || "Tayinlanmagan"}
                            </Text>
                          </Box>
                          <Badge size="xs" variant="light" color={stepStatus.color}>
                            {stepStatus.label}
                          </Badge>
                        </Group>

                        {/* Rejection reason */}
                        {step.isRejected && step.rejectionReason && (
                          <Box
                            p="xs"
                            mt="sm"
                            style={{
                              backgroundColor: "#fff5f5",
                              borderRadius: 4,
                              border: "1px solid #ffe3e3",
                            }}
                          >
                            <Text size="xs" c="#c92a2a">
                              <IconAlertCircle size={12} style={{ display: "inline", marginRight: 4 }} />
                              {step.rejectionReason}
                            </Text>
                          </Box>
                        )}

                        {step.completedAt && (
                          <Text size="xs" c="dimmed" mt="xs">
                            {formatDateTime(step.completedAt)}
                          </Text>
                        )}
                      </Paper>
                    </Timeline.Item>
                  );
                })}
            </Timeline>
          </Paper>
        </Box>

        {/* Right sidebar */}
        <Stack gap="md">
          {/* Document info */}
          <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
            <Group gap="xs" mb="sm">
              <IconFileText size={16} color="#1e3a5f" />
              <Text size="sm" fw={600} c="#212529">Hujjat</Text>
            </Group>

            <Stack gap="xs">
              <Text size="sm" c="#212529">{workflow.document?.title || "—"}</Text>
              <Text size="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
                {workflow.document?.documentNumber || "—"}
              </Text>
            </Stack>

            {canEditDocument && (
              <>
                <Divider my="sm" />
                <Stack gap="xs">
                  {/* Original document (Word/Excel) */}
                  <Button
                    variant="light"
                    size="xs"
                    radius="sm"
                    fullWidth
                    leftSection={<IconFile size={14} />}
                    onClick={handleViewDocument}
                    color="gray"
                  >
                    Original hujjat
                  </Button>
                  {workflow.document?.pdfUrl && workflow.status === "COMPLETED" && (
                    <Button
                      variant="filled"
                      size="xs"
                      radius="sm"
                      fullWidth
                      leftSection={<IconDownload size={14} />}
                      onClick={handleDownloadDocument}
                      style={{ backgroundColor: "#1e3a5f" }}
                    >
                      Tasdiqlangan PDF
                    </Button>
                  )}
                </Stack>
              </>
            )}
          </Paper>

          {/* Creator */}
          {documentData?.createdBy && (
            <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
              <Group gap="xs" mb="sm">
                <IconUser size={16} color="#1e3a5f" />
                <Text size="sm" fw={600} c="#212529">Yaratuvchi</Text>
              </Group>

              <Group gap="sm">
                <Avatar size="sm" radius="xl" color="dark">
                  {documentData.createdBy.fullname
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "??"}
                </Avatar>
                <Text size="sm" c="#212529">
                  {documentData.createdBy.fullname}
                </Text>
              </Group>
            </Paper>
          )}

          {/* Dates */}
          <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
            <Group gap="xs" mb="sm">
              <IconClock size={16} color="#1e3a5f" />
              <Text size="sm" fw={600} c="#212529">Sanalar</Text>
            </Group>

            <Stack gap="xs">
              <Box>
                <Text size="xs" c="dimmed">Yaratilgan</Text>
                <Text size="sm" c="#495057">{formatDateTime(workflow.createdAt)}</Text>
              </Box>

              {workflow.deadline && (
                <Box>
                  <Text size="xs" c="dimmed">Muddat (Deadline)</Text>
                  <Text size="sm" c={new Date(workflow.deadline) < new Date() && workflow.status !== 'COMPLETED' ? "red" : "#495057"} fw={500}>
                    {formatDateTime(workflow.deadline)}
                  </Text>
                </Box>
              )}
            </Stack>
          </Paper>
        </Stack>
      </SimpleGrid>

      {/* Reject modal */}
      <Modal
        opened={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={<Text fw={600} c="#212529">Rad etish</Text>}
        size="md"
        radius="sm"
        centered
      >
        <Stack gap="md">
          <Box
            p="sm"
            style={{
              backgroundColor: "#fff5f5",
              borderRadius: 4,
              border: "1px solid #ffe3e3",
            }}
          >
            <Text size="sm" c="#c92a2a">
              Hujjat tanlangan foydalanuvchiga qaytariladi
            </Text>
          </Box>

          <Select
            label="Kimga qaytarish"
            placeholder="Tanlang"
            data={rollbackUsers}
            value={rollbackUserId}
            onChange={(v) => setRollbackUserId(v || "")}
            required
            size="sm"
            radius="sm"
          />

          <Textarea
            label="Sabab"
            placeholder="Kamida 10 ta belgi"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            minRows={3}
            maxLength={500}
            size="sm"
            radius="sm"
            required
            error={rejectReason.length > 0 && rejectReason.length < 10 ? `${10 - rejectReason.length} ta belgi` : null}
          />

          <Group justify="flex-end" gap="xs">
            <Button
              variant="subtle"
              size="sm"
              radius="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={isLoading}
              color="gray"
            >
              Bekor qilish
            </Button>
            <Button
              size="sm"
              radius="sm"
              onClick={handleConfirmReject}
              disabled={isLoading || rejectReason.length < 10 || !rollbackUserId}
              loading={rejectMutation.isLoading}
              color="red"
            >
              Rad etish
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
});

WorkflowDetailView.displayName = "WorkflowDetailView";

export default WorkflowDetailView;
