"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
  Container,
  Title,
} from "@mantine/core";
import { IconTag, IconArrowLeft, IconSend } from "@tabler/icons-react";
import { FileUpload } from "@/components/shared/ui/custom-file-upload";
import {
  DocumentFormType,
  documentScheme,
} from "@/features/document/schema/document.schema";
import { useCreateDocument } from "@/features/document";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { useGetAllJournals } from "@/features/journal/hook/journal.hook";
import {
  useGetAllDocumentTemplates,
  useGetDocumentTemplateById,
  RequiredTags,
} from "@/features/document-template";
import { useCreateAttachment } from "@/features/attachment/hook/attachment.hook";
import { notifications } from "@mantine/notifications";

export default function SendDocumentPage() {
  const router = useRouter();
  const createMutation = useCreateDocument();
  const { data: documentTypes } = useGetAllDocumentTypes();
  const { data: journals } = useGetAllJournals({
    pageNumber: 1,
    pageSize: 1000,
  });
  const { data: templates, isLoading: isLoadingTemplates } = useGetAllDocumentTemplates();
  const { mutateAsync: uploadFile, isLoading: isUploading } = useCreateAttachment();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [tagValues, setTagValues] = useState<Record<string, string>>({});

  const { data: selectedTemplate, isLoading: isLoadingTemplate } =
    useGetDocumentTemplateById(selectedTemplateId);

  const form = useForm<DocumentFormType>({
    resolver: zodResolver(documentScheme),
    defaultValues: {
      title: "",
      description: "",
      documentNumber: "",
      priority: "LOW",
      documentTypeId: "",
      journalId: "",
      templateId: "",
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

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    try {
      const response = await uploadFile(file);
      const current = form.getValues("attachments") || [];
      form.setValue("attachments", [...current, response.id], {
        shouldValidate: true,
      });
    } catch (error: any) {
      notifications.show({
        message: error.message || "Fayl yuklashda xatolik",
        color: "red",
      });
    }
  }, [uploadFile, form]);

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
    const data = {
      ...values,
      templateId: selectedTemplateId || undefined,
      tags: Object.keys(tagValues).length > 0 ? tagValues : undefined,
      attachments: values.attachments || [],
    };

    // @ts-ignore
    createMutation.mutate(data, {
      onSuccess: (response: any) => {
          console.log(response);
        const documentId = response?.data?.id || response?.id;
        if (documentId) {
          router.push(`/dashboard/document/${documentId}`);
        } else {
          router.push("/dashboard/document");
        }
      },
    });
  };

  const requiredTags = selectedTemplate?.requiredTags as RequiredTags | undefined;
  const hasRequiredTags = requiredTags && Object.keys(requiredTags).length > 0;

  const priorityOptions = [
    { value: "LOW", label: "Past" },
    { value: "MEDIUM", label: "O'rta" },
    { value: "HIGH", label: "Yuqori" },
  ];

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

  // @ts-ignore
    return (
      <Paper radius="md" p="xl" withBorder style={{ borderColor: "#e9ecef" }}>
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <Group gap="md">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => router.back()}
              styles={{
                root: {
                  "&:hover": {
                    backgroundColor: "#f8f9fa",
                  },
                },
              }}
            >
              Orqaga
            </Button>
            <Title order={3} c="#212529">
              Yangi hujjat yuborish
            </Title>
          </Group>
        </Group>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Stack gap="md">
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
              {/* Document Number */}
              <TextInput
                label="Hujjat raqami"
                placeholder="DOC-001"
                size="sm"
                radius="sm"
                error={form.formState.errors.documentNumber?.message}
                {...form.register("documentNumber")}
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
                label="Muhimlik darajasi"
                placeholder="Tanlang"
                size="sm"
                radius="sm"
                data={priorityOptions}
                value={form.watch("priority")}
                //@ts-ignore
                onChange={(value) => form.setValue("priority", value || "LOW", { shouldValidate: true })}
                error={form.formState.errors.priority?.message}
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

                {/* Document Type */}
              <Select
                label="Hujjat turi"
                placeholder="Tanlang"
                size="sm"
                radius="sm"
                data={documentTypeOptions}
                value={form.watch("documentTypeId")}
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

              {/* Journal */}
              <Select
                label="Jurnal"
                placeholder="Tanlang"
                size="sm"
                radius="sm"
                data={journalOptions}
                value={form.watch("journalId")}
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
            </SimpleGrid>

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
                  Fayllar
                </Text>
                <FileUpload
                  name="attachments"
                  multiple={true}
                  existingFiles={[]}
                  onDeleteExisting={handleDeleteFile}
                  onChange={async (files) => {
                    if (!files) return;
                    if (Array.isArray(files)) {
                      for (const file of files) {
                        await handleFileUpload(file);
                      }
                    } else {
                      await handleFileUpload(files);
                    }
                  }}
                />
              </Box>
            )}

            {/* Actions */}
            <Group justify="flex-end" gap="xs" pt="md" style={{ borderTop: "1px solid #e9ecef" }}>
              <Button
                variant="outline"
                size="sm"
                radius="sm"
                onClick={() => router.back()}
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
                leftSection={<IconSend size={16} />}
                loading={
                  form.formState.isSubmitting ||
                  isUploading ||
                  createMutation.isLoading
                }
                style={{ backgroundColor: "#1e3a5f" }}
              >
                {form.formState.isSubmitting || createMutation.isLoading
                  ? "Yuborilmoqda..."
                  : "Yuborish"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
  );
}
