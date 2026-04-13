"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useDropzone, Accept } from "react-dropzone";
import {
  Box,
  Text,
  Paper,
  Group,
  Stack,
  ActionIcon,
  Badge,
  ThemeIcon,
  Progress,
} from "@mantine/core";
import {
  IconUpload,
  IconFileText,
  IconFile,
  IconX,
  IconDownload,
  IconPhoto,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { colors } from "@/lib/colors";

interface ExistingFile {
  id: string;
  fileName: string;
  fileSize?: number;
  fileUrl: string;
}

interface FileUploadProps {
  onChange: (file: File | File[] | undefined) => void;
  value?: File | File[];
  label?: string;
  name: string;
  multiple?: boolean;
  maxFiles?: number;
  accept?: Accept;
  maxSize?: number;
  helperText?: string;
  existingFiles?: ExistingFile[];
  onDeleteExisting?: (fileId: string) => void;
  uploading?: boolean;
}

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const isImage = (type: string) => type.startsWith("image/");
const isWord = (type: string) =>
  type === "application/msword" ||
  type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const isPdf = (type: string) => type === "application/pdf";

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <IconFileText size={20} color={colors.errorDark} />;
  if (["doc", "docx"].includes(ext || ""))
    return <IconFileText size={20} color={colors.primary} />;
  if (["jpg", "jpeg", "png", "gif"].includes(ext || ""))
    return <IconPhoto size={20} color={colors.successDark} />;
  return <IconFile size={20} color={colors.textDimmed} />;
};

type DisplayFile = {
  type: "existing" | "new";
  id?: string;
  file?: File;
  fileName: string;
  fileSize?: number;
  fileUrl?: string;
  index?: number;
};

