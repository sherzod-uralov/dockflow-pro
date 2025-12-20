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
  IconKey,
  IconCopy,
} from "@tabler/icons-react";
import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { ModalState } from "@/types/modal";
import {
  useDeletePermission,
  useGetAllPermissions,
} from "../hook/permission.hook";
import { DataTable } from "@/components/shared/ui/custom-table";
import { Badge } from "@/components/ui/badge";
import { Permission } from "../type/permission.type";
import PermissionFormModal from "../component/permission.create.modal";
import PermissionView from "../component/permission.view";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";

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
            backgroundColor: "#f1f3f5",
            borderRadius: 12,
          }}
        >
          <IconKey size={40} color="#868e96" stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c="#495057">
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
          <Text size="lg" fw={600} c="#212529">
            Ruxsatlar
          </Text>
          <Text size="sm" c="dimmed">
            Ruxsatlarni boshqarish
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
          Ruxsat qo'shish
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
          placeholder="Ruxsatlarni qidirish..."
          leftSection={<IconSearch size={18} color="#868e96" />}
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
          <Paper radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
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
                header: "NOM",
                accessorKey: "name",
                cell: ({ row }) => (
                  <Text size="sm" fw={500} c="#212529">
                    {row.original.name}
                  </Text>
                ),
                meta: { minWidth: 200 },
              },
              {
                header: "TAVSIF",
                accessorKey: "description",
                cell: ({ row }) => (
                  <div
                    className="max-w-xs truncate"
                    title={row.original.description}
                  >
                    <Text size="sm" c="#495057">
                      {row.original.description}
                    </Text>
                  </div>
                ),
                meta: { minWidth: 250 },
              },
              {
                header: "KALIT",
                accessorKey: "key",
                cell: ({ row }) => (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200"
                    onClick={() => handleCopyToClipboard(row.original.key, "KEY")}
                    title="Nusxalash uchun bosing"
                  >
                    {row.original.key}
                  </Badge>
                ),
                meta: { minWidth: 150 },
              },
              {
                header: "MODUL",
                accessorKey: "module",
                cell: ({ row }) => (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 capitalize"
                  >
                    {row.original.module}
                  </Badge>
                ),
                meta: { minWidth: 100 },
              },
              {
                header: "AMALLAR",
                accessorKey: "actions",
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
                        onClick={() => handleView(row.original)}
                      >
                        Ko'rish
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconEdit size={16} />}
                        onClick={() => handleEdit(row.original)}
                      >
                        Tahrirlash
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconCopy size={16} />}
                        onClick={() =>
                          handleCopyToClipboard(row.original.key, "KEY")
                        }
                      >
                        Kalitdan nusxa olish
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
