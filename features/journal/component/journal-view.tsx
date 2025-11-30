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
import { SingleJournalApiResponse } from "../types/journal.types";

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
                                backgroundColor: "#f1f3f5",
                                borderRadius: 8,
                            }}
                        >
                            <IconBook size={24} color="#1e3a5f" />
                        </Box>
                        <Box>
                            <Text size="xl" fw={600} c="#212529">
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
                <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                    <Group gap="xs" mb="xs">
                        <IconHash size={16} color="#868e96" />
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
                                    backgroundColor: copied ? "#d3f9d8" : "#e7f5ff",
                                    cursor: "pointer",
                                    border: `1px solid ${copied ? "#8ce99a" : "#a5d8ff"}`,
                                }}
                                onClick={copy}
                            >
                                <Group justify="space-between">
                                    <Text size="md" fw={600} c={copied ? "#2b8a3e" : "#1e3a5f"} ff="monospace">
                                        {journal.prefix}
                                    </Text>
                                    {copied ? (
                                        <IconCheck size={16} color="#2b8a3e" />
                                    ) : (
                                        <IconCopy size={16} color="#1e3a5f" />
                                    )}
                                </Group>
                            </Paper>
                        )}
                    </CopyButton>
                </Paper>

                <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                    <Group gap="xs" mb="xs">
                        <IconTemplate size={16} color="#868e96" />
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                            Format
                        </Text>
                    </Group>
                    <Paper
                        p="sm"
                        radius="sm"
                        style={{
                            backgroundColor: "#f8f9fa",
                        }}
                    >
                        <Text size="md" c="#495057" ff="monospace">
                            {journal.format}
                        </Text>
                    </Paper>
                </Paper>
            </SimpleGrid>

            {/* Department and Responsible User */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                    <Group gap="xs" mb="sm">
                        <IconBuilding size={16} color="#868e96" />
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

                <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                    <Group gap="xs" mb="sm">
                        <IconUser size={16} color="#868e96" />
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
