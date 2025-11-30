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
    Tooltip,
    Avatar,
} from "@mantine/core";
import {
    IconBuilding,
    IconHash,
    IconMapPin,
    IconUser,
    IconCopy,
    IconCheck,
    IconFileDescription,
    IconSitemap,
} from "@tabler/icons-react";
import { DepartmentResponse } from "../type/deportament.type";

interface DeportamentViewProps {
    deportament: DepartmentResponse;
}

const DeportamentView = ({ deportament }: DeportamentViewProps) => {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

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
                            <IconBuilding size={24} color="#1e3a5f" />
                        </Box>
                        <Box>
                            <Text size="xl" fw={600} c="#212529">
                                {deportament.name}
                            </Text>
                            <Text size="sm" c="dimmed">
                                Bo'lim haqida batafsil ma'lumotlar
                            </Text>
                        </Box>
                    </Group>
                    <CopyButton value={deportament.id}>
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
                                    ID: {deportament.id.slice(0, 8)}...
                                </Badge>
                            </Tooltip>
                        )}
                    </CopyButton>
                </Group>
            </Box>

            <Divider />

            {/* Description */}
            {deportament.description && (
                <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                    <Group gap="xs" mb="sm">
                        <IconFileDescription size={16} color="#868e96" />
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                            Tavsif
                        </Text>
                    </Group>
                    <Text size="sm" c="#495057" style={{ lineHeight: 1.6 }}>
                        {deportament.description}
                    </Text>
                </Paper>
            )}

            {/* Code and Location */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                    <Group gap="xs" mb="sm">
                        <IconHash size={16} color="#868e96" />
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                            Kod
                        </Text>
                    </Group>
                    {deportament.code ? (
                        <CopyButton value={deportament.code}>
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
                                            {deportament.code}
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
                    ) : (
                        <Text size="sm" c="dimmed">Kiritilmagan</Text>
                    )}
                </Paper>

                <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                    <Group gap="xs" mb="sm">
                        <IconMapPin size={16} color="#868e96" />
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                            Joylashuv
                        </Text>
                    </Group>
                    <Text size="md" c="#495057">
                        {deportament.location || "Kiritilmagan"}
                    </Text>
                </Paper>
            </SimpleGrid>

            {/* Parent Department and Director */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {deportament.parent && (
                    <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                        <Group gap="xs" mb="sm">
                            <IconSitemap size={16} color="#868e96" />
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                Bosh bo'lim
                            </Text>
                        </Group>
                        <Badge
                            variant="light"
                            color="green"
                            size="lg"
                            radius="sm"
                        >
                            {deportament.parent.name}
                        </Badge>
                    </Paper>
                )}

                {deportament.director && (
                    <Paper p="md" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                        <Group gap="xs" mb="sm">
                            <IconUser size={16} color="#868e96" />
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                Bo'lim boshlig'i
                            </Text>
                        </Group>
                        <Group gap="sm">
                            <Avatar
                                size="md"
                                radius="xl"
                                src={deportament.director.avatarUrl}
                                style={{ backgroundColor: "#e7f5ff" }}
                            >
                                <Text size="sm" c="#1e3a5f" fw={500}>
                                    {getInitials(deportament.director.fullname)}
                                </Text>
                            </Avatar>
                            <Box>
                                <Text size="md" fw={500} c="#212529">
                                    {deportament.director.fullname}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    @{deportament.director.username}
                                </Text>
                            </Box>
                        </Group>
                    </Paper>
                )}
            </SimpleGrid>
        </Stack>
    );
};

export default DeportamentView;
