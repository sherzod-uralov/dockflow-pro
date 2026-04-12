"use client";

import {
    Box,
    Text,
    Group,
    Badge,
    Paper,
    Stack,
    Button,
    SimpleGrid,
    Divider,
} from "@mantine/core";
import {
    IconDownload,
    IconFileText,
    IconCalendar,
    IconTag,
} from "@tabler/icons-react";
import { DocumentTemplateResponse } from "@/features/document-template";
import { formatDate } from "@/lib/date-utils";
import { colors } from "@/lib/colors";

interface DocumentTemplateViewProps {
    template: DocumentTemplateResponse;
}

// Fayl hajmini formatlash
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const DocumentTemplateView = ({ template }: DocumentTemplateViewProps) => {
    const handleDownload = () => {
        if (template.templateFile?.fileUrl) {
            window.open(template.templateFile.fileUrl, "_blank");
        }
    };

    const tagCount = template.requiredTags ? Object.keys(template.requiredTags).length : 0;

    return (
        <Stack gap="lg">
            {/* Header Info */}
            <Box>
                <Text size="xl" fw={600} c={colors.textPrimary} mb={4}>
                    {template.name}
                </Text>
                {template.description && (
                    <Text size="sm" c="dimmed">
                        {template.description}
                    </Text>
                )}
            </Box>

            <Divider />

            {/* Main Info */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {/* Hujjat turi */}
                <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                        Hujjat turi
                    </Text>
                    <Text size="md" fw={500} c={colors.textPrimary}>
                        {template.documentType?.name || "—"}
                    </Text>
                </Paper>

                {/* Holat */}
                <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                        Holati
                    </Text>
                    <Group gap="sm">
                        <Badge
                            variant="light"
                            color={template.isActive ? "green" : "gray"}
                            size="lg"
                            radius="sm"
                        >
                            {template.isActive ? "Faol" : "Nofaol"}
                        </Badge>
                        <Badge
                            variant="light"
                            color={template.isPublic ? "blue" : "gray"}
                            size="lg"
                            radius="sm"
                        >
                            {template.isPublic ? "Ommaviy" : "Shaxsiy"}
                        </Badge>
                    </Group>
                </Paper>

                {/* Yaratilgan */}
                <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                        Yaratilgan
                    </Text>
                    <Group gap="xs">
                        <IconCalendar size={16} color={colors.textDimmed} />
                        <Text size="md" c={colors.textSecondary}>
                            {formatDate(template.createdAt)}
                        </Text>
                    </Group>
                </Paper>

                {/* Yangilangan */}
                <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                        Yangilangan
                    </Text>
                    <Group gap="xs">
                        <IconCalendar size={16} color={colors.textDimmed} />
                        <Text size="md" c={colors.textSecondary}>
                            {formatDate(template.updatedAt)}
                        </Text>
                    </Group>
                </Paper>
            </SimpleGrid>

            {/* File */}
            {template.templateFile && (
                <Paper p="lg" radius="sm" withBorder style={{ borderColor: colors.border }}>
                    <Group justify="space-between" wrap="nowrap">
                        <Group gap="md" wrap="nowrap">
                            <Box
                                p={12}
                                style={{
                                    backgroundColor: colors.bgSubtle,
                                    borderRadius: 8,
                                }}
                            >
                                <IconFileText size={24} color={colors.textSecondary} stroke={1.5} />
                            </Box>
                            <Box>
                                <Text size="md" fw={500} c={colors.textPrimary}>
                                    {template.templateFile.fileName}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    {formatFileSize(template.templateFile.fileSize)} •{" "}
                                    {template.templateFile.mimeType.includes("word")
                                        ? "Word hujjati"
                                        : template.templateFile.mimeType.split("/").pop()?.toUpperCase()}
                                </Text>
                            </Box>
                        </Group>
                        <Button
                            variant="light"
                            leftSection={<IconDownload size={16} />}
                            onClick={handleDownload}
                            radius="sm"
                        >
                            Yuklab olish
                        </Button>
                    </Group>
                </Paper>
            )}

            {/* Tags */}
            {tagCount > 0 && (
                <Paper p="lg" radius="sm" withBorder style={{ borderColor: colors.border }}>
                    <Group gap="xs" mb="md">
                        <IconTag size={18} color={colors.textSecondary} />
                        <Text fw={600} size="sm" c={colors.textPrimary}>
                            Taglar ({tagCount})
                        </Text>
                    </Group>
                    <Text size="xs" c="dimmed" mb="md">
                        Bu taglar hujjat yaratishda avtomatik to'ldiriladi
                    </Text>
                    <Group gap="xs">
                        {Object.entries(template.requiredTags || {}).map(([tagName, tagType]) => (
                            <Badge
                                key={tagName}
                                variant="light"
                                color="blue"
                                radius="sm"
                                size="lg"
                            >
                                {`{${tagName}}`}
                            </Badge>
                        ))}
                    </Group>
                </Paper>
            )}
        </Stack>
    );
};

export default DocumentTemplateView;
