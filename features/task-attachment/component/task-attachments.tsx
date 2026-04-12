"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Stack,
  Group,
  Text,
  Paper,
  ActionIcon,
  Badge,
  Loader,
  ThemeIcon,
  Button,
} from "@mantine/core";
import {
  IconUpload,
  IconFile,
  IconFileText,
  IconPhoto,
  IconDownload,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { notifications } from "@mantine/notifications";
import {
  useGetAllTaskAttachments,
  useCreateTaskAttachment,
  useDeleteTaskAttachment,
} from "../hook/task-attachment.hook";
import { useCreateAttachment } from "@/features/attachment/hook/attachment.hook";
import { TaskAttachmentGetResponse } from "../type/task-attachment.type";
import {
  GuardedActionIcon,
  usePermissionCheck,
} from "@/components/shared/permission";
import { colors } from "@/lib/colors";

interface TaskAttachmentsProps {
  taskId: string;
}

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (mimeType?: string, fileName?: string) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (mimeType?.startsWith("image/") || ["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
    return <IconPhoto size={20} color={colors.successDark} />;
  }
  if (mimeType === "application/pdf" || ext === "pdf") {
    return <IconFileText size={20} color={colors.errorDark} />;
  }
  if (
    mimeType?.includes("word") ||
    ["doc", "docx"].includes(ext || "")
  ) {
    return <IconFileText size={20} color={colors.primary} />;
  }
  return <IconFile size={20} color={colors.textDimmed} />;
};

const AttachmentItem = ({
  attachment,
  onDelete,
}: {
  attachment: TaskAttachmentGetResponse;
  onDelete: (id: string) => void;
}) => {
  const file = attachment.attachment;
  const isImage = file?.mimeType?.startsWith("image/");

  return (
    <Paper p="xs" radius="sm" style={{ backgroundColor: colors.bg }}>
      <Group gap="sm" wrap="nowrap">
        {/* Preview */}
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: 4,
            backgroundColor: colors.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {isImage && file?.url ? (
            <img
              src={file.url}
              alt={file.fileName}
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
              }}
            />
          ) : (
            getFileIcon(file?.mimeType, file?.fileName)
          )}
        </Box>

        {/* Info */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} c={colors.textPrimary} lineClamp={1}>
            {file?.fileName || "Noma'lum fayl"}
          </Text>
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              {formatBytes(file?.fileSize)}
            </Text>
            {attachment.description && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                • {attachment.description}
              </Text>
            )}
          </Group>
          <Text size="xs" c="dimmed">
            {attachment.uploadedBy?.fullname}
          </Text>
        </Box>

        {/* Actions */}
        <Group gap={4}>
          {file?.url && (
            <ActionIcon
              variant="subtle"
              size="sm"
              color="gray"
              component="a"
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconDownload size={16} />
            </ActionIcon>
          )}
          <GuardedActionIcon
            permission="task-attachment:delete"
            label="O'chirish"
            variant="subtle"
            size="sm"
            color="red"
            onClick={() => onDelete(attachment.id)}
          >
            <IconTrash size={16} />
          </GuardedActionIcon>
        </Group>
      </Group>
    </Paper>
  );
};

export const TaskAttachments = ({ taskId }: TaskAttachmentsProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  const { data: attachmentsData, isLoading } = useGetAllTaskAttachments({
    taskId,
    pageSize: 100,
  });

  const createAttachment = useCreateAttachment();
  const createTaskAttachment = useCreateTaskAttachment();
  const deleteTaskAttachment = useDeleteTaskAttachment();
  const { allowed: canUpload } = usePermissionCheck("task-attachment:create");

  const attachments = attachmentsData?.data || [];

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploadingFiles(acceptedFiles);

      for (const file of acceptedFiles) {
        try {
          // First upload the file to get attachment ID
          const result = await createAttachment.mutateAsync(file);

          // Then link it to the task
          if (result?.id) {
            await createTaskAttachment.mutateAsync({
              taskId,
              attachmentId: result.id,
            });
          }
        } catch (error) {
          notifications.show({
            message: `"${file.name}" yuklashda xato`,
            color: "red",
          });
        }
      }

      setUploadingFiles([]);
    },
    [taskId, createAttachment, createTaskAttachment]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 100 * 1024 * 1024,
  });

  const handleDelete = (id: string) => {
    deleteTaskAttachment.mutate(id);
  };

  const isUploading = uploadingFiles.length > 0;

  return (
    <Stack gap="md">
      {/* Upload zone */}
      {canUpload ? (
        <Box
          {...getRootProps()}
          p="md"
          style={{
            border: `2px dashed ${isDragActive ? colors.primary : colors.border}`,
            borderRadius: 8,
            backgroundColor: isDragActive ? colors.bg : colors.white,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <input {...getInputProps()} />
          <Stack align="center" gap="xs">
            <ThemeIcon
              size="lg"
              radius="xl"
              variant="light"
              style={{ backgroundColor: colors.bgSubtle, color: colors.textDimmed }}
            >
              <IconUpload size={20} />
            </ThemeIcon>
            <Text size="sm" c={colors.textSecondary}>
              {isDragActive
                ? "Faylni bu yerga tashlang"
                : "Fayl yuklash uchun bosing yoki sudrab keling"}
            </Text>
            <Text size="xs" c="dimmed">
              PDF, JPG, PNG, GIF, DOC, DOCX (max 100MB)
            </Text>
          </Stack>
        </Box>
      ) : (
        <Box
          p="md"
          style={{
            border: `2px dashed ${colors.errorBg}`,
            borderRadius: 8,
            backgroundColor: colors.errorLight,
            textAlign: "center",
          }}
        >
          <Text size="sm" c={colors.error}>
            Fayl yuklash uchun ruxsat yo'q
          </Text>
        </Box>
      )}

      {/* Uploading indicator */}
      {isUploading && (
        <Paper p="sm" radius="sm" style={{ backgroundColor: colors.primaryLight }}>
          <Group gap="sm">
            <Loader size="xs" color={colors.primary} />
            <Text size="sm" c={colors.primary}>
              {uploadingFiles.length} ta fayl yuklanmoqda...
            </Text>
          </Group>
        </Paper>
      )}

      {/* Attachments list */}
      {isLoading ? (
        <Box py="md" style={{ display: "flex", justifyContent: "center" }}>
          <Loader size="sm" color={colors.primary} />
        </Box>
      ) : attachments.length > 0 ? (
        <Stack gap="xs">
          <Text size="sm" fw={500} c={colors.textPrimary}>
            Biriktirilgan fayllar ({attachments.length})
          </Text>
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed" ta="center" py="md">
          Hali fayllar biriktirilmagan
        </Text>
      )}
    </Stack>
  );
};

export default TaskAttachments;
