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
  IconClipboardCheck,
  IconBookmark,
  IconCheck,
  IconDownload,
  IconFile,
  IconCalendar,
  IconUserCheck,
} from "@tabler/icons-react";
import { formatDateTime } from "@/lib/date-utils";
import {
  WorkflowApiResponse,
  WorkflowStepApiResponse,
} from "../type/workflow.type";
import {
  useCompleteWorkflowStep,
  useRejectWorkflowStep,
  useDownloadDocument,
} from "../hook/workflow.hook";
import { useGetDocumentById } from "@/features/document";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";
import { VerificationStep } from "@/features/workflow/component/verification-step";

interface WorkflowDetailViewProps {
  workflow: WorkflowApiResponse;
}

const ACTION_LABELS: Record<string, { label: string; icon: any }> = {
  APPROVAL: { label: "Tasdiqlash", icon: IconClipboardCheck },
  SIGN: { label: "Imzolash", icon: IconSignature },
  REVIEW: { label: "Ko'rib chiqish", icon: IconEye },
  ACKNOWLEDGE: { label: "Tanishish", icon: IconBookmark },
  VERIFICATION: { label: "Ijro uchun", icon: IconCheck },
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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const WorkflowDetailView = memo(({ workflow }: WorkflowDetailViewProps) => {
  const router = useRouter();
  const completeMutation = useCompleteWorkflowStep();
  const rejectMutation = useRejectWorkflowStep();
  const downloadMutation = useDownloadDocument();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStepApiResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rollbackUserId, setRollbackUserId] = useState("");

  const { data: currentUser } = useGetProfileQuery();
  const { data: documentData } = useGetDocumentById(workflow.document?.id || "");

  const isLoading = completeMutation.isLoading || rejectMutation.isLoading || downloadMutation.isLoading;

  const totalSteps = workflow.workflowSteps?.length || 0;
  const completedSteps = workflow.workflowSteps?.filter(s => s.status === "COMPLETED").length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const currentStep = workflow.workflowSteps?.find(
    step => step.order === workflow.currentStepOrder
  );

  const currentActionLabel = currentStep
    ? ACTION_LABELS[currentStep.actionType] || ACTION_LABELS.APPROVAL
    : null;

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

    // Check if the selected user is the creator
    const isCreator = documentData?.createdBy?.id === rollbackUserId;

    rejectMutation.mutate(
      {
        id: selectedStep.id,
        data: {
          rejectionReason: rejectReason.trim(),
          rollbackToUserId: rollbackUserId,
          rejectToCreator: isCreator,
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
  }, [selectedStep, rejectReason, rollbackUserId, rejectMutation, documentData]);

  const handlePdfAction = useCallback((actionType: string) => {
    if (documentData?.id) {
      router.push(`/pdf/${documentData.id}?workflowId=${workflow.id}&actionType=${actionType}`);
    }
  }, [documentData, workflow.id, router]);

  const handleViewDocument = useCallback(() => {
    if (workflow.document?.id) {
      router.push(`/pdf/${workflow.document.id}?action=read`);
    }
  }, [workflow.document, router]);

  const handleDownloadDocument = useCallback(() => {
    if (workflow.document?.id) {
      downloadMutation.mutate({
        documentId: workflow.document.id,
        filename: `${workflow.document.title || 'document'}.pdf`,
      });
    }
  }, [workflow.document, downloadMutation]);

  return (
    <Stack gap="md">
      {canTakeAction && currentActionLabel && currentStep && (
        currentStep.actionType === 'VERIFICATION' ? (
          <VerificationStep stepId={currentStep.id} />
        ) : (
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
                  onClick={() => handlePdfAction(currentStep.actionType)}
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
                  {currentActionLabel.label}
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
        )
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

            <Timeline active={workflow.currentStepOrder - 1} bulletSize={36} lineWidth={2} color="dark">
              {workflow.workflowSteps
                .sort((a, b) => a.order - b.order)
                .map((step) => {
                  const stepStatus = STEP_STATUS_LABELS[step.status] || STEP_STATUS_LABELS.NOT_STARTED;
                  const actionLabel = ACTION_LABELS[step.actionType] || ACTION_LABELS.APPROVAL;
                  const ActionIcon = actionLabel.icon;
                  const isCurrentStep = step.order === workflow.currentStepOrder;
                  const isCompleted = step.status === "COMPLETED";
                  const hasPdf = workflow.document?.pdfUrl;

                  return (
                    <Timeline.Item
                      key={step.id}
                      bullet={
                        <ThemeIcon
                          size={36}
                          radius="xl"
                          color={stepStatus.color}
                          variant={isCompleted ? "filled" : isCurrentStep ? "light" : "outline"}
                          style={{
                            border: isCompleted ? "none" : "2px solid",
                            borderColor: stepStatus.color === "green" ? "#51cf66" : stepStatus.color === "blue" ? "#339af0" : "#ced4da"
                          }}
                        >
                          <ActionIcon size={18} />
                        </ThemeIcon>
                      }
                      title={
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="xs">
                            <Text size="md" fw={600} c="#212529">
                              {actionLabel.label}
                            </Text>
                            {isCurrentStep && (
                              <Badge size="sm" variant="dot" color="blue">Joriy bosqich</Badge>
                            )}
                          </Group>
                          <Badge size="sm" variant="light" color={stepStatus.color}>
                            {stepStatus.label}
                          </Badge>
                        </Group>
                      }
                    >
                      <Paper
                        p="md"
                        mt="sm"
                        radius="sm"
                        bg={isCurrentStep ? "#f1f3f5" : "white"}
                        withBorder={isCurrentStep}
                        style={{
                          borderColor: isCurrentStep ? "#339af0" : "transparent",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {/* User Info */}
                        <Group gap="md" mb={isCompleted || step.isRejected ? "md" : 0}>
                          <Avatar
                            size="md"
                            radius="xl"
                            color={isCompleted ? "green" : isCurrentStep ? "blue" : "gray"}
                            variant={isCompleted ? "filled" : "light"}
                          >
                            {step.assignedToUser?.fullname
                              ?.split(" ")
                              .map(n => n[0])
                              .join("") || "??"}
                          </Avatar>
                          <Box style={{ flex: 1 }}>
                            <Text size="sm" fw={500} c="#212529">
                              {step.assignedToUser?.fullname || "Tayinlanmagan"}
                            </Text>
                            <Text size="xs" c="dimmed">
                              @{step.assignedToUser?.username || "unknown"}
                            </Text>
                          </Box>
                        </Group>

                        {/* Completion Time */}
                        {step.completedAt && (
                          <Group gap="xs" mb="sm">
                            <IconCheck size={14} color="#51cf66" />
                            <Text size="xs" c="dimmed">
                              Bajarilgan: {formatDateTime(step.completedAt)}
                            </Text>
                          </Group>
                        )}

                        {/* Started Time for current step */}
                        {isCurrentStep && step.startedAt && (
                          <Group gap="xs" mb="sm">
                            <IconClock size={14} color="#339af0" />
                            <Text size="xs" c="dimmed">
                              Boshlangan: {formatDateTime(step.startedAt)}
                            </Text>
                          </Group>
                        )}

                        {/* Creator Badge */}
                        {step.isCreator && (
                          <Group gap="xs" mb="sm">
                            <Badge
                              variant="light"
                              color="violet"
                              size="sm"
                              leftSection={<IconUserCheck size={12} />}
                            >
                              Hujjat yaratuvchisi
                            </Badge>
                          </Group>
                        )}

                        {/* Due Date */}
                        {step.dueDate && (
                          <Group gap="xs" mb="sm">
                            <IconCalendar size={14} color={new Date(step.dueDate) < new Date() && step.status !== "COMPLETED" ? "#c92a2a" : "#868e96"} />
                            <Text
                              size="xs"
                              c={new Date(step.dueDate) < new Date() && step.status !== "COMPLETED" ? "red" : "dimmed"}
                              fw={new Date(step.dueDate) < new Date() && step.status !== "COMPLETED" ? 500 : 400}
                            >
                              Muddat: {formatDateTime(step.dueDate)}
                              {new Date(step.dueDate) < new Date() && step.status !== "COMPLETED" && " (O'tgan)"}
                            </Text>
                          </Group>
                        )}

                        {/* Rejection reason */}
                        {step.isRejected && step.rejectionReason && (
                          <Box
                            p="sm"
                            mb="sm"
                            style={{
                              backgroundColor: "#fff5f5",
                              borderRadius: 6,
                              border: "1px solid #ffe3e3",
                            }}
                          >
                            <Group gap="xs" mb={4}>
                              <IconAlertCircle size={14} color="#c92a2a" />
                              <Text size="xs" fw={600} c="#c92a2a">
                                Rad etildi
                              </Text>
                            </Group>
                            <Text size="xs" c="#c92a2a">
                              {step.rejectionReason}
                            </Text>
                          </Box>
                        )}

                        {/* Ijro natijalari - faqat VERIFICATION stepi uchun */}
                        {step.actionType === "VERIFICATION" && step.attachments && step.attachments.length > 0 && (
                          <Box mt="sm">
                            <Text size="xs" fw={500} c="dimmed" mb="xs">
                              Ijro natijalari ({step.attachments.length})
                            </Text>
                            <Stack gap={6}>
                              {step.attachments.map((att) => (
                                <Group
                                  key={att.id}
                                  justify="space-between"
                                  wrap="nowrap"
                                  p="xs"
                                  style={{
                                    backgroundColor: "#f8f9fa",
                                    borderRadius: 6,
                                  }}
                                >
                                  <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                                    <IconFile size={16} color="#868e96" />
                                    <Box style={{ minWidth: 0, flex: 1 }}>
                                      <Text size="xs" fw={500} c="#212529" truncate>
                                        {att.attachment.fileName}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        {formatFileSize(att.attachment.fileSize)} • {att.uploadedBy?.fullname}
                                      </Text>
                                    </Box>
                                  </Group>
                                  <Button
                                    component="a"
                                    href={att.attachment.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="subtle"
                                    size="xs"
                                    radius="sm"
                                    color="dark"
                                    leftSection={<IconDownload size={14} />}
                                  >
                                    Yuklab olish
                                  </Button>
                                </Group>
                              ))}
                            </Stack>
                          </Box>
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
          <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
            <Group gap="xs" mb="md">
              <IconFileText size={18} color="#1e3a5f" />
              <Text size="md" fw={600} c="#212529">Hujjat</Text>
            </Group>

            <Stack gap="md">
              <Box>
                <Text size="xs" c="dimmed" mb={4}>Nomi</Text>
                <Text size="sm" fw={500} c="#212529">
                  {workflow.document?.title || "—"}
                </Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" mb={4}>Raqam</Text>
                <Text size="sm" style={{ fontFamily: "monospace" }} c="#495057">
                  {workflow.document?.documentNumber || "—"}
                </Text>
              </Box>

              {workflow.document?.documentType && (
                <Box>
                  <Text size="xs" c="dimmed" mb={4}>Turi</Text>
                  <Badge variant="light" color="dark" size="sm">
                    {workflow.document.documentType.name}
                  </Badge>
                </Box>
              )}

              <Divider />

              {/* Document Actions */}
              <Stack gap="xs">
                {workflow.document?.id && (
                  <Button
                    variant="light"
                    size="sm"
                    radius="sm"
                    fullWidth
                    leftSection={<IconFile size={16} />}
                    onClick={handleViewDocument}
                    color="dark"
                  >
                    Joriy hujjat
                  </Button>
                )}
                {workflow.status === "COMPLETED" && workflow.document?.id && (
                  <Button
                    variant="filled"
                    size="sm"
                    radius="sm"
                    fullWidth
                    leftSection={<IconDownload size={16} />}
                    onClick={handleDownloadDocument}
                    loading={downloadMutation.isLoading}
                    style={{ backgroundColor: "#1e3a5f" }}
                  >
                    Tasdiqlangan PDF
                  </Button>
                )}
              </Stack>
            </Stack>
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

          {/* Progress & Stats */}
          <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
            <Group gap="xs" mb="md">
              <IconClock size={18} color="#1e3a5f" />
              <Text size="md" fw={600} c="#212529">Ish jarayoni</Text>
            </Group>

            <Stack gap="md">
              <Box>
                <Group justify="space-between" mb={6}>
                  <Text size="xs" c="dimmed">Jarayon</Text>
                  <Text size="xs" fw={600} c="#1e3a5f">
                    {completedSteps}/{totalSteps}
                  </Text>
                </Group>
                <Progress
                  value={progress}
                  size="md"
                  radius="xl"
                  color="dark"
                  striped={workflow.status === "ACTIVE"}
                  animated={workflow.status === "ACTIVE"}
                />
                <Text size="xs" c="dimmed" mt={4}>
                  {Math.round(progress)}% bajarildi
                </Text>
              </Box>

              <Divider />

              <Box>
                <Text size="xs" c="dimmed" mb={4}>Yaratilgan</Text>
                <Text size="sm" c="#495057">{formatDateTime(workflow.createdAt)}</Text>
              </Box>

              {workflow.updatedAt && workflow.updatedAt !== workflow.createdAt && (
                <Box>
                  <Text size="xs" c="dimmed" mb={4}>Yangilangan</Text>
                  <Text size="sm" c="#495057">{formatDateTime(workflow.updatedAt)}</Text>
                </Box>
              )}

              {workflow.deadline && (
                <Box>
                  <Text size="xs" c="dimmed" mb={4}>Muddat</Text>
                  <Text
                    size="sm"
                    c={new Date(workflow.deadline) < new Date() && workflow.status !== 'COMPLETED' ? "red" : "#495057"}
                    fw={500}
                  >
                    {formatDateTime(workflow.deadline)}
                  </Text>
                  {new Date(workflow.deadline) < new Date() && workflow.status !== 'COMPLETED' && (
                    <Text size="xs" c="red" mt={4}>
                      ⚠️ Muddat o'tgan
                    </Text>
                  )}
                </Box>
              )}

              {workflow.type && (
                <Box>
                  <Text size="xs" c="dimmed" mb={4}>Turi</Text>
                  <Badge variant="outline" color="dark" size="sm">
                    {workflow.type === "CONSECUTIVE" ? "Ketma-ket" :
                      workflow.type === "PARALLEL" ? "Parallel" : workflow.type}
                  </Badge>
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
