"use client";

import {
    Box,
    Text,
    Group,
    Badge,
    Paper,
    Stack,
    SimpleGrid,
    Divider,
    CopyButton,
    ActionIcon,
    Tooltip,
} from "@mantine/core";
import {
    IconBook,
    IconHash,
    IconTemplate,
    IconBuilding,
    IconUser,
    IconCopy,
    IconCheck,
} from "@tabler/icons-react";
import { SingleJournalApiResponse } from "../type/journal.types";
import { colors } from "@/lib/colors";

interface JournalViewProps {
    journal: SingleJournalApiResponse;
}

const JournalView = ({ journal }: JournalViewProps) => {
    return (
        <Stack gap="lg">
            {/* Header */}
            <Box>
                <Group justify="space-between" align="flex-start">
                    <Group gap="sm">
                        <Box
                            p={10}
                            style={{
                                backgroundColor: colors.bgSubtle,
                                borderRadius: 8,
                            }}
                        >
                            <IconBook size={24} color={colors.primary} />
                        </Box>
                        <Box>
                            <Text size="xl" fw={600} c={colors.textPrimary}>
                                {journal.name}
                            </Text>
                            <Text size="sm" c="dimmed">
                                Jurnal haqida batafsil ma'lumotlar
                            </Text>
                        </Box>
                    </Group>
                    <CopyButton value={journal.id}>
                        {({ copied, copy }) => (
                            <Tooltip label={copied ? "Nusxalandi!" : "ID nusxalash"}>
                                <Badge
                                    variant="light"
                                    color={copied ? "green" : "gray"}
                                    radius="sm"
                                    size="lg"
                                    style={{ cursor: "pointer" }}
                                    onClick={copy}
                                    rightSection={
                                        copied ? (
                                            <IconCheck size={14} />
                                        ) : (
                                            <IconCopy size={14} />
                                        )
                                    }
                                >
                                    ID: {journal.id.slice(0, 8)}...
                                </Badge>
                            </Tooltip>
                        )}
                    </CopyButton>
                </Group>
            </Box>

            <Divider />

            {/* Prefix and Format */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
                    <Group gap="xs" mb="xs">
                        <IconHash size={16} color={colors.textDimmed} />
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                            Prefiks
                        </Text>
                    </Group>
                    <CopyButton value={journal.prefix}>
                        {({ copied, copy }) => (
                            <Paper
                                p="sm"
                                radius="sm"
                                style={{
                                    backgroundColor: copied ? colors.successBg : colors.primaryLight,
                                    cursor: "pointer",
                                    border: `1px solid ${copied ? colors.successBg : colors.infoLight}`,
                                }}
                                onClick={copy}
                            >
                                <Group justify="space-between">
                                    <Text size="md" fw={600} c={copied ? colors.successDark : colors.primary} ff="monospace">
                                        {journal.prefix}
                                    </Text>
                                    {copied ? (
                                        <IconCheck size={16} color={colors.successDark} />
                                    ) : (
                                        <IconCopy size={16} color={colors.primary} />
                                    )}
                                </Group>
                            </Paper>
                        )}
                    </CopyButton>
                </Paper>

                <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
                    <Group gap="xs" mb="xs">
                        <IconTemplate size={16} color={colors.textDimmed} />
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                            Format
                        </Text>
                    </Group>
                    <Paper
                        p="sm"
                        radius="sm"
                        style={{
                            backgroundColor: colors.bg,
                        }}
                    >
                        <Text size="md" c={colors.textSecondary} ff="monospace">
                            {journal.format}
                        </Text>
                    </Paper>
                </Paper>
            </SimpleGrid>

            {/* Department and Responsible User */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
                    <Group gap="xs" mb="sm">
                        <IconBuilding size={16} color={colors.textDimmed} />
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                            Bo'lim / Departament
                        </Text>
                    </Group>
                    <Badge
                        variant="light"
                        color="green"
                        size="lg"
                        radius="sm"
                    >
                        {journal.department?.name || "—"}
                    </Badge>
                </Paper>

                <Paper p="md" radius="sm" withBorder style={{ borderColor: colors.border }}>
                    <Group gap="xs" mb="sm">
                        <IconUser size={16} color={colors.textDimmed} />
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                            Mas'ul shaxs
                        </Text>
                    </Group>
                    <Badge
                        variant="light"
                        color="indigo"
                        size="lg"
                        radius="sm"
                    >
                        {journal.responsibleUser?.username || "—"}
                    </Badge>
                </Paper>
            </SimpleGrid>
        </Stack>
    );
};

export default JournalView;
