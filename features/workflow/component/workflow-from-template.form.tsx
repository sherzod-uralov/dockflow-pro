"use client";

import { useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stack, Select, Button, Group, Text } from "@mantine/core";
import { ModalState } from "@/types/modal";
import { useGetAllDocuments } from "@/features/document";
import { useGetAllWorkflowTemplates } from "@/features/workflow-template";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { useCreateWorkflowFromTemplate } from "../hook/workflow.hook";
import { colors } from "@/lib/colors";

const workflowFromTemplateSchema = z.object({
  documentTypeId: z.string().min(1, "Hujjat turini tanlang"),
  documentId: z.string().min(1, "Hujjatni tanlang"),
  workflowTemplateId: z.string().min(1, "Aylanma shablonini tanlang"),
});

type WorkflowFromTemplateFormType = z.infer<typeof workflowFromTemplateSchema>;

interface WorkflowFromTemplateFormProps {
  modal: ModalState;
  onSuccess?: () => void;
}

const WorkflowFromTemplateForm = ({
  modal,
  onSuccess,
}: WorkflowFromTemplateFormProps) => {
  const createMutation = useCreateWorkflowFromTemplate();
  const { data: documentTypesData, isLoading: isLoadingDocumentTypes } =
    useGetAllDocumentTypes();

  const form = useForm<WorkflowFromTemplateFormType>({
    resolver: zodResolver(workflowFromTemplateSchema),
    defaultValues: {
      documentTypeId: "",
      documentId: "",
      workflowTemplateId: "",
    },
  });

  const selectedDocumentTypeId = useWatch({
    control: form.control,
    name: "documentTypeId",
  });

  const { data: documentsData, isLoading: isLoadingDocuments } =
    useGetAllDocuments({
      documentTypeId: selectedDocumentTypeId || undefined,
    });

  const { data: templatesData, isLoading: isLoadingTemplates } =
    useGetAllWorkflowTemplates({
      isActive: true,
      documentTypeId: selectedDocumentTypeId || undefined,
    });

  useEffect(() => {
    if (selectedDocumentTypeId) {
      form.setValue("documentId", "");
      form.setValue("workflowTemplateId", "");
    }
  }, [selectedDocumentTypeId, form]);

  const handleSubmit = (values: WorkflowFromTemplateFormType) => {
    createMutation.mutate(
      {
        documentId: values.documentId,
        workflowTemplateId: values.workflowTemplateId,
      },
      {
        onSuccess: () => {
          modal.closeModal();
          form.reset();
          onSuccess?.();
        },
      }
    );
  };

  const handleCancel = useCallback(() => {
    modal.closeModal();
    form.reset();
  }, [modal, form]);

  const documentTypeOptions =
    documentTypesData?.data?.map((type: any) => ({
      value: type.id,
      label: type.name,
    })) || [];

  const documentOptions =
    documentsData?.data?.map((doc: any) => ({
      value: doc.id,
      label: `${doc.title} - ${doc.documentNumber}`,
    })) || [];

  const templateOptions =
    templatesData?.data?.map((template: any) => ({
      value: template.id,
      label: template.name,
      description: `${template.steps?.length || 0} ta bosqich`,
    })) || [];

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap="md">
        <Select
          label="Hujjat turi"
          placeholder={isLoadingDocumentTypes ? "Yuklanmoqda..." : "Hujjat turini tanlang"}
          data={documentTypeOptions}
          value={form.watch("documentTypeId")}
          onChange={(value) =>
            form.setValue("documentTypeId", value || "", { shouldValidate: true })
          }
          disabled={isLoadingDocumentTypes}
          error={form.formState.errors.documentTypeId?.message}
          size="sm"
          radius="sm"
          styles={{
            input: {
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              "&:focus": {
                borderColor: colors.primary,
              },
            },
            label: {
              color: colors.textSecondary,
              fontWeight: 500,
              marginBottom: 4,
            },
          }}
        />

        <Select
          label="Hujjat"
          placeholder={
            !selectedDocumentTypeId
              ? "Avval hujjat turini tanlang"
              : isLoadingDocuments
              ? "Yuklanmoqda..."
              : "Hujjatni tanlang"
          }
          data={documentOptions}
          value={form.watch("documentId")}
          onChange={(value) =>
            form.setValue("documentId", value || "", { shouldValidate: true })
          }
          disabled={isLoadingDocuments || !selectedDocumentTypeId}
          error={form.formState.errors.documentId?.message}
          searchable
          size="sm"
          radius="sm"
          styles={{
            input: {
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              "&:focus": {
                borderColor: colors.primary,
              },
            },
            label: {
              color: colors.textSecondary,
              fontWeight: 500,
              marginBottom: 4,
            },
          }}
        />

        <Select
          label="Aylanma shabloni"
          placeholder={
            !selectedDocumentTypeId
              ? "Avval hujjat turini tanlang"
              : isLoadingTemplates
              ? "Yuklanmoqda..."
              : "Shablonni tanlang"
          }
          data={templateOptions}
          value={form.watch("workflowTemplateId")}
          onChange={(value) =>
            form.setValue("workflowTemplateId", value || "", {
              shouldValidate: true,
            })
          }
          disabled={isLoadingTemplates || !selectedDocumentTypeId}
          error={form.formState.errors.workflowTemplateId?.message}
          size="sm"
          radius="sm"
          styles={{
            input: {
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              "&:focus": {
                borderColor: colors.primary,
              },
            },
            label: {
              color: colors.textSecondary,
              fontWeight: 500,
              marginBottom: 4,
            },
          }}
        />

        <Group
          justify="flex-end"
          gap="xs"
          pt="md"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <Button
            variant="outline"
            size="sm"
            radius="sm"
            onClick={handleCancel}
            disabled={createMutation.isLoading}
            styles={{
              root: {
                borderColor: colors.border,
                color: colors.textSecondary,
                "&:hover": {
                  backgroundColor: colors.bg,
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
            loading={createMutation.isLoading}
            style={{ backgroundColor: colors.primary }}
          >
            {createMutation.isLoading ? "Yaratilmoqda..." : "Yaratish"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default WorkflowFromTemplateForm;