export function FileUpload({
  onChange,
  label,
  name,
  multiple = false,
  maxFiles,
  accept,
  maxSize,
  helperText,
  value,
  existingFiles = [],
  onDeleteExisting,
  uploading = false,
}: FileUploadProps) {
  const [localFiles, setLocalFiles] = useState<File[]>(
    Array.isArray(value) ? value : value ? [value] : []
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejections: any[]) => {
      if (rejections?.length) {
        rejections.forEach((rej) => {
          rej.errors?.forEach((err: any) => {
            notifications.show({
              message: err.message || "Fayl qabul qilinmadi",
              color: "red",
            });
          });
        });
      }
      if (!acceptedFiles.length) return;

      if (!multiple && existingFiles.length > 0 && onDeleteExisting) {
        existingFiles.forEach((file) => onDeleteExisting(file.id));
      }

      const next = multiple
        ? [...localFiles, ...acceptedFiles]
        : [acceptedFiles[0]];
      setLocalFiles(next);
      onChange(multiple ? next : next[0]);
    },
    [localFiles, multiple, onChange, existingFiles, onDeleteExisting]
  );

  const removeNewFile = (index: number) => {
    const next = localFiles.filter((_, i) => i !== index);
    setLocalFiles(next);
    onChange(multiple ? next : next[0]);
  };

  const computedAccept: Accept = accept ?? {
    "application/pdf": [".pdf"],
    "image/*": [".jpg", ".jpeg", ".png", ".gif"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: computedAccept,
    multiple,
    maxFiles: maxFiles ?? (multiple ? 10 : 1),
    maxSize: maxSize ?? 100 * 1024 * 1024,
  });

  const allFiles = useMemo<DisplayFile[]>(() => {
    const existing: DisplayFile[] = existingFiles.map((file) => ({
      type: "existing",
      id: file.id,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileUrl: file.fileUrl,
    }));

    const newFiles: DisplayFile[] = localFiles.map((file, index) => ({
      type: "new",
      file: file,
      fileName: file.name,
      fileSize: file.size,
      index: index,
    }));

    return [...existing, ...newFiles];
  }, [existingFiles, localFiles]);

  const hasFiles = allFiles.length > 0;

  return (
    <Stack gap="sm">
      {/* Dropzone */}
      <Box
        {...getRootProps()}
        p="lg"
        style={{
          border: `2px dashed ${isDragActive ? colors.primary : colors.border}`,
          borderRadius: 8,
          backgroundColor: isDragActive ? colors.bg : colors.white,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <input {...getInputProps()} name={name} />
        <Stack align="center" gap="xs">
          <ThemeIcon
            size="xl"
            radius="xl"
            variant="light"
            style={{ backgroundColor: colors.bgSubtle, color: colors.textDimmed }}
          >
            <IconUpload size={24} />
          </ThemeIcon>
          <Text size="sm" fw={500} c={colors.textPrimary}>
            {isDragActive
              ? "Fayl(lar)ni bu yerga tashlang"
              : hasFiles
              ? "Boshqa fayl yuklash"
              : "Fayl yuklash"}
          </Text>
          <Text size="xs" c="dimmed">
            {helperText ?? "PDF, JPG, PNG, GIF, DOC, DOCX (max 100MB)"}
          </Text>
          {label && (
            <Text size="xs" c="dimmed">
              {label}
            </Text>
          )}
        </Stack>
      </Box>

      {/* Upload progress */}
      {uploading && (
        <Box>
          <Group gap="xs" mb={4}>
            <Text size="xs" c="dimmed">Yuklanmoqda...</Text>
          </Group>
          <Progress value={100} size="xs" radius="xl" animated color="blue" />
        </Box>
      )}

      {/* File list */}
      {hasFiles && (
        <Paper p="sm" radius="sm" withBorder style={{ borderColor: colors.border }}>
          <Text size="sm" fw={500} c={colors.textPrimary} mb="xs">
            Yuklangan fayllar ({allFiles.length})
          </Text>
          <Stack gap="xs">
            {allFiles.map((item, idx) => (
              <Paper
                key={item.type === "existing" ? item.id : `new-${idx}`}
                p="xs"
                radius="sm"
                style={{ backgroundColor: colors.bg }}
              >
                <Group gap="sm" wrap="nowrap">
                  {/* File icon/preview */}
                  <Box
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 4,
                      backgroundColor: colors.border,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {item.type === "new" &&
                    item.file &&
                    isImage(item.file.type) ? (
                      <img
                        src={URL.createObjectURL(item.file)}
                        alt={item.fileName}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                        }}
                      />
                    ) : item.type === "new" &&
                      item.file &&
                      isPdf(item.file.type) ? (
                      <IconFileText size={20} color={colors.errorDark} />
                    ) : item.type === "new" &&
                      item.file &&
                      isWord(item.file.type) ? (
                      <IconFileText size={20} color={colors.primary} />
                    ) : (
                      getFileIcon(item.fileName)
                    )}
                  </Box>

                  {/* File info */}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="xs" wrap="nowrap">
                      <Text size="sm" fw={500} c={colors.textPrimary} lineClamp={1}>
                        {item.fileName}
                      </Text>
                      {item.type === "new" && (
                        <Badge
                          size="xs"
                          radius="sm"
                          variant="light"
                          style={{
                            backgroundColor: colors.primaryLight,
                            color: colors.primary,
                          }}
                        >
                          Yangi
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">
                      {item.type === "new" && item.file
                        ? `${item.file.type || "unknown"} • ${formatBytes(item.fileSize)}`
                        : formatBytes(item.fileSize)}
                    </Text>
                  </Box>

                  {/* Actions */}
                  <Group gap={4} wrap="nowrap">
                    {item.type === "existing" && item.fileUrl && (
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        color="gray"
                        component="a"
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                    )}
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="red"
                      onClick={() => {
                        if (
                          item.type === "existing" &&
                          item.id &&
                          onDeleteExisting
                        ) {
                          onDeleteExisting(item.id);
                        } else if (
                          item.type === "new" &&
                          item.index !== undefined
                        ) {
                          removeNewFile(item.index);
                        }
                      }}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
