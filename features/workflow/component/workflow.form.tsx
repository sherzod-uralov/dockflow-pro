"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Text,
  Button,
  Select,
  Paper,
  Group,
  Stack,
  Alert,
  ActionIcon,
  ScrollArea,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IconPlus,
  IconInfoCircle,
  IconTrash,
  IconGripVertical,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import {
  workflowCreateSchema,
  workflowUpdateSchema,
  WorkflowFormType,
} from "../schema/workflow.schema";
import {
  WorkflowFormProps,
  ACTION_TYPE_OPTIONS,
  WORKFLOW_TYPE_OPTIONS,
  WorkflowActionType,
  WorkflowType,
  WorkflowStepUpdateType,
  WorkflowStatus,
} from "@/features/workflow/type/workflow.type";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useGetAllDocuments } from "@/features/document";
import {
  apiToFormData,
  formToApiPayload,
  createEmptyStep,
} from "../utils/workflow.mapper";
import { useCreateWorkflow, useUpdateWorkflowStep } from "@/features/workflow";
import { useSearchParams, useRouter } from "next/navigation";
import { showError, showSuccess } from "@/utils/show-error";

const WorkflowForm = ({
  modal,
  mode,
  workflow,
  onSuccess,
}: WorkflowFormProps) => {
  const createWorkflowMutation = useCreateWorkflow();
  const updateStepMutation = useUpdateWorkflowStep();
  const { data: usersData, isLoading: isLoadingUsers } = useGetUserQuery({
      pageNumber:1,
      pageSize:1000
  });
  const { data: documentsData } = useGetAllDocuments({
    status: WorkflowStatus.DRAFT,
      pageNumber:1,
      pageSize:1000
  });
  const [searchQueries, setSearchQueries] = useState<{ [key: number]: string }>(
    {}
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryDocumentId = searchParams.get("documentId");

  const isUpdate = mode === "edit";
  const isLoading =
    createWorkflowMutation.isLoading || updateStepMutation.isLoading;

  const validationSchema = useMemo(
    () => (isUpdate ? workflowUpdateSchema : workflowCreateSchema),
    [isUpdate]
  );

  const form = useForm<WorkflowFormType>({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      documentId: "",
      workflowType: WorkflowType.CONSECUTIVE,
      steps: [createEmptyStep()],
      deadline: undefined,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const handleMoveUp = useCallback((index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  }, [move]);

  const handleMoveDown = useCallback((index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  }, [move, fields.length]);

  useEffect(() => {
    if (isUpdate && workflow) {
      const formData = apiToFormData(workflow);
      form.reset(formData);
    } else if (!isUpdate) {
      form.reset({
        documentId: "",
        workflowType: WorkflowType.CONSECUTIVE,
        steps: [createEmptyStep()],
        deadline: undefined,
      });
    }
  }, [workflow, isUpdate, form, modal.isOpen]);

  useEffect(() => {
    if (!isUpdate && queryDocumentId && documentsData) {
      const exists = documentsData.data.some(
        (d: any) => d.id === queryDocumentId
      );

      if (exists) {
        form.setValue("documentId", queryDocumentId);
      }
    }
  }, [queryDocumentId, documentsData, isUpdate, form]);

  const handleSubmit = (values: WorkflowFormType) => {
    if (isUpdate && workflow) {
      const stepsToUpdate = values.steps.filter((step) => step.id);

      if (stepsToUpdate.length === 0) {
        return;
      }

      const promises = stepsToUpdate.map((step, index) => {
        const payload: WorkflowStepUpdateType = {
          order: index + 1,
          actionType: step.actionType as WorkflowActionType,
          assignedToUserId: step.assignedToUserId,
          dueDate: step.dueDate || null,
        };

        return updateStepMutation.mutateAsync(
          {
            id: step.id!,
            data: payload,
          },
        );
      });

      Promise.all(promises)
        .then(() => {
          modal.closeModal();
          form.reset();
          showSuccess("Hujjat aylanmasi yangilandi");
          onSuccess?.();
        })
        .catch((error) => {
          showError(error);
        });
    } else {
      const payload = formToApiPayload(values, isUpdate);

      createWorkflowMutation.mutate(payload, {
        onSuccess: () => {
          modal.closeModal();
          form.reset();
          onSuccess?.();

          // Redirect to PDF editor for QR code placement
          if (payload.documentId) {
            router.push(`/pdf/${payload.documentId}?actionType=QR_CODE&showTips=true`);
          }
        },
      });
    }
  };

  const handleAddStep = useCallback(() => {
    append(createEmptyStep());
  }, [append]);

  const handleCancel = useCallback(() => {
    modal.closeModal();
    form.reset();
  }, [modal, form]);

  const documentOptions =
    documentsData?.data.map((doc: any) => ({
      value: doc.id,
      label: `${doc.title} - ${doc.documentNumber}`,
    })) || [];

  const workflowTypeOptions = WORKFLOW_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const actionTypeOptions = ACTION_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap="md">
        <Group grow>
          <Select
            label="Hujjat"
            placeholder="Hujjatni tanlang"
            data={documentOptions}
            value={form.watch("documentId")}
            onChange={(value) =>
              form.setValue("documentId", value || "", { shouldValidate: true })
            }
            disabled={isUpdate}
            error={form.formState.errors.documentId?.message}
            searchable
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
              label: {
                color: "#495057",
                fontWeight: 500,
                marginBottom: 4,
              },
            }}
          />

          <Select
            label="Aylanma turi"
            placeholder="Aylanma turini tanlang"
            data={workflowTypeOptions}
            value={form.watch("workflowType")}
            onChange={(value) =>
              form.setValue("workflowType", (value as WorkflowType) || WorkflowType.CONSECUTIVE, {
                shouldValidate: true,
              })
            }
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
              label: {
                color: "#495057",
                fontWeight: 500,
                marginBottom: 4,
              },
            }}
          />

          <DateTimePicker
            label="Muddat"
            placeholder="Sanani tanlang"
            value={form.watch("deadline") ? new Date(form.watch("deadline")!) : null}
            onChange={(date) => form.setValue("deadline", date ? new Date(date).toISOString() : undefined)}
            minDate={new Date()}
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
              label: {
                color: "#495057",
                fontWeight: 500,
                marginBottom: 4,
              },
            }}
          />
        </Group>

        {/* Info Alert */}
        <Alert
          icon={<IconInfoCircle size={18} />}
          radius="sm"
          styles={{
            root: {
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
            },
            message: {
              color: "#495057",
            },
          }}
        >
          {isUpdate ? (
            <>
              <Text size="sm" fw={500} c="#212529">
                Tahrirlash rejimi:
              </Text>
              <Text size="sm" c="#495057">
                Siz yangi bosqichlar qo'shishingiz yoki mavjudlarini
                o'chirishingiz mumkin. Hujjatni o'zgartirish mumkin emas.
              </Text>
            </>
          ) : (
            <Text size="sm" c="#495057">
              Hujjat aylanmasi bosqichlari ketma-ket bajariladi. Har bir bosqich
              uchun mas'ul shaxs va amal turini belgilang.
            </Text>
          )}
        </Alert>

        {/* Steps Section */}
        <Box>
          <Group justify="space-between" mb="sm">
            <Box>
              <Text size="md" fw={600} c="#212529">
                Aylanma bosqichlari
              </Text>
              <Text size="sm" c="dimmed">
                {isUpdate
                  ? "Bosqichlarni tahrirlang, qo'shing yoki o'chiring"
                  : "Har bir bosqich uchun mas'ul shaxsni tanlang"}
              </Text>
            </Box>
            <Button
              size="xs"
              radius="sm"
              leftSection={<IconPlus size={14} />}
              onClick={handleAddStep}
              disabled={fields.length >= 20}
              style={{ backgroundColor: "#1e3a5f" }}
            >
              Bosqich qo'shish
            </Button>
          </Group>

          {form.formState.errors.steps?.root && (
            <Alert color="red" radius="sm" mb="sm">
              {form.formState.errors.steps.root.message}
            </Alert>
          )}

          <ScrollArea h={300} type="auto" scrollbarSize={6}>
            <Stack gap="sm">
              {fields.map((field, index) => {
                const allSteps = form.watch("steps") || [];
                const selectedUserIds = allSteps
                  .map((step, idx) =>
                    idx !== index ? step?.assignedToUserId : null
                  )
                  .filter(Boolean) as string[];
                const availableUsers =
                  usersData?.data.filter(
                    (user: any) => !selectedUserIds.includes(user.id)
                  ) || [];

                const userOptions = availableUsers.map((user: any) => ({
                  value: user.id,
                  label: `${user.fullname} (@${user.username})`,
                }));

                const previousStepDate = index > 0 ? allSteps[index - 1]?.dueDate : null;
                const minDate = previousStepDate ? new Date(previousStepDate) : new Date();

                return (
                  <Paper
                    key={field.id}
                    p="md"
                    radius="sm"
                    withBorder
                    style={{ borderColor: "#e9ecef" }}
                  >
                    <Group justify="space-between" mb="sm">
                      <Group gap="xs">
                        <IconGripVertical size={16} color="#adb5bd" style={{ cursor: "grab" }} />
                        <Text size="sm" fw={600} c="#212529">
                          Bosqich {index + 1}
                        </Text>
                      </Group>
                      <Group gap={4}>
                        {/* Move Up */}
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          title="Yuqoriga ko'chirish"
                        >
                          <IconArrowUp size={16} />
                        </ActionIcon>
                        {/* Move Down */}
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === fields.length - 1}
                          title="Pastga ko'chirish"
                        >
                          <IconArrowDown size={16} />
                        </ActionIcon>
                        {/* Delete */}
                        {fields.length > 1 && (
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => remove(index)}
                            title="O'chirish"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>

                    <Group grow>
                      <Select
                        label="Mas'ul shaxs"
                        placeholder="Foydalanuvchini tanlang"
                        data={userOptions}
                        value={form.watch(`steps.${index}.assignedToUserId`)}
                        onChange={(value) =>
                          form.setValue(
                            `steps.${index}.assignedToUserId`,
                            value || "",
                            { shouldValidate: true }
                          )
                        }
                        disabled={isLoadingUsers}
                        searchable
                        size="sm"
                        radius="sm"
                        error={
                          form.formState.errors.steps?.[index]?.assignedToUserId
                            ?.message
                        }
                        styles={{
                          input: {
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            "&:focus": {
                              borderColor: "#1e3a5f",
                            },
                          },
                          label: {
                            color: "#495057",
                            fontWeight: 500,
                            marginBottom: 4,
                          },
                        }}
                      />

                      <Select
                        label="Amal turi"
                        placeholder="Amal turini tanlang"
                        data={actionTypeOptions}
                        value={form.watch(`steps.${index}.actionType`)}
                        onChange={(value) =>
                          form.setValue(
                            `steps.${index}.actionType`,
                            (value as WorkflowActionType) || "",
                            { shouldValidate: true }
                          )
                        }
                        size="sm"
                        radius="sm"
                        error={
                          form.formState.errors.steps?.[index]?.actionType
                            ?.message
                        }
                        styles={{
                          input: {
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            "&:focus": {
                              borderColor: "#1e3a5f",
                            },
                          },
                          label: {
                            color: "#495057",
                            fontWeight: 500,
                            marginBottom: 4,
                          },
                        }}
                      />

                      <DateTimePicker
                        label="Muddat"
                        placeholder="Sanani tanlang"
                        value={form.watch(`steps.${index}.dueDate`) ? new Date(form.watch(`steps.${index}.dueDate`)!) : null}
                        onChange={(date) => form.setValue(
                          `steps.${index}.dueDate`,
                          date ? new Date(date).toISOString() : undefined
                        )}
                        minDate={minDate}
                        size="sm"
                        radius="sm"
                        clearable
                        styles={{
                          input: {
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            "&:focus": {
                              borderColor: "#1e3a5f",
                            },
                          },
                          label: {
                            color: "#495057",
                            fontWeight: 500,
                            marginBottom: 4,
                          },
                        }}
                      />
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </ScrollArea>

          {fields.length === 0 && (
            <Alert color="yellow" radius="sm" mt="sm">
              Kamida bitta bosqich qo'shishingiz kerak
            </Alert>
          )}
        </Box>

        {/* Actions */}
        <Group
          justify="flex-end"
          gap="xs"
          pt="md"
          style={{ borderTop: "1px solid #e9ecef" }}
        >
          <Button
            variant="outline"
            size="sm"
            radius="sm"
            onClick={handleCancel}
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
            type="submit"
            size="sm"
            radius="sm"
            loading={isLoading}
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {isLoading
              ? isUpdate
                ? "Yangilanmoqda..."
                : "Yaratilmoqda..."
              : isUpdate
                ? "Yangilash"
                : "Yaratish"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default WorkflowForm;
