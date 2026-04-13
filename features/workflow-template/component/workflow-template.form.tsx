"use client";

import { useEffect, useState, useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Text,
  Paper,
  Group,
  Button,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Stack,
  ActionIcon,
  Badge,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconInfoCircle,
  IconSearch,
  IconGripVertical,
} from "@tabler/icons-react";
import {
  workflowTemplateSchema,
  WorkflowTemplateFormType,
} from "../schema/workflow-template.schema";
import {
  WorkflowTemplateResponse,
  WorkflowTemplateType,
  WorkflowTemplateActionType,
  WORKFLOW_TEMPLATE_TYPE_OPTIONS,
  ACTION_TYPE_OPTIONS,
} from "../type/workflow-template.type";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { ModalState } from "@/types/modal";
import {
  useCreateWorkflowTemplate,
  useUpdateWorkflowTemplate,
} from "../hook/workflow-template.hook";

interface WorkflowTemplateFormProps {
  modal: ModalState;
  mode: "create" | "update";
  workflowTemplate?: WorkflowTemplateResponse;
  onSuccess?: () => void;
}

const createEmptyStep = (order: number = 0) => ({
  order,
  actionType: WorkflowTemplateActionType.APPROVAL as
    | "APPROVAL"
    | "REVIEW"
    | "SIGN"
    | "QR_CODE"
    | "ACKNOWLEDGE",
  assignedToUserId: "",
});

