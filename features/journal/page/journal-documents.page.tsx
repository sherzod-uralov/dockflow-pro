"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Box,
    Text,
    Group,
    Button,
    TextInput,
    Paper,
    Table,
    Badge,
    ActionIcon,
    Menu,
    Pagination,
    Select,
    Stack,
    Skeleton,
    Center,
} from "@mantine/core";
import {
    IconSearch,
    IconDotsVertical,
    IconEye,
    IconCopy,
    IconArrowLeft,
    IconBook,
    IconBuilding,
    IconUser,
    IconFileText,
} from "@tabler/icons-react";
import { useDebounce } from "@/hooks/use-debaunce";
import { useGetAllDocuments } from "@/features/document";
import { useGetJournalById } from "@/features/journal/hook/journal.hook";
import { DocumentGetResponse } from "@/features/document/type/document.type";
import { handleCopyToClipboard } from "@/utils/copy-text";

const statusColors: Record<string, { color: string; label: string }> = {
    PUBLISHED: { color: "green", label: "Chop etilgan" },
    DRAFT: { color: "yellow", label: "Qoralama" },
    ARCHIVED: { color: "gray", label: "Arxivlangan" },
};

const priorityColors: Record<string, { color: string; label: string }> = {
    HIGH: { color: "red", label: "Yuqori" },
    MEDIUM: { color: "orange", label: "O'rta" },
    LOW: { color: "blue", label: "Past" },
};

