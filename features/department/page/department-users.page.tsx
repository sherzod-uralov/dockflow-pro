"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Box,
    Text,
    Group,
    TextInput,
    Paper,
    Badge,
    ActionIcon,
    Menu,
    Stack,
    Center,
    Avatar,
    Button,
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
} from "@tabler/icons-react";
import { useDebounce } from "@/hooks/use-debaunce";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useGetDepartmentById } from "@/features/department/hook/department.hook";
import { User } from "@/features/admin/admin-users/type/user.types";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import { formatDate } from "@/lib/date-utils";
import { colors } from "@/lib/colors";

const DepartmentUsersPage = () => {
    const params = useParams();
    const router = useRouter();
    const departmentId = params?.id as string;

    // State
    const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Queries
    const { data: department, isLoading: isDepartmentLoading } = useGetDepartmentById(departmentId);

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

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Columns
    const columns: DataTableColumn<User>[] = [
        {
            accessorKey: "fullname",
            header: "Foydalanuvchi",
            cell: ({ row }) => (
                <Group gap="sm" wrap="nowrap">
                    <Avatar
                        size="sm"
                        radius="xl"
                        src={row.original.avatarUrl}
                        style={{ backgroundColor: colors.primaryLight }}
                    >
                        <Text size="xs" c={colors.primary} fw={500}>
                            {row.original.fullname ? getInitials(row.original.fullname) : "?"}
                        </Text>
                    </Avatar>
                    <Box>
                        <Text size="sm" fw={500} c={colors.textPrimary}>
                            {row.original.fullname}
                        </Text>
                        <Text size="xs" c="dimmed">
                            @{row.original.username}
                        </Text>
                    </Box>
                </Group>
            ),
            meta: { minWidth: 200 },
        },
        {
            accessorKey: "role",
            header: "Rol",
            cell: ({ row }) => (
                <Badge variant="light" color="blue" radius="sm">
                    {row.original.role?.name || "—"}
                </Badge>
            ),
            meta: { minWidth: 120 },
        },
        {
            accessorKey: "isActive",
            header: "Holat",
            cell: ({ row }) => (
                <Badge
                    variant="light"
                    color={row.original.isActive ? "green" : "red"}
                    radius="sm"
                >
                    {row.original.isActive ? "Faol" : "Nofaol"}
                </Badge>
            ),
            meta: { minWidth: 100 },
        },
        {
            accessorKey: "lastLogin",
            header: "Oxirgi kirish",
            cell: ({ row }) => (
                <Text size="sm" c={colors.textSecondary}>
                    {row.original.lastLogin ? formatDate(row.original.lastLogin) : "Hali kirmagan"}
                </Text>
            ),
            meta: { minWidth: 150 },
        },
        {
            accessorKey: "createdAt",
            header: "Ro'yxatdan o'tgan",
            cell: ({ row }) => (
                <Text size="sm" c={colors.textSecondary}>
                    {formatDate(row.original.createdAt)}
                </Text>
            ),
            meta: { minWidth: 150 },
        },
        {
            id: "actions",
            header: "Amallar",
            cell: ({ row }) => (
                <Menu shadow="md" width={160} position="bottom-end">
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" radius="sm">
                            <IconDotsVertical size={18} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconEye size={16} />}
                            onClick={() => handleViewUser(row.original)}
                        >
                            Ko'rish
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconCopy size={16} />}
                            onClick={() => handleCopyToClipboard(row.original.id || "", "ID")}
                        >
                            ID nusxalash
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            ),
            meta: { width: 80, truncate: false },
        },
    ];

    // Empty state
    const EmptyState = () => (
        <Center py={60}>
            <Stack align="center" gap="md">
                <Box
                    p={16}
                    style={{
                        backgroundColor: colors.bgSubtle,
                        borderRadius: 12,
                    }}
                >
                    <IconUsers size={40} color={colors.textDimmed} stroke={1.5} />
                </Box>
                <Text size="lg" fw={500} c={colors.textSecondary}>
                    Foydalanuvchi topilmadi
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                    Bu bo'limda hali foydalanuvchi yo'q
                </Text>
            </Stack>
        </Center>
    );

    if (isDepartmentLoading) {
        return (
            <Center h={400}>
                <Stack align="center">
                    <Text>Yuklanmoqda...</Text>
                </Stack>
            </Center>
        )
    }

    if (!department) {
        return (
            <Center h={400}>
                <Stack align="center">
                    <Text>Bo'lim topilmadi</Text>
                    <Button onClick={handleBack} variant="light">Ortga qaytish</Button>
                </Stack>
            </Center>
        )
    }

    return (
        <Box>
            {/* Header */}
            <Group justify="space-between" mb="md" align="flex-start">
                <Group>
                    <ActionIcon
                        variant="light"
                        size="lg"
                        radius="sm"
                        onClick={handleBack}
                        style={{ backgroundColor: colors.bgSubtle }}
                    >
                        <IconArrowLeft size={20} color={colors.textSecondary} />
                    </ActionIcon>
                    <Box>
                        <Text size="lg" fw={600} c={colors.textPrimary}>
                            {department.name}
                        </Text>
                        <Group gap="xs" c="dimmed">
                            <IconBuilding size={14} />
                            <Text size="sm">
                                Bo'lim foydalanuvchilari
                            </Text>
                        </Group>
                    </Box>
                </Group>

                {department.director && (
                    <Paper px="md" py="xs" radius="sm" withBorder style={{ borderColor: colors.border }}>
                        <Group gap="sm">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Rahbar:</Text>
                            <Avatar
                                size="sm"
                                radius="xl"
                                src={department.director.avatarUrl}
                                style={{ backgroundColor: colors.primaryLight }}
                            >
                                <Text size="xs" c={colors.primary} fw={500}>
                                    {getInitials(department.director.fullname)}
                                </Text>
                            </Avatar>
                            <Text size="sm" fw={500} c={colors.textPrimary}>
                                {department.director.fullname}
                            </Text>
                        </Group>
                    </Paper>
                )}
            </Group>

            {/* Search */}
            <Paper p="md" radius="sm" withBorder mb="md" style={{ borderColor: colors.border }}>
                <TextInput
                    placeholder="Foydalanuvchilarni qidirish..."
                    leftSection={<IconSearch size={18} color={colors.textDimmed} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    radius="sm"
                    size="md"
                />
            </Paper>

            {/* Users Table */}
            <Box>
                {usersData?.data?.length === 0 && !isUsersLoading ? (
                    <Paper radius="sm" withBorder style={{ borderColor: colors.border }}>
                        <EmptyState />
                    </Paper>
                ) : (
                    <DataTable
                        columns={columns}
                        data={usersData?.data || []}
                        loading={isUsersLoading}
                        totalCount={usersData?.count || 0}
                        currentPage={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(1);
                        }}
                        emptyMessage="Foydalanuvchi topilmadi"
                    />
                )}
            </Box>
        </Box>
    );
};

export default DepartmentUsersPage;
