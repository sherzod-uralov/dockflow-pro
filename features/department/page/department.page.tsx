"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Tabs,
} from "@mantine/core";
import {
  GuardedButton,
  GuardedMenuItem,
} from "@/components/shared/permission";
import {
  IconPlus,
  IconSearch,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconBuilding,
  IconCopy,
  IconUsers,
  IconTable,
  IconHierarchy,
} from "@tabler/icons-react";
import {
  CustomModal,
  ConfirmationModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import {
  useGetAllDepartments,
  useDeleteDepartment,
  useUpdateDepartmentParent,
} from "../hook/department.hook";
import { DepartmentResponse } from "../type/department.type";
import { useDebounce } from "@/hooks/use-debaunce";
import DepartmentFormModal from "../component/department.form";
import DepartmentView from "../component/department.view";
import dynamic from "next/dynamic";

const DepartmentGraphView = dynamic(
  () => import("../component/department-graph.view"),
  { ssr: false }
);
import { handleCopyToClipboard } from "@/utils/copy-text";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import { colors } from "@/lib/colors";

const DepartmentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modals
  const createModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();

  // State
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentResponse | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState<string | null>("table");

  // Query
  const { data, isLoading } = useGetAllDepartments({
    search: debouncedSearch,
    pageSize,
    pageNumber: page,
  });

  const deleteMutation = useDeleteDepartment();
  const updateParentMutation = useUpdateDepartmentParent();

  // URL param uchun
  useEffect(() => {
    const departmentId = searchParams.get("departmentId");
    if (departmentId && data?.data) {
      const department = data.data.find((d) => d.id === departmentId);
      if (department) {
        setSelectedDepartment(department);
        viewModal.openModal();
      }
    }
  }, [searchParams, data]);

  // Handlers
  const handleView = (department: DepartmentResponse) => {
    setSelectedDepartment(department);
    viewModal.openModal();
    router.push(`?departmentId=${department.id}`, { scroll: false });
  };

  const handleViewUsers = (department: DepartmentResponse) => {
    router.push(`/dashboard/department/${department.id}`);
  };

  const handleEdit = (department: DepartmentResponse) => {
    setSelectedDepartment(department);
    editModal.openModal();
  };

  const handleDeleteClick = (department: DepartmentResponse) => {
    setSelectedDepartment(department);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedDepartment) {
      deleteMutation.mutate(selectedDepartment.id, {
        onSuccess: () => {
          deleteModal.closeModal();
          setSelectedDepartment(null);
        },
      });
    }
  };

  const handleCloseView = () => {
    viewModal.closeModal();
    setSelectedDepartment(null);
    router.push(window.location.pathname, { scroll: false });
  };

  const handleEditClose = () => {
    editModal.closeModal();
    setSelectedDepartment(null);
  };

  const handleConnectDepartments = (targetId: string, parentId: string) => {
    updateParentMutation.mutate({ id: targetId, parentId });
  };

  const handleDisconnectDepartment = (id: string) => {
    updateParentMutation.mutate({ id, parentId: null });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Table columns
  const columns: DataTableColumn<DepartmentResponse>[] = [
    {
      accessorKey: "name",
      header: "Nomi",
      cell: ({ row }) => (
        <Group gap="sm" wrap="nowrap">
          <IconBuilding size={18} color={colors.primary} style={{ flexShrink: 0 }} />
          <Text size="sm" fw={500} c={colors.textPrimary}>
            {row.original.name}
          </Text>
        </Group>
      ),
      meta: { minWidth: 150 },
    },
    {
      accessorKey: "description",
      header: "Tavsif",
      cell: ({ row }) => (
        <Text size="sm" c={colors.textSecondary} lineClamp={1}>
          {row.original.description || "—"}
        </Text>
      ),
      meta: { minWidth: 150 },
    },
    {
      accessorKey: "code",
      header: "Kod",
      cell: ({ row }) =>
        row.original.code ? (
          <Badge variant="light" color="blue" radius="sm">
            {row.original.code}
          </Badge>
        ) : (
          <Text size="sm" c="dimmed">—</Text>
        ),
      meta: { width: 100, truncate: false },
    },
    {
      accessorKey: "location",
      header: "Joylashuv",
      cell: ({ row }) => (
        <Text size="sm" c={colors.textSecondary}>
          {row.original.location || "—"}
        </Text>
      ),
      meta: { minWidth: 120 },
    },
    {
      accessorKey: "director",
      header: "Bo'lim boshlig'i",
      cell: ({ row }) =>
        row.original.director ? (
          <Group gap="sm" wrap="nowrap">
            <Avatar
              size="sm"
              radius="xl"
              src={row.original.director.avatarUrl}
              style={{ backgroundColor: colors.primaryLight, flexShrink: 0 }}
            >
              <Text size="xs" c={colors.primary} fw={500}>
                {getInitials(row.original.director.fullname)}
              </Text>
            </Avatar>
            <Text size="sm" c={colors.textPrimary} lineClamp={1}>
              {row.original.director.fullname}
            </Text>
          </Group>
        ) : (
          <Text size="sm" c="dimmed">—</Text>
        ),
      meta: { minWidth: 150 },
    },
    {
      id: "actions",
      header: "Amallar",
      cell: ({ row }) => (
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="sm">
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <GuardedMenuItem
              permission="user:list"
              leftSection={<IconUsers size={16} />}
              onClick={() => handleViewUsers(row.original)}
            >
              Foydalanuvchilarni ko'rish
            </GuardedMenuItem>
            <GuardedMenuItem
              permission="department:read"
              leftSection={<IconEye size={16} />}
              onClick={() => handleView(row.original)}
            >
              Ko'rish
            </GuardedMenuItem>
            <GuardedMenuItem
              permission="department:update"
              leftSection={<IconEdit size={16} />}
              onClick={() => handleEdit(row.original)}
            >
              Tahrirlash
            </GuardedMenuItem>
            <Menu.Item
              leftSection={<IconCopy size={16} />}
              onClick={() => handleCopyToClipboard(row.original.id, "ID")}
            >
              ID nusxalash
            </Menu.Item>
            <Menu.Divider />
            <GuardedMenuItem
              permission="department:delete"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => handleDeleteClick(row.original)}
            >
              O'chirish
            </GuardedMenuItem>
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
          <IconBuilding size={40} color={colors.textDimmed} stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c={colors.textSecondary}>
          Bo'lim topilmadi
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Yangi bo'lim qo'shish uchun yuqoridagi tugmani bosing
        </Text>
      </Stack>
    </Center>
  );

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Box>
          <Text size="lg" fw={600} c={colors.textPrimary}>
            Bo'limlar
          </Text>
          <Text size="sm" c="dimmed">
            Tashkilot bo'limlari ro'yxati
          </Text>
        </Box>
        <GuardedButton
          permission="department:create"
          leftSection={<IconPlus size={18} />}
          onClick={createModal.openModal}
          radius="sm"
          styles={{
            root: {
              backgroundColor: colors.primary,
              "&:hover": { backgroundColor: colors.primaryHover },
            },
          }}
        >
          Bo'lim qo'shish
        </GuardedButton>
      </Group>

      {/* Search */}
      <Paper p="md" radius="sm" withBorder mb="md" style={{ borderColor: colors.border }}>
        <TextInput
          placeholder="Bo'limlarni qidirish..."
          leftSection={<IconSearch size={18} color={colors.textDimmed} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          radius="sm"
          size="md"
        />
      </Paper>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab} radius="sm">
        <Tabs.List mb="md">
          <Tabs.Tab value="table" leftSection={<IconTable size={18} />}>
            Jadval
          </Tabs.Tab>
          <Tabs.Tab value="graph" leftSection={<IconHierarchy size={18} />}>
            Ierarxiya
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="table">
          {!isLoading && data?.data?.length === 0 ? (
            <Paper radius="sm" withBorder style={{ borderColor: colors.border }}>
              <EmptyState />
            </Paper>
          ) : (
            <DataTable
              columns={columns}
              data={data?.data || []}
              loading={isLoading}
              totalCount={data?.count || 0}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              emptyMessage="Bo'lim topilmadi"
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="graph">
          <DepartmentGraphView
            departments={data?.data || []}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onView={handleView}
            onConnectDepartments={handleConnectDepartments}
            onDisconnectDepartment={handleDisconnectDepartment}
            onViewUsers={(dept) => router.push(`/dashboard/department/${dept.id}`)}
          />
        </Tabs.Panel>
      </Tabs>

      {/* Create Modal */}
      <CustomModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title="Bo'lim qo'shish"
        description="Bo'lim qo'shish uchun maydonlarni to'ldiring"
        size="lg"
        closeOnOverlayClick={false}
      >
        <DepartmentFormModal
          mode="create"
          onClose={createModal.closeModal}
          onSuccess={createModal.closeModal}
        />
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        isOpen={editModal.isOpen}
        onClose={handleEditClose}
        title="Bo'limni tahrirlash"
        description="Bo'lim ma'lumotlarini o'zgartirishingiz mumkin"
        size="lg"
        closeOnOverlayClick={false}
      >
        <DepartmentFormModal
          mode="update"
          department={selectedDepartment}
          onClose={handleEditClose}
          onSuccess={handleEditClose}
        />
      </CustomModal>

      {/* View Modal */}
      <CustomModal
        isOpen={viewModal.isOpen}
        onClose={handleCloseView}
        title="Bo'lim ma'lumotlari"
        description="Bo'lim haqida to'liq ma'lumot"
        size="lg"
      >
        {selectedDepartment && (
          <DepartmentView department={selectedDepartment} />
        )}
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        title="Bo'limni o'chirish"
        description={`"${selectedDepartment?.name}" bo'limini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
        variant="destructive"
      />
    </Box>
  );
};

export default DepartmentPage;
