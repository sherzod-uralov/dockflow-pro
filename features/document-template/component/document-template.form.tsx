"use client";

import { useState, useCallback } from "react";
import { useForm } from "@mantine/form";
import {
    Box,
    Text,
    TextInput,
    Textarea,
    Select,
    Switch,
    Button,
    Group,
    Stack,
    Paper,
    Badge,
    Alert,
    SimpleGrid,
} from "@mantine/core";
import {
    IconAlertCircle,
    IconTag,
    IconX,
} from "@tabler/icons-react";
import { FileUpload } from "@/components/shared/ui/custom-file-upload";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { useCreateAttachment } from "@/features/attachment/hook/attachment.hook";
import {
    DocumentTemplateResponse,
    useCreateDocumentTemplate,
    useUpdateDocumentTemplate,
} from "@/features/document-template";
import { parseWordFile, ExtractedTags } from "../utils/word-parser";
import { notifications } from "@mantine/notifications";
import { colors } from "@/lib/colors";

interface DocumentTemplateFormModalProps {
    mode: "create" | "update";
    documentTemplate?: DocumentTemplateResponse | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const DocumentTemplateFormModal = ({
    mode,
    documentTemplate,
    onClose,
    onSuccess,
}: DocumentTemplateFormModalProps) => {
    const isUpdate = mode === "update";

    // Hooks
    const createMutation = useCreateDocumentTemplate();
    const updateMutation = useUpdateDocumentTemplate();
    const { data: documentTypes, isLoading: isLoadingTypes } = useGetAllDocumentTypes();
    const { mutateAsync: uploadFile, isLoading: isUploading } = useCreateAttachment();

    // State
    const [existingFiles, setExistingFiles] = useState(
        documentTemplate?.templateFile ? [{
            id: documentTemplate.templateFile.id,
            fileName: documentTemplate.templateFile.fileName,
            fileSize: documentTemplate.templateFile.fileSize,
            fileUrl: documentTemplate.templateFile.fileUrl,
        }] : []
    );
    const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
    const [extractedTags, setExtractedTags] = useState<ExtractedTags>(
        documentTemplate?.requiredTags || {}
    );
    const [isParsingFile, setIsParsingFile] = useState(false);

    // Form
    const form = useForm({
        initialValues: {
            name: documentTemplate?.name || "",
            description: documentTemplate?.description || "",
            documentTypeId: documentTemplate?.documentType?.id || "",
            isActive: documentTemplate?.isActive ?? true,
            isPublic: documentTemplate?.isPublic ?? false,
        },
        validate: {
            name: (value) => (!value ? "Shablon nomi kiritilishi shart" : null),
            description: (value) => (!value ? "Tavsif kiritilishi shart" : null),
            documentTypeId: (value) => (!value ? "Hujjat turi tanlanishi shart" : null),
        },
    });

    // File upload handler
    const handleFileChange = useCallback(
        async (file: File | File[] | undefined) => {
            if (!file || (Array.isArray(file) && file.length === 0)) {
                setUploadedFileId(null);
                setExtractedTags({});
                return;
            }

            const singleFile = Array.isArray(file) ? file[0] : file;
            setIsParsingFile(true);

            try {
                // Parse Word file for tags
                const tags = await parseWordFile(singleFile);
                setExtractedTags(tags);

                if (Object.keys(tags).length > 0) {
                    notifications.show({
                        message: `${Object.keys(tags).length} ta tag topildi`,
                        color: "green",
                    });
                } else {
                    notifications.show({
                        message: "Faylda tag topilmadi",
                        color: "blue",
                    });
                }

                // Upload file
                const response = await uploadFile(singleFile);
                setUploadedFileId(response.id);
                setExistingFiles([]);
            } catch (error: any) {
                notifications.show({
                    message: error.message || "Faylni yuklashda xatolik",
                    color: "red",
                });
            } finally {
                setIsParsingFile(false);
            }
        },
        [uploadFile]
    );

    // Remove tag
    const handleRemoveTag = (tagName: string) => {
        const newTags = { ...extractedTags };
        delete newTags[tagName];
        setExtractedTags(newTags);
    };

    // Delete existing file
    const handleDeleteExisting = () => {
        setExistingFiles([]);
        setExtractedTags({});
    };

    // Submit
    const handleSubmit = (values: typeof form.values) => {
        const existingFile = existingFiles[0];
        const fileId = uploadedFileId || existingFile?.id;

        if (!fileId) {
            notifications.show({
                message: "Shablon fayli yuklash shart",
                color: "red",
            });
            return;
        }

        const data = {
            ...values,
            templateFileId: fileId,
            requiredTags: extractedTags,
        };

        if (isUpdate && documentTemplate) {
            updateMutation.mutate(
                { id: documentTemplate.id, data },
                {
                    onSuccess: () => {
                        onSuccess?.();
                    },
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    onSuccess?.();
                },
            });
        }
    };

