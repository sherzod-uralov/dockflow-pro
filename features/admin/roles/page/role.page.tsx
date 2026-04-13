"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  Group,
  TextInput,
  Paper,
  ActionIcon,
  Menu,
  Stack,
  Center,
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
  IconShieldLock,
} from "@tabler/icons-react";
import {
  CustomModal,
  ConfirmationModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import RoleForm from "../component/role.form";
import RoleView from "../component/role-view";
import { useDeleteRole, useGetRoles } from "../hook/role.hook";
import { RoleData } from "../type/role.type";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/hooks/use-debaunce";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import { colors } from "@/lib/colors";

const RolesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modals
  const createModal = useModal();
  const deleteModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();

  // State
  const { pageNumber, handlePageSizeChange, pageSize, handlePageChange } =
    usePagination();
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);

  // Query
  const { data, isLoading } = useGetRoles({
    pageSize: pageSize,
    pageNumber: pageNumber,
    search: debouncedSearch,
  });

  const deleteMutation = useDeleteRole();

  // URL param handling
  useEffect(() => {
    const roleId = searchParams.get("roleId");

    if (roleId && data?.data) {
      const role = data.data.find((r: RoleData) => r.id === roleId);

      if (role) {
        setSelectedRole(role);
        viewModal.openModal();
      }
    } else {
      if (viewModal.isOpen) {
        viewModal.closeModal();
      }
    }
  }, [searchParams, data]);

  // Handlers
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        deleteModal.closeModal();
        setSelectedRole(null);
      },
    });
  };

  const handleUpdate = (role: RoleData) => {
    setSelectedRole(role);
    editModal.openModal();
  };

  const handleViewRole = (role: RoleData) => {
    setSelectedRole(role);
    viewModal.openModal();
    router.push(`?roleId=${role.id}`, { scroll: false });
  };

  const handleCloseViewModal = () => {
    viewModal.closeModal();
    setSelectedRole(null);
    router.push("/dashboard/admin/roles", { scroll: false });
  };

  const handleDeleteClick = (role: RoleData) => {
    setSelectedRole(role);
    deleteModal.openModal();
  };

  // Table columns
  const columns: DataTableColumn<RoleData>[] = [
    {
      accessorKey: "name",
      header: "Nomi",
      cell: ({ row }) => (
        <Group gap="sm" wrap="nowrap">
          <IconShieldLock size={18} color={colors.primary} style={{ flexShrink: 0 }} />
          <Text size="sm" fw={500} c={colors.textPrimary}>
            {row.original.name}
          </Text>
        </Group>
      ),
      meta: { minWidth: 180 },
    },
    {
      accessorKey: "description",
      header: "Tavsif",
      cell: ({ row }) => (
        <Text size="sm" c={colors.textSecondary} lineClamp={1}>
          {row.original.description || "—"}
        </Text>
      ),
      meta: { minWidth: 200 },
    },
    {
      accessorKey: "permissions",
      header: "Ruxsatlar",
      cell: ({ row }) => {
        const permissions = row.original.permissions || [];
        return (
          <Group gap={4}>
            {permissions.length > 0 ? (
              <>
                {permissions.slice(0, 1).map((permission) => (
                  <Text
                    key={permission.id}
                    size="xs"
                    px={8}
                    py={2}
                    style={{
                      backgroundColor: colors.bgSubtle,
                      color: colors.textSecondary,
                      borderRadius: 4,
                    }}
                  >
                    {permission.name}
                  </Text>
                ))}
                {permissions.length > 1 && (
                  <Text
                    size="xs"
                    px={8}
                    py={2}
                    style={{
                      backgroundColor: colors.border,
                      color: colors.textDimmed,
                      borderRadius: 4,
                    }}
                  >
                    +{permissions.length - 2}
                  </Text>
                )}
              </>
            ) : (
              <Text size="sm" c="dimmed">
                —
              </Text>
            )}
          </Group>
        );
      },
      meta: { minWidth: 200 },
    },
    {
      accessorKey: "users",
      header: "Foydalanuvchilar",
      cell: ({ row }) => (
        <Text
          size="xs"
          px={10}
          py={4}
          style={{
            backgroundColor: colors.border,
            color: colors.textSecondary,
            borderRadius: 12,
            display: "inline-block",
            fontWeight: 500,
          }}
        >
          {row.original.users} ta
        </Text>
      ),
      meta: { minWidth: 140 },
    },
    {
      id: "actions",
      header: "Amallar",
      cell: ({ row }) => (
        <Menu shadow="md" width={180} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="sm">
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <GuardedMenuItem
              permission="role:read"
              leftSection={<IconEye size={16} />}
              onClick={() => handleViewRole(row.original)}
            >
              Ko'rish
            </GuardedMenuItem>
            <GuardedMenuItem
              permission="role:update"
              leftSection={<IconEdit size={16} />}
              onClick={() => handleUpdate(row.original)}
            >
              Tahrirlash
            </GuardedMenuItem>
            <Menu.Divider />
            <GuardedMenuItem
              permission="role:delete"
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
          <IconShieldLock size={40} color={colors.textDimmed} stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c={colors.textSecondary}>
          Rol topilmadi
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Yangi rol qo'shish uchun yuqoridagi tugmani bosing
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
            Rollar
          </Text>
          <Text size="sm" c="dimmed">
            Rollarni boshqarish
          </Text>
        </Box>
        <GuardedButton
          permission="role:create"
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
          Rol qo'shish
        </GuardedButton>
      </Group>

      {/* Search */}
      <Paper
        p="md"
        radius="sm"
        withBorder
        mb="md"
        style={{ borderColor: colors.border }}
      >
        <TextInput
          placeholder="Rollarni qidirish..."
          leftSection={<IconSearch size={18} color={colors.textDimmed} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          radius="sm"
          size="md"
        />
      </Paper>

      {/* Table */}
      <Box>
        {!isLoading && data?.data?.length === 0 ? (
          <Paper radius="sm" withBorder style={{ borderColor: colors.border }}>
            <EmptyState />
          </Paper>
        ) : (
          <DataTable
            columns={columns}
            data={data?.data || []}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalCount={data?.count || 0}
            currentPage={pageNumber}
            loading={isLoading}
            emptyMessage="Rol topilmadi"
          />
        )}
      </Box>

      {/* Modals */}
      <CustomModal
        size="2xl"
        closeOnOverlayClick={false}
        title="Rol qo'shish"
        description="Rol qo'shish uchun maydonlarni to'ldiring"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <RoleForm mode="create" modal={createModal} />
      </CustomModal>

      <ConfirmationModal
        closeOnOverlayClick={false}
        title="Rol o'chirish"
        description="Ro'lni o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={() => {
          handleDelete(selectedRole?.id || "");
        }}
        variant="destructive"
      />

      <CustomModal
        size="2xl"
        closeOnOverlayClick={false}
        title="Rol tahrirlash"
        description="Rol tahrirlash uchun maydonlarni to'ldiring"
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
      >
        <RoleForm mode="edit" role={selectedRole} modal={editModal} />
      </CustomModal>

      <CustomModal
        closeOnOverlayClick
        isOpen={viewModal.isOpen}
        onClose={handleCloseViewModal}
        title="Rol ma'lumotlari"
      >
        <RoleView />
      </CustomModal>
    </Box>
  );
};

export default RolesPage;