const JournalDocumentsPage = () => {
    const params = useParams();
    const router = useRouter();
    const journalId = params?.id as string;

    // State
    const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Queries
    const { data: journal, isLoading: isJournalLoading } = useGetJournalById(journalId);

    const { data: documentsData, isLoading: isDocumentsLoading } = useGetAllDocuments({
        journalId: journalId,
        search: debouncedSearch || undefined,
        pageSize: pageSize,
        pageNumber: page,
    });

    const handleViewDocument = (document: DocumentGetResponse) => {
        router.push(`/dashboard/document/${document.id}`);
    };

    const handleBack = () => {
        router.push("/dashboard/journal");
    };

    const totalPages = Math.ceil((documentsData?.count || 0) / pageSize);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("uz-UZ", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "—";
        }
    };

    return (
        <Box>
            {/* Journal Info Header */}
            {isJournalLoading ? (
                <Skeleton height={100} radius="sm" mb="md" />
            ) : journal ? (
                <Paper p="lg" radius="sm" withBorder mb="md" style={{ borderColor: "#e9ecef" }}>
                    <Group justify="space-between" wrap="wrap">
                        <Group gap="md">
                            <ActionIcon
                                variant="light"
                                size="lg"
                                radius="sm"
                                onClick={handleBack}
                                style={{ backgroundColor: "#f1f3f5" }}
                            >
                                <IconArrowLeft size={20} color="#495057" />
                            </ActionIcon>
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
                                <Text size="lg" fw={600} c="#212529">
                                    {journal.name}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Jurnalga tegishli hujjatlar ro'yxati
                                </Text>
                            </Box>
                        </Group>
                        <Group gap="lg">
                            <Group gap="xs">
                                <IconBuilding size={16} color="#868e96" />
                                <Badge variant="light" color="green" radius="sm">
                                    {journal.department?.name}
                                </Badge>
                            </Group>
                            <Group gap="xs">
                                <IconUser size={16} color="#868e96" />
                                <Badge variant="light" color="indigo" radius="sm">
                                    {journal.responsibleUser?.username}
                                </Badge>
                            </Group>
                        </Group>
                    </Group>
                    <Group gap="lg" mt="md">
                        <Text size="sm" c="dimmed">
                            Prefiks: <Text span fw={500} c="#1e3a5f" ff="monospace">{journal.prefix}</Text>
                        </Text>
                        <Text size="sm" c="dimmed">
                            Format: <Text span fw={500} c="#495057" ff="monospace">{journal.format}</Text>
                        </Text>
                        <Text size="sm" c="dimmed">
                            Jami hujjatlar: <Text span fw={600} c="#212529">{documentsData?.count || 0}</Text>
                        </Text>
                    </Group>
                </Paper>
            ) : null}

            {/* Search */}
            <Paper p="md" radius="sm" withBorder mb="md" style={{ borderColor: "#e9ecef" }}>
                <TextInput
                    placeholder="Hujjatlarni qidirish..."
                    leftSection={<IconSearch size={18} color="#868e96" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    radius="sm"
                    size="md"
                />
            </Paper>

            {/* Documents Table */}
            <Paper radius="sm" withBorder style={{ borderColor: "#e9ecef", overflow: "hidden" }}>
                {isDocumentsLoading ? (
                    <Stack p="xl" gap="md">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} height={50} radius="sm" />
                        ))}
                    </Stack>
                ) : documentsData?.data?.length === 0 ? (
                    <Center py={60}>
                        <Stack align="center" gap="md">
                            <Box
                                p={16}
                                style={{
                                    backgroundColor: "#f1f3f5",
                                    borderRadius: 12,
                                }}
                            >
                                <IconFileText size={40} color="#868e96" stroke={1.5} />
                            </Box>
                            <Text size="lg" fw={500} c="#495057">
                                Hujjat topilmadi
                            </Text>
                            <Text size="sm" c="dimmed" ta="center">
                                Bu jurnalda hali hujjat yo'q
                            </Text>
                        </Stack>
                    </Center>
                ) : (
                    <Table.ScrollContainer minWidth={900}>
                        <Table verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead style={{ backgroundColor: "#f8f9fa" }}>
                                <Table.Tr>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Hujjat raqami
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Sarlavha
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Holat
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Muhimlik
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Hujjat turi
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Yaratuvchi
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Sana
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600, width: 80 }}>
                                        Amallar
                                    </Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {documentsData?.data?.map((doc: DocumentGetResponse) => (
                                    <Table.Tr
                                        key={doc.id}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleViewDocument(doc)}
                                    >
                                        <Table.Td>
                                            <Text size="sm" fw={500} c="#1e3a5f" ff="monospace">
                                                {doc.documentNumber}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" fw={500} c="#212529" lineClamp={1}>
                                                {doc.title}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                variant="light"
                                                color={statusColors[doc.status]?.color || "gray"}
                                                radius="sm"
                                            >
                                                {statusColors[doc.status]?.label || doc.status}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                variant="light"
                                                color={priorityColors[doc.priority]?.color || "gray"}
                                                radius="sm"
                                            >
                                                {priorityColors[doc.priority]?.label || doc.priority}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="#495057">
                                                {doc.documentType?.name || "—"}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="#495057">
                                                {doc.createdBy?.fullname || "—"}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="#495057">
                                                {formatDate(doc.createdAt)}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td onClick={(e) => e.stopPropagation()}>
                                            <Menu shadow="md" width={160} position="bottom-end">
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" color="gray" radius="sm">
                                                        <IconDotsVertical size={18} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconEye size={16} />}
                                                        onClick={() => handleViewDocument(doc)}
                                                    >
                                                        Ko'rish
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconCopy size={16} />}
                                                        onClick={() => handleCopyToClipboard(doc.id || "", "ID")}
                                                    >
                                                        ID nusxalash
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                )}

                {/* Pagination */}
                {documentsData && documentsData.count > 0 && (
                    <Group justify="space-between" p="md" style={{ borderTop: "1px solid #e9ecef" }}>
                        <Group gap="xs">
                            <Text size="sm" c="dimmed">
                                Ko'rsatish:
                            </Text>
                            <Select
                                value={String(pageSize)}
                                onChange={(val) => {
                                    setPageSize(Number(val));
                                    setPage(1);
                                }}
                                data={[
                                    { value: "10", label: "10" },
                                    { value: "20", label: "20" },
                                    { value: "50", label: "50" },
                                ]}
                                size="xs"
                                w={70}
                                radius="sm"
                            />
                        </Group>
                        <Group gap="md">
                            <Text size="sm" c="dimmed">
                                Jami: {documentsData.count} ta
                            </Text>
                            <Pagination
                                total={totalPages}
                                value={page}
                                onChange={setPage}
                                size="sm"
                                radius="sm"
                                styles={{
                                    control: {
                                        "&[data-active]": {
                                            backgroundColor: "#1e3a5f",
                                            borderColor: "#1e3a5f",
                                        },
                                    },
                                }}
                            />
                        </Group>
                    </Group>
                )}
            </Paper>
        </Box>
    );
};

export default JournalDocumentsPage;