const WorkflowTemplateForm = ({
  modal,
  mode,
  workflowTemplate,
  onSuccess,
}: WorkflowTemplateFormProps) => {
  const createMutation = useCreateWorkflowTemplate();
  const updateMutation = useUpdateWorkflowTemplate();
  const { data: usersData, isLoading: isLoadingUsers } = useGetUserQuery();
  const { data: documentTypes } = useGetAllDocumentTypes();

  const [searchQueries, setSearchQueries] = useState<{ [key: number]: string }>({});

  const isUpdate = mode === "update";
  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  const form = useForm<WorkflowTemplateFormType>({
    resolver: zodResolver(workflowTemplateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      documentTypeId: "",
      type: WorkflowTemplateType.CONSECUTIVE as "CONSECUTIVE" | "PARALLEL",
      isActive: true,
      isPublic: true,
      steps: [createEmptyStep(0)],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  useEffect(() => {
    if (isUpdate && workflowTemplate) {
      form.reset({
        name: workflowTemplate.name,
        description: workflowTemplate.description,
        documentTypeId: workflowTemplate.documentType?.id || "",
        type: workflowTemplate.type as "CONSECUTIVE" | "PARALLEL",
        isActive: workflowTemplate.isActive,
        isPublic: workflowTemplate.isPublic,
        steps:
          workflowTemplate.steps?.map((step, index) => ({
            order: step.order ?? index,
            actionType: step.actionType as
              | "APPROVAL"
              | "REVIEW"
              | "SIGN"
              | "QR_CODE"
              | "ACKNOWLEDGE",
            assignedToUserId: step.assignedToUser?.id || "",
          })) || [createEmptyStep(0)],
      });
    } else if (!isUpdate) {
      form.reset({
        name: "",
        description: "",
        documentTypeId: "",
        type: WorkflowTemplateType.CONSECUTIVE as "CONSECUTIVE" | "PARALLEL",
        isActive: true,
        isPublic: true,
        steps: [createEmptyStep(0)],
      });
    }
  }, [workflowTemplate, isUpdate, form, modal.isOpen]);

  const handleSubmit = useCallback((values: WorkflowTemplateFormType) => {
    const steps = values.steps.map((step, index) => ({
      order: index,
      actionType: step.actionType as WorkflowTemplateActionType,
      assignedToUserId: step.assignedToUserId || undefined,
    }));

    if (isUpdate && workflowTemplate) {
      updateMutation.mutate(
        {
          id: workflowTemplate.id,
          data: {
            name: values.name,
            description: values.description,
            documentTypeId: values.documentTypeId,
            type: values.type as WorkflowTemplateType,
            isActive: values.isActive,
            isPublic: values.isPublic,
            steps,
          },
        },
        {
          onSuccess: () => {
            modal.closeModal();
            form.reset();
            onSuccess?.();
          },
        },
      );
    } else {
      createMutation.mutate(
        {
          name: values.name,
          description: values.description,
          documentTypeId: values.documentTypeId,
          type: values.type as WorkflowTemplateType,
          isActive: values.isActive,
          isPublic: values.isPublic,
          steps,
        },
        {
          onSuccess: () => {
            modal.closeModal();
            form.reset();
            onSuccess?.();
          },
        },
      );
    }
  }, [isUpdate, workflowTemplate, updateMutation, createMutation, modal, form, onSuccess]);

  const handleAddStep = useCallback(() => {
    append(createEmptyStep(fields.length));
  }, [append, fields.length]);

  const handleCancel = useCallback(() => {
    modal.closeModal();
    form.reset();
  }, [modal, form]);

  // User options with search
  const getUserOptions = (index: number) => {
    const query = (searchQueries[index] || "").toLowerCase();
    const users = usersData?.data || [];

    const filtered = query
      ? users.filter((user: any) =>
          user.fullname?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query)
        )
      : users;

    return filtered.map((user: any) => ({
      value: user.id,
      label: `${user.fullname} (@${user.username})`,
    }));
  };

  // Document type options
  const documentTypeOptions = documentTypes?.data?.map((t: any) => ({
    value: t.id,
    label: t.name,
  })) || [];

  // Workflow type options
  const workflowTypeOptions = WORKFLOW_TEMPLATE_TYPE_OPTIONS.map(o => ({
    value: o.value,
    label: o.label,
  }));

  // Action type options
  const actionTypeOptions = ACTION_TYPE_OPTIONS.map(o => ({
    value: o.value,
    label: o.label,
  }));

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* Asosiy ma'lumotlar */}
        <SimpleGrid cols={2} spacing="md">
          <TextInput
            label="Shablon nomi"
            placeholder="Shablon nomini kiriting"
            required
            size="sm"
            radius="sm"
            {...form.register("name")}
            error={form.formState.errors.name?.message}
            styles={{
              input: {
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                "&:focus": { borderColor: colors.primary },
              },
              label: { color: colors.textSecondary, fontWeight: 500, marginBottom: 4 },
            }}
            style={{ gridColumn: "span 2" }}
          />

          <Textarea
            label="Tavsif"
            placeholder="Shablon tavsifini kiriting"
            size="sm"
            radius="sm"
            rows={2}
            {...form.register("description")}
            error={form.formState.errors.description?.message}
            styles={{
              input: {
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                "&:focus": { borderColor: colors.primary },
              },
              label: { color: colors.textSecondary, fontWeight: 500, marginBottom: 4 },
            }}
            style={{ gridColumn: "span 2" }}
          />

          <Select
            label="Hujjat turi"
            placeholder="Hujjat turini tanlang"
            data={documentTypeOptions}
            value={form.watch("documentTypeId")}
            onChange={(value) => form.setValue("documentTypeId", value || "")}
            error={form.formState.errors.documentTypeId?.message}
            size="sm"
            radius="sm"
            searchable
            styles={{
              input: {
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
              },
              label: { color: colors.textSecondary, fontWeight: 500, marginBottom: 4 },
            }}
          />

          <Select
            label="Workflow turi"
            placeholder="Workflow turini tanlang"
            data={workflowTypeOptions}
            value={form.watch("type")}
            onChange={(value) => form.setValue("type", value as "CONSECUTIVE" | "PARALLEL")}
            error={form.formState.errors.type?.message}
            size="sm"
            radius="sm"
            styles={{
              input: {
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
              },
              label: { color: colors.textSecondary, fontWeight: 500, marginBottom: 4 },
            }}
          />

          <Checkbox
            label="Faol"
            checked={form.watch("isActive")}
            onChange={(e) => form.setValue("isActive", e.currentTarget.checked)}
            styles={{
              label: { color: colors.textSecondary, fontWeight: 500 },
            }}
          />

          <Checkbox
            label="Ommaviy"
            checked={form.watch("isPublic")}
            onChange={(e) => form.setValue("isPublic", e.currentTarget.checked)}
            styles={{
              label: { color: colors.textSecondary, fontWeight: 500 },
            }}
          />
        </SimpleGrid>

        {/* Info */}
        <Alert
          icon={<IconInfoCircle size={18} />}
          color="blue"
          variant="light"
          radius="sm"
        >
          <Text size="sm" c={colors.textSecondary}>
            Workflow bosqichlari ketma-ket yoki parallel bajariladi. Har bir bosqich uchun mas'ul shaxsni belgilang.
          </Text>
        </Alert>

        {/* Bosqichlar */}
        <Box>
          <Group justify="space-between" mb="sm">
            <Box>
              <Text size="md" fw={600} c={colors.textPrimary}>
                Workflow bosqichlari
              </Text>
              <Text size="sm" c="dimmed">
                Har bir bosqich uchun mas'ulni tanlang
              </Text>
            </Box>
            <Button
              variant="light"
              size="sm"
              radius="sm"
              leftSection={<IconPlus size={16} />}
              onClick={handleAddStep}
              disabled={fields.length >= 20}
              color="blue"
            >
              Bosqich qo'shish
            </Button>
          </Group>

          {form.formState.errors.steps?.root && (
            <Alert color="red" variant="light" radius="sm" mb="sm">
              {form.formState.errors.steps.root.message}
            </Alert>
          )}

          <Stack gap="sm" style={{ maxHeight: 400, overflowY: "auto" }}>
            {fields.map((field, index) => (
              <Paper
                key={field.id}
                p="md"
                radius="sm"
                withBorder
                style={{ borderColor: colors.border }}
              >
                <Group justify="space-between" mb="sm">
                  <Group gap="xs">
                    <Badge size="sm" variant="light" color="gray">
                      {index + 1}
                    </Badge>
                    <Text size="sm" fw={500} c={colors.textPrimary}>
                      Bosqich {index + 1}
                    </Text>
                  </Group>
                  {fields.length > 1 && (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </Group>

                <SimpleGrid cols={2} spacing="sm">
                  <Select
                    label="Foydalanuvchi"
                    placeholder={isLoadingUsers ? "Yuklanmoqda..." : "Foydalanuvchini tanlang"}
                    data={getUserOptions(index)}
                    value={form.watch(`steps.${index}.assignedToUserId`)}
                    onChange={(value) => form.setValue(`steps.${index}.assignedToUserId`, value || "")}
                    disabled={isLoadingUsers}
                    searchable
                    size="sm"
                    radius="sm"
                    onSearchChange={(query) => {
                      setSearchQueries(prev => ({ ...prev, [index]: query }));
                    }}
                    styles={{
                      input: {
                        backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`,
                      },
                      label: { color: colors.textSecondary, fontWeight: 500, marginBottom: 4 },
                    }}
                  />

                  <Select
                    label="Amal turi"
                    placeholder="Amal turini tanlang"
                    data={actionTypeOptions}
                    value={form.watch(`steps.${index}.actionType`)}
                    onChange={(value) => form.setValue(`steps.${index}.actionType`, value as any)}
                    size="sm"
                    radius="sm"
                    styles={{
                      input: {
                        backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`,
                      },
                      label: { color: colors.textSecondary, fontWeight: 500, marginBottom: 4 },
                    }}
                  />
                </SimpleGrid>
              </Paper>
            ))}
          </Stack>

          {fields.length === 0 && (
            <Alert color="yellow" variant="light" radius="sm">
              Kamida bitta bosqich qo'shishingiz kerak
            </Alert>
          )}
        </Box>

        {/* Actions */}
        <Group justify="flex-end" gap="xs" pt="md" style={{ borderTop: `1px solid ${colors.border}` }}>
          <Button
            variant="light"
            size="sm"
            radius="sm"
            onClick={handleCancel}
            disabled={isLoading}
            color="gray"
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            size="sm"
            radius="sm"
            loading={isLoading}
            style={{ backgroundColor: colors.primary }}
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
import { colors } from "@/lib/colors";

export default WorkflowTemplateForm;
