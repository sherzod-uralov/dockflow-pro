"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  Group,
  Button,
  TextInput,
  Paper,
  ActionIcon,
  Menu,
  Stack,
  Center,
} from "@mantine/core";
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
      header: "NOMI",
      cell: ({ row }) => (
        <Text size="sm" fw={500} c="#212529">
          {row.original.name}
        </Text>
      ),
      meta: { minWidth: 200 },
    },
    {
      accessorKey: "description",
      header: "TAVSIFI",
      cell: ({ row }) => (
        <Text size="sm" c="#495057" lineClamp={1}>
          {row.original.description || "-"}
        </Text>
      ),
      meta: { minWidth: 250 },
    },
    {
      accessorKey: "permissions",
      header: "RUXSATLAR",
      cell: ({ row }) => {
        const permissions = row.original.permissions;
        return (
          <Group gap={4}>
            {permissions.length > 0 ? (
              <>
                {permissions.slice(0, 2).map((permission) => (
                  <Text
                    key={permission.id}
                    size="xs"
                    bg="blue.1"
                    c="blue.8"
                    px={6}
                    py={2}
                    style={{ borderRadius: 4 }}
                  >
                    {permission.name}
                  </Text>
                ))}
                {permissions.length > 2 && (
                  <Text
                    size="xs"
                    bg="gray.1"
                    c="gray.7"
                    px={6}
                    py={2}
                    style={{ borderRadius: 4 }}
                  >
                    +{permissions.length - 2}
                  </Text>
                )}
              </>
            ) : (
              <Text size="sm" c="dimmed">
                Ruxsat yo'q
              </Text>
            )}
          </Group>
        );
      },
      meta: { minWidth: 200 },
    },
    {
      accessorKey: "users",
      header: "FOYDALANUVCHILAR",
      cell: ({ row }) => (
        <Text
          size="sm"
          bg="green.1"
          c="green.9"
          px={8}
          py={2}
          style={{ borderRadius: 12, display: "inline-block" }}
        >
          {row.original.users} ta
        </Text>
      ),
      meta: { minWidth: 150 },
    },
    {
      accessorKey: "actions",
      header: "AMALLAR",
      cell: ({ row }) => (
        <Menu shadow="md" width={180} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="sm">
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={16} />}
              onClick={() => handleViewRole(row.original)}
            >
              Ko'rish
            </Menu.Item>
            <Menu.Item
              leftSection={<IconEdit size={16} />}
              onClick={() => handleUpdate(row.original)}
            >
              Tahrirlash
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => handleDeleteClick(row.original)}
            >
              O'chirish
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
            backgroundColor: "#f1f3f5",
            borderRadius: 12,
          }}
        >
          <IconShieldLock size={40} color="#868e96" stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c="#495057">
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
          <Text size="lg" fw={600} c="#212529">
            Rollar
          </Text>
          <Text size="sm" c="dimmed">
            Rollarni boshqarish
          </Text>
        </Box>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={createModal.openModal}
          radius="sm"
          styles={{
            root: {
              backgroundColor: "#1e3a5f",
              "&:hover": { backgroundColor: "#162d4a" },
            },
          }}
        >
          Rol qo'shish
        </Button>
      </Group>

      {/* Search */}
      <Paper
        p="md"
        radius="sm"
        withBorder
        mb="md"
        style={{ borderColor: "#e9ecef" }}
      >
        <TextInput
          placeholder="Rollarni qidirish..."
          leftSection={<IconSearch size={18} color="#868e96" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          radius="sm"
          size="md"
        />
      </Paper>

      {/* Table */}
      <Box>
        {!isLoading && data?.data?.length === 0 ? (
          <Paper radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
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
