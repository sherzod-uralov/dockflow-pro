"use client";

import {
  Box,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  Divider,
  Skeleton,
} from "@mantine/core";
import { IconFileText, IconInfoCircle, IconCopy } from "@tabler/icons-react";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { useSearchParams } from "next/navigation";
import { useGetDocumentTypeById } from "../hook/document-type.hook";
import { colors } from "@/lib/colors";

const DocumentTypeView = () => {
  const params = useSearchParams();
  const documentTypeId = params.get("documentTypeId") || "";

  const {
    data: documentType,
    isLoading,
    isFetching,
  } = useGetDocumentTypeById(documentTypeId);

  if (isLoading || isFetching) {
    return (
      <Stack gap="md">
        <Skeleton height={60} radius="sm" />
        <Skeleton height={100} radius="sm" />
        <Skeleton height={80} radius="sm" />
      </Stack>
    );
  }

  if (!documentType) {
    return (
      <Box ta="center" py="xl">
        <IconFileText size={48} color={colors.borderLight} />
        <Text size="sm" c="dimmed" mt="md">
          Ma'lumot topilmadi
        </Text>
      </Box>
    );
  }

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: colors.bgSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconFileText size={20} color={colors.primary} />
            </Box>
            <Box>
              <Text size="lg" fw={600} c={colors.textPrimary}>
                {documentType.name}
              </Text>
              <Text size="sm" c="dimmed">
                Hujjat turi haqida batafsil ma'lumotlar
              </Text>
            </Box>
          </Group>

          {documentType.id && (
            <Badge
              size="md"
              radius="sm"
              variant="outline"
              style={{
                borderColor: colors.border,
                color: colors.textSecondary,
                cursor: "pointer",
                fontFamily: "monospace",
              }}
              rightSection={<IconCopy size={12} />}
              onClick={() =>
                handleCopyToClipboard(documentType.id, "ID nusxalandi")
              }
            >
              ID: {documentType.id.slice(0, 8)}...
            </Badge>
          )}
        </Group>
      </Paper>

      {/* Nomi */}
      <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
        <Group gap="xs" mb="sm">
          <IconFileText size={16} color={colors.textDimmed} />
          <Text size="sm" fw={600} c={colors.textSecondary}>
            Nomi
          </Text>
        </Group>
        <Box
          p="sm"
          style={{
            backgroundColor: colors.bg,
            borderRadius: 4,
          }}
        >
          <Text size="sm" c={colors.textPrimary}>
            {documentType.name}
          </Text>
        </Box>
      </Paper>

      {/* Tavsif */}
      {documentType.description && (
        <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
          <Group gap="xs" mb="sm">
            <IconInfoCircle size={16} color={colors.textDimmed} />
            <Text size="sm" fw={600} c={colors.textSecondary}>
              Tavsif
            </Text>
          </Group>
          <Box
            p="sm"
            style={{
              backgroundColor: colors.bg,
              borderRadius: 4,
            }}
          >
            <Text size="sm" c="dimmed">
              {documentType.description}
            </Text>
          </Box>
        </Paper>
      )}
    </Stack>
  );
};

export default DocumentTypeView;
