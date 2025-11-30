"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Box,
    Text,
    Group,
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
    Avatar,
} from "@mantine/core";
import {
    IconSearch,
    IconDotsVertical,
    IconEye,
    IconCopy,
    IconArrowLeft,
    IconBuilding,
    IconUser,
    IconUsers,
    IconHash,
    IconMapPin,
} from "@tabler/icons-react";
import { useDebounce } from "@/hooks/use-debaunce";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useGetDeportamentById } from "@/features/deportament/hook/deportament.hook";
import { User } from "@/features/admin/admin-users/type/user.types";
import { handleCopyToClipboard } from "@/utils/copy-text";

const DepartmentUsersPage = () => {
    const params = useParams();
    const router = useRouter();
    const departmentId = params?.id as string;

    // State
    const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Queries
    const { data: department, isLoading: isDepartmentLoading } = useGetDeportamentById(departmentId);

    const { data: usersData, isLoading: isUsersLoading } = useGetUserQuery({
        departmentId: departmentId,
        search: debouncedSearch || undefined,
        pageSize: pageSize,
        pageNumber: page,
    });

    const handleViewUser = (user: User) => {
        router.push(`/dashboard/admin/users?userId=${user.id}`);
    };

    const handleBack = () => {
        router.push("/dashboard/department");
    };

    const totalPages = Math.ceil((usersData?.count || 0) / pageSize);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "—";
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

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Box>
            {/* Department Info Header */}
            {isDepartmentLoading ? (
                <Skeleton height={100} radius="sm" mb="md" />
            ) : department ? (
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
                                <IconBuilding size={24} color="#1e3a5f" />
                            </Box>
                            <Box>
                                <Text size="lg" fw={600} c="#212529">
                                    {department.name}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Bo'limga tegishli foydalanuvchilar ro'yxati
                                </Text>
                            </Box>
                        </Group>
                        {department.director && (
                            <Group gap="sm">
                                <IconUser size={16} color="#868e96" />
                                <Avatar
                                    size="sm"
                                    radius="xl"
                                    src={department.director.avatarUrl}
                                    style={{ backgroundColor: "#e7f5ff" }}
                                >
                                    <Text size="xs" c="#1e3a5f" fw={500}>
                                        {getInitials(department.director.fullname)}
                                    </Text>
                                </Avatar>
                                <Badge variant="light" color="indigo" radius="sm">
                                    {department.director.fullname}
                                </Badge>
                            </Group>
                        )}
                    </Group>
                    <Group gap="lg" mt="md">
                        {department.code && (
                            <Text size="sm" c="dimmed">
                                <IconHash size={14} style={{ verticalAlign: "middle" }} /> Kod:{" "}
                                <Text span fw={500} c="#1e3a5f" ff="monospace">
                                    {department.code}
                                </Text>
                            </Text>
                        )}
                        {department.location && (
                            <Text size="sm" c="dimmed">
                                <IconMapPin size={14} style={{ verticalAlign: "middle" }} />{" "}
                                {department.location}
                            </Text>
                        )}
                        <Text size="sm" c="dimmed">
                            Jami foydalanuvchilar:{" "}
                            <Text span fw={600} c="#212529">
                                {usersData?.count || 0}
                            </Text>
                        </Text>
                    </Group>
                </Paper>
            ) : null}

            {/* Search */}
            <Paper p="md" radius="sm" withBorder mb="md" style={{ borderColor: "#e9ecef" }}>
                <TextInput
                    placeholder="Foydalanuvchilarni qidirish..."
                    leftSection={<IconSearch size={18} color="#868e96" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    radius="sm"
                    size="md"
                />
            </Paper>

            {/* Users Table */}
            <Paper radius="sm" withBorder style={{ borderColor: "#e9ecef", overflow: "hidden" }}>
                {isUsersLoading ? (
                    <Stack p="xl" gap="md">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} height={50} radius="sm" />
                        ))}
                    </Stack>
                ) : usersData?.data?.length === 0 ? (
                    <Center py={60}>
                        <Stack align="center" gap="md">
                            <Box
                                p={16}
                                style={{
                                    backgroundColor: "#f1f3f5",
                                    borderRadius: 12,
                                }}
                            >
                                <IconUsers size={40} color="#868e96" stroke={1.5} />
                            </Box>
                            <Text size="lg" fw={500} c="#495057">
                                Foydalanuvchi topilmadi
                            </Text>
                            <Text size="sm" c="dimmed" ta="center">
                                Bu bo'limda hali foydalanuvchi yo'q
                            </Text>
                        </Stack>
                    </Center>
                ) : (
                    <Table.ScrollContainer minWidth={800}>
                        <Table verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead style={{ backgroundColor: "#f8f9fa" }}>
                                <Table.Tr>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Foydalanuvchi
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Rol
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Holat
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Oxirgi kirish
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600 }}>
                                        Ro'yxatdan o'tgan
                                    </Table.Th>
                                    <Table.Th style={{ color: "#495057", fontWeight: 600, width: 80 }}>
                                        Amallar
                                    </Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {usersData?.data?.map((user: User) => (
                                    <Table.Tr
                                        key={user.id}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleViewUser(user)}
                                    >
                                        <Table.Td>
                                            <Group gap="sm">
                                                <Avatar
                                                    size="sm"
                                                    radius="xl"
                                                    src={user.avatarUrl}
                                                    style={{ backgroundColor: "#e7f5ff" }}
                                                >
                                                    <Text size="xs" c="#1e3a5f" fw={500}>
                                                        {user.fullname ? getInitials(user.fullname) : "?"}
                                                    </Text>
                                                </Avatar>
                                                <Box>
                                                    <Text size="sm" fw={500} c="#212529">
                                                        {user.fullname}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        @{user.username}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="light" color="blue" radius="sm">
                                                {user.role?.name || "—"}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                variant="light"
                                                color={user.isActive ? "green" : "red"}
                                                radius="sm"
                                            >
                                                {user.isActive ? "Faol" : "Nofaol"}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="#495057">
                                                {user.lastLogin ? formatDate(user.lastLogin) : "Hali kirmagan"}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="#495057">
                                                {formatDate(user.createdAt)}
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
                                                        onClick={() => handleViewUser(user)}
                                                    >
                                                        Ko'rish
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconCopy size={16} />}
                                                        onClick={() => handleCopyToClipboard(user.id || "", "ID")}
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
                {usersData && usersData.count > 0 && (
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
                                Jami: {usersData.count} ta
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

export default DepartmentUsersPage;
