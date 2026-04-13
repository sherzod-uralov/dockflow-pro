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
  IconKey,
  IconCopy,
} from "@tabler/icons-react";
import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { ModalState } from "@/types/modal";
import {
  useDeletePermission,
  useGetAllPermissions,
} from "../hook/permission.hook";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import { Permission } from "../type/permission.type";
import PermissionFormModal from "../component/permission.create.modal";
import PermissionView from "../component/permission.view";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";
import { colors } from "@/lib/colors";

const PermissionPage = () => {
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const viewModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();

  const { handlePageChange, handlePageSizeChange, pageNumber, pageSize } =
    usePagination();
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const { data, isLoading } = useGetAllPermissions({
    search: debouncedSearch || undefined,
    pageSize: pageSize,
    pageNumber: pageNumber,
  });

  const deletePermissionMutation = useDeletePermission();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const permissionId = searchParams.get("permissionId");

    if (permissionId && data?.data) {
      const permission = data.data
        .flatMap((item: any) =>
          item.permissions.map((perm: any) => ({
            ...perm,
            module: item.module,
          })),
        )
        .find((p: Permission) => p.id === permissionId);

      if (permission) {
        setSelectedPermission(permission);
        viewModal.openModal();
      }
    } else {
      if (viewModal.isOpen) {
        viewModal.closeModal();
      }
    }
  }, [searchParams, data]);

  const handleView = (permission: Permission) => {
    setSelectedPermission(permission);
    viewModal.openModal();
    router.push(`?permissionId=${permission.id}`, { scroll: false });
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    editModal.openModal();
  };

  const handleDelete = (id: string) => {
    deletePermissionMutation.mutate(id, {
      onSuccess: () => {
        deleteModal.closeModal();
        setSelectedPermission(null);
      },
    });
  };

  const handleDeleteClick = (permission: Permission) => {
    setSelectedPermission(permission);
    deleteModal.openModal();
  };

  const handleEditSuccess = () => {
    setSelectedPermission(null);
  };

  const handleEditModalClose = () => {
    setSelectedPermission(null);
    editModal.closeModal();
  };

  const handleCloseViewModal = () => {
    viewModal.closeModal();
    setSelectedPermission(null);
    router.push("/dashboard/admin/permissions", { scroll: false });
  };

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
          <IconKey size={40} color={colors.textDimmed} stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c={colors.textSecondary}>
          Ruxsat topilmadi
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Yangi ruxsat qo'shish uchun yuqoridagi tugmani bosing
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
            Ruxsatlar
          </Text>
          <Text size="sm" c="dimmed">
            Ruxsatlarni boshqarish
          </Text>
        </Box>
        <GuardedButton
          permission="permission:create"
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
          Ruxsat qo'shish
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
          placeholder="Ruxsatlarni qidirish..."
          leftSection={<IconSearch size={18} color={colors.textDimmed} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          radius="sm"
          size="md"
        />
      </Paper>

      {/* Table */}
      <Box>
        {!isLoading &&
          (!data?.data ||
            data?.data.flatMap((item: any) => item.permissions).length === 0) ? (
          <Paper radius="sm" withBorder style={{ borderColor: colors.border }}>
            <EmptyState />
          </Paper>
        ) : (
          <DataTable
            loading={isLoading}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalCount={data?.count || 0}
            currentPage={pageNumber}
            columns={[
              {
                header: "Nomi",
                accessorKey: "name",
                cell: ({ row }) => (
                  <Group gap="sm" wrap="nowrap">
                    <IconKey size={18} color={colors.primary} style={{ flexShrink: 0 }} />
                    <Text size="sm" fw={500} c={colors.textPrimary}>
                      {row.original.name}
                    </Text>
                  </Group>
                ),
                meta: { minWidth: 200 },
              },
              {
                header: "Tavsif",
                accessorKey: "description",
                cell: ({ row }) => (
                  <Text size="sm" c={colors.textSecondary} lineClamp={1}>
                    {row.original.description || "—"}
                  </Text>
                ),
                meta: { minWidth: 250 },
              },
              {
                header: "Kalit",
                accessorKey: "key",
                cell: ({ row }) => (
                  <Text
                    size="xs"
                    px={8}
                    py={4}
                    onClick={() => handleCopyToClipboard(row.original.key, "KEY")}
                    title="Nusxalash uchun bosing"
                    style={{
                      backgroundColor: colors.bgSubtle,
                      color: colors.textSecondary,
                      borderRadius: 4,
                      fontFamily: "monospace",
                      cursor: "pointer",
                      display: "inline-block",
                    }}
                  >
                    {row.original.key}
                  </Text>
                ),
                meta: { minWidth: 150 },
              },
              {
                header: "Modul",
                accessorKey: "module",
                cell: ({ row }) => (
                  <Text
                    size="xs"
                    px={8}
                    py={4}
                    tt="capitalize"
                    style={{
                      backgroundColor: colors.border,
                      color: colors.textSecondary,
                      borderRadius: 4,
                      display: "inline-block",
                    }}
                  >
                    {row.original.module}
                  </Text>
                ),
                meta: { minWidth: 100 },
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
                        permission="permission:read"
                        leftSection={<IconEye size={16} />}
                        onClick={() => handleView(row.original)}
                      >
                        Ko'rish
                      </GuardedMenuItem>
                      <GuardedMenuItem
                        permission="permission:update"
                        leftSection={<IconEdit size={16} />}
                        onClick={() => handleEdit(row.original)}
                      >
                        Tahrirlash
                      </GuardedMenuItem>
                      <Menu.Item
                        leftSection={<IconCopy size={16} />}
                        onClick={() =>
                          handleCopyToClipboard(row.original.key, "KEY")
                        }
                      >
                        Kalitdan nusxa olish
                      </Menu.Item>
                      <Menu.Divider />
                      <GuardedMenuItem
                        permission="permission:delete"
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
            ]}
            data={
              data?.data
                ? data?.data.flatMap((item: any) =>
                  item.permissions.map((perm: any) => ({
                    ...perm,
                    module: item.module,
                  })),
                )
                : []
            }
          />
        )}
      </Box>

      {/* Modals */}
      <CustomModal
        closeOnOverlayClick={false}
        title="Ruxsat qo'shish"
        description="Ruxsat qo'shish uchun maydonlar to'ldirilishi kerak"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <PermissionFormModal modal={createModal} mode="create" />
      </CustomModal>

      <CustomModal
        size="3xl"
        closeOnOverlayClick
        title="Ruxsat haqida to'liq ma'lumotlar"
        isOpen={viewModal.isOpen}
        onClose={handleCloseViewModal}
      >
        <PermissionView />
      </CustomModal>

      <CustomModal
        closeOnOverlayClick={false}
        title="Ruxsatni yangilash"
        description="Ruxsat ma'lumotlarini yangilang"
        isOpen={editModal.isOpen}
        onClose={handleEditModalClose}
      >
        <PermissionFormModal
          modal={editModal}
          mode="update"
          permission={selectedPermission as any}
          onSuccess={handleEditSuccess}
        />
      </CustomModal>

      <ConfirmationModal
        closeOnOverlayClick={false}
        title="Ruxsatlarni o'chirish"
        description="Ushbu ruxsatni o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
        onClose={deleteModal.closeModal}
        isOpen={deleteModal.isOpen}
        onConfirm={() => {
          handleDelete(selectedPermission?.id as string);
        }}
        variant="destructive"
      />
    </Box>
  );
};

export default PermissionPage;