    const tagCount = Object.keys(extractedTags).length;
    const hasFile = existingFiles.length > 0 || uploadedFileId;
    const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="lg">
                {/* Name */}
                <TextInput
                    label="Shablon nomi"
                    placeholder="Masalan: Mehnat shartnomasi"
                    size="md"
                    radius="sm"
                    required
                    {...form.getInputProps("name")}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                    }}
                />

                {/* Description */}
                <Textarea
                    label="Tavsif"
                    placeholder="Shablon haqida qisqacha ma'lumot"
                    size="md"
                    radius="sm"
                    rows={3}
                    required
                    {...form.getInputProps("description")}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                    }}
                />

                {/* Document Type */}
                <Select
                    label="Hujjat turi"
                    placeholder="Hujjat turini tanlang"
                    size="md"
                    radius="sm"
                    required
                    searchable
                    data={
                        documentTypes?.data?.map((t) => ({
                            value: t.id,
                            label: t.name,
                        })) || []
                    }
                    {...form.getInputProps("documentTypeId")}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                    }}
                    disabled={isLoadingTypes}
                />

                {/* Switches */}
                <SimpleGrid cols={2}>
                    <Switch
                        label="Faol"
                        description="Shablon foydalanish uchun mavjud"
                        size="md"
                        checked={form.values.isActive}
                        onChange={(e) => form.setFieldValue("isActive", e.currentTarget.checked)}
                        styles={{
                            label: { fontWeight: 500 },
                            description: { marginTop: 2 },
                        }}
                    />
                    <Switch
                        label="Ommaviy"
                        description="Barcha foydalanuvchilar ko'ra oladi"
                        size="md"
                        checked={form.values.isPublic}
                        onChange={(e) => form.setFieldValue("isPublic", e.currentTarget.checked)}
                        styles={{
                            label: { fontWeight: 500 },
                            description: { marginTop: 2 },
                        }}
                    />
                </SimpleGrid>

                {/* File Upload */}
                <Box>
                    <Text fw={500} size="sm" mb={6}>
                        Shablon fayli (Word) <Text span c="red">*</Text>
                    </Text>

                    <FileUpload
                        name="templateFile"
                        multiple={false}
                        accept={{
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                            "application/msword": [".doc"],
                        }}
                        helperText="Faqat DOCX formatdagi fayllar (max 50MB)"
                        maxSize={50 * 1024 * 1024}
                        existingFiles={existingFiles}
                        onDeleteExisting={handleDeleteExisting}
                        onChange={handleFileChange}
                    />

                    {/* Loading state */}
                    {(isParsingFile || isUploading) && (
                        <Text size="sm" c="dimmed" mt="xs">
                            {isParsingFile ? "Fayl tahlil qilinmoqda..." : "Fayl yuklanmoqda..."}
                        </Text>
                    )}
                </Box>

                {/* Extracted Tags */}
                {tagCount > 0 && (
                    <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
                        <Group gap="xs" mb="sm">
                            <IconTag size={18} color={colors.textSecondary} />
                            <Text fw={500} size="sm" c={colors.textPrimary}>
                                Topilgan taglar ({tagCount})
                            </Text>
                        </Group>
                        <Text size="xs" c="dimmed" mb="sm">
                            Bu taglar hujjat yaratishda avtomatik to'ldiriladi
                        </Text>
                        <Group gap="xs">
                            {Object.entries(extractedTags).map(([tagName, tagType]) => (
                                <Badge
                                    key={tagName}
                                    variant="light"
                                    color="blue"
                                    radius="sm"
                                    size="lg"
                                    rightSection={
                                        <IconX
                                            size={14}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleRemoveTag(tagName)}
                                        />
                                    }
                                >
                                    {`{${tagName}}`}
                                </Badge>
                            ))}
                        </Group>
                    </Paper>
                )}

                {/* Info when no tags found */}
                {hasFile && tagCount === 0 && !isParsingFile && (
                    <Alert color="yellow" icon={<IconAlertCircle size={18} />} radius="sm">
                        Faylda tag topilmadi. Taglarni {`{tagName}`} formatida yozing.
                    </Alert>
                )}

                {/* Actions */}
                <Group justify="flex-end" gap="sm" pt="md">
                    <Button variant="default" onClick={onClose} radius="sm" size="md">
                        Bekor qilish
                    </Button>
                    <Button
                        type="submit"
                        radius="sm"
                        size="md"
                        loading={isSubmitting || isUploading || isParsingFile}
                        disabled={!hasFile}
                        styles={{
                            root: {
                                backgroundColor: colors.primary,
                                "&:hover": { backgroundColor: colors.primaryHover },
                            },
                        }}
                    >
                        {isUpdate ? "Yangilash" : "Qo'shish"}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};

export default DocumentTemplateFormModal;
