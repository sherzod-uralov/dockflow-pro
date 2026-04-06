"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalState } from "@/types/modal";
import {
  Box,
  Button,
  TextInput,
  Textarea,
  Select,
  Paper,
  Text,
  Group,
  Stack,
  SimpleGrid,
  Loader,
} from "@mantine/core";
import { IconTag, IconLoader2 } from "@tabler/icons-react";
import { FileUpload } from "@/components/shared/ui/custom-file-upload";
import {
  DocumentFormType,
  documentScheme,
} from "@/features/document/schema/document.schema";
import {
  DocumentGetResponse,
  useCreateDocument,
  useUpdateDocument,
} from "@/features/document";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { useGetAllJournals } from "@/features/journal/hook/journal.hook";
import {
  useGetAllDocumentTemplates,
  useGetDocumentTemplateById,
  RequiredTags,
} from "@/features/document-template";
import { useCreateAttachment } from "@/features/attachment/hook/attachment.hook";
import { notifications } from "@mantine/notifications";

interface DocumentFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  document?: DocumentGetResponse;
  onSuccess?: () => void;
}

const DocumentFormModal = ({
  modal,
  mode,
  document,
  onSuccess,
}: DocumentFormModalProps) => {
  const createMutation = useCreateDocument();
  const updateMutation = useUpdateDocument();
  const { data: documentTypes } = useGetAllDocumentTypes();
  const { data: journals } = useGetAllJournals({
    pageNumber: 1,
    pageSize: 1000,
  });
  const { data: templates, isLoading: isLoadingTemplates } = useGetAllDocumentTemplates();

  const { mutateAsync: uploadFile, isLoading: isUploading } = useCreateAttachment();

  const [existingFiles, setExistingFiles] = useState(
    document?.attachments || []
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    document?.template?.id || ""
  );
  const [tagValues, setTagValues] = useState<Record<string, string>>(
    document?.tags || {}
  );

  // Track mapping between local File objects and backend IDs
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; id: string }[]>([]);

  const { data: selectedTemplate, isLoading: isLoadingTemplate } =
    useGetDocumentTemplateById(selectedTemplateId);

  const isUpdate = mode === "update";

  const form = useForm<DocumentFormType>({
    resolver: zodResolver(documentScheme),
    defaultValues: isUpdate
      ? {
        title: document?.title ?? "",
        description: document?.description ?? "",
        documentTypeId: document?.documentType?.id ?? "",
        journalId: document?.journal?.id ?? "",
        templateId: document?.template?.id ?? "",
        tags: document?.tags ?? {},
        attachments: document?.attachments?.map((a) => a.id) ?? [],
      }
      : {
        title: "",
        description: "",
        documentTypeId: undefined,
        journalId: undefined,
        templateId: undefined,
        tags: {},
        attachments: [],
      },
    mode: "onChange",
  });

  useEffect(() => {
    if (selectedTemplate?.requiredTags) {
      const requiredTags = selectedTemplate.requiredTags as RequiredTags;
      const initialTags: Record<string, string> = {};

      Object.keys(requiredTags).forEach((tagName) => {
        initialTags[tagName] = tagValues[tagName] || "";
      });

      setTagValues(initialTags);
      form.setValue("tags", initialTags);
    }
  }, [selectedTemplate]);

  const handleDeleteFile = useCallback((fileId: string) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    const current = form.getValues("attachments") || [];
    form.setValue(
      "attachments",
      current.filter((id: string) => id !== fileId),
      { shouldValidate: true }
    );
    notifications.show({
      message: "Fayl o'chirildi",
      color: "green",
    });
  }, [form]);



  const handleTemplateChange = useCallback((templateId: string | null) => {
    const value = templateId || "";
    setSelectedTemplateId(value);
    form.setValue("templateId", value, { shouldValidate: true });

    if (!value) {
      setTagValues({});
      form.setValue("tags", {});
    }
  }, [form]);

  const handleTagChange = useCallback((tagName: string, value: string) => {
    setTagValues((prev) => {
      const newTags = { ...prev, [tagName]: value };
      form.setValue("tags", newTags, { shouldValidate: true });
      return newTags;
    });
  }, [form]);

  const handleSubmit = (values: DocumentFormType) => {
    // Custom validation: If no template is selected, attachments are required
    if (!selectedTemplateId && (!values.attachments || values.attachments.length === 0)) {
      form.setError("attachments", {
        type: "manual",
        message: "Kamida bitta fayl yuklanishi kerak",
      });
      return;
    }

    const data = {
      ...values,
      templateId: selectedTemplateId || undefined,
      tags: Object.keys(tagValues).length > 0 ? tagValues : undefined,
      attachments: values.attachments || [],
    };

    if (isUpdate && document) {
      updateMutation.mutate(
        { id: document.id || "", data },
        {
          onSuccess: () => {
            modal.closeModal();
            onSuccess?.();
          },
        }
      );
    } else {
      // @ts-ignore
      createMutation.mutate(data, {
        onSuccess: () => {
          modal.closeModal();
          onSuccess?.();
        },
      });
    }
  };

  const requiredTags = selectedTemplate?.requiredTags as RequiredTags | undefined;
  const hasRequiredTags = requiredTags && Object.keys(requiredTags).length > 0;

  const areTagsValid = !hasRequiredTags || Object.keys(requiredTags).every((key) => tagValues[key] && tagValues[key].trim() !== "");

  const documentTypeOptions = documentTypes?.data?.map((t) => ({
    value: t.id,
    label: t.name,
  })) || [];

  const journalOptions = journals?.data?.map((j) => ({
    value: j.id,
    label: j.name,
  })) || [];

  const templateOptions = [
    { value: "", label: "Shablonsiz" },
    ...(templates?.data?.map((t) => ({
      value: t.id,
      label: t.name,
    })) || []),
  ];

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap="md">

        {/* Document Type */}
        <Select
          label="Hujjat turi"
          placeholder="Tanlang"
          size="sm"
          radius="sm"
          data={documentTypeOptions}
          value={form.watch("documentTypeId") || ""}
          onChange={(value) => form.setValue("documentTypeId", value || "", { shouldValidate: true })}
          error={form.formState.errors.documentTypeId?.message}
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
        {/* Title */}
        <TextInput
          label="Hujjat nomi"
          placeholder="Hujjat nomini kiriting"
          size="sm"
          radius="sm"
          error={form.formState.errors.title?.message}
          {...form.register("title")}
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

        {/* Description */}
        <Textarea
          label="Hujjat tavsifi"
          placeholder="Hujjat tavsifini kiriting"
          size="sm"
          radius="sm"
          minRows={3}
          error={form.formState.errors.description?.message}
          {...form.register("description")}
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


        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {/* Journal */}
          <Select
            label="Jurnal"
            placeholder="Tanlang"
            size="sm"
            radius="sm"
            data={journalOptions}
            value={form.watch("journalId") || ""}
            onChange={(value) => form.setValue("journalId", value || "", { shouldValidate: true })}
            error={form.formState.errors.journalId?.message}
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

          {/* Template Selection */}
          <Select
            label="Shablon"
            placeholder={isLoadingTemplates ? "Yuklanmoqda..." : "Shablon tanlang (ixtiyoriy)"}
            size="sm"
            radius="sm"
            data={templateOptions}
            value={selectedTemplateId || ""}
            onChange={handleTemplateChange}
            disabled={isLoadingTemplates}
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
        </SimpleGrid>

        {/* Dynamic Tag Fields */}
        {isLoadingTemplate && selectedTemplateId && (
          <Group gap="xs" c="dimmed">
            <Loader size="xs" color="#1e3a5f" />
            <Text size="sm">Shablon yuklanmoqda...</Text>
          </Group>
        )}

        {hasRequiredTags && (
          <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
            <Group gap="xs" mb="md">
              <IconTag size={16} color="#1e3a5f" />
              <Text size="sm" fw={600} c="#212529">
                Shablon maydonlari
              </Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {Object.entries(requiredTags).map(([tagName]) => (
                <TextInput
                  key={tagName}
                  label={tagName.replace(/([A-Z])/g, " $1").trim()}
                  placeholder={`${tagName} kiriting`}
                  size="sm"
                  radius="sm"
                  value={tagValues[tagName] || ""}
                  onChange={(e) => handleTagChange(tagName, e.target.value)}
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
                      textTransform: "capitalize",
                    },
                  }}
                />
              ))}
            </SimpleGrid>
          </Paper>
        )}

        {/* File Upload - only show when no template selected */}
        {!selectedTemplateId && (
          <Box>
            <Text size="sm" fw={500} c="#495057" mb={4}>
              Fayllar <span style={{ color: "var(--mantine-color-error)" }}>*</span>
            </Text>
            <FileUpload
              name="attachments"
              multiple={true}
              accept={{
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                "application/msword": [".doc"],
              }}
              helperText="Faqat DOCX formatdagi fayllar (max 50MB)"
              existingFiles={existingFiles.map((f) => ({
                ...f,
                fileSize: f.fileSize || 0,
              }))}
              onDeleteExisting={handleDeleteFile}
              onChange={async (files) => {
                if (!files) {
                  // If files is undefined/null (cleared), clear everything
                  setUploadedFiles([]);
                  form.setValue("attachments", [], { shouldValidate: true });
                  return;
                }

                const currentFiles = Array.isArray(files) ? files : [files];


                const removedFiles = uploadedFiles.filter(
                  (uploaded) => !currentFiles.some((current) => current === uploaded.file)
                );


                const newFiles = currentFiles.filter(
                  (current) => !uploadedFiles.some((uploaded) => uploaded.file === current)
                );


                let updatedUploadedFiles = uploadedFiles.filter(
                  (uploaded) => !removedFiles.includes(uploaded)
                );


                for (const file of newFiles) {
                  try {
                    const response = await uploadFile(file);
                    updatedUploadedFiles.push({ file, id: response.id });
                  } catch (error: any) {
                    notifications.show({
                      message: error.message || "Fayl yuklashda xatolik",
                      color: "red",
                    });
                  }
                }

                // Update state
                setUploadedFiles(updatedUploadedFiles);
                form.setValue(
                  "attachments",
                  updatedUploadedFiles.map((u) => u.id),
                  { shouldValidate: true }
                );
              }}
            />
            {form.formState.errors.attachments && (
              <Text c="red" size="xs" mt={4}>
                {form.formState.errors.attachments.message}
              </Text>
            )}
          </Box>
        )}

        {/* Actions */}
        <Group justify="flex-end" gap="xs" pt="md" style={{ borderTop: "1px solid #e9ecef" }}>
          <Button
            variant="outline"
            size="sm"
            radius="sm"
            onClick={modal.closeModal}
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
            disabled={!form.formState.isValid || !areTagsValid}
            loading={
              form.formState.isSubmitting ||
              isUploading ||
              createMutation.isLoading ||
              updateMutation.isLoading
            }
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {form.formState.isSubmitting ||
              createMutation.isLoading ||
              updateMutation.isLoading
              ? isUpdate
                ? "Yangilanmoqda..."
                : "Qo'shilmoqda..."
              : isUpdate
                ? "Yangilash"
                : "Qo'shish"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default DocumentFormModal;
