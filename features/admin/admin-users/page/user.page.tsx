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
  IconUser,
} from "@tabler/icons-react";
import {
  CustomModal,
  ConfirmationModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import {
  useDeleteUserMutation,
  useGetUserQuery,
} from "@/features/admin/admin-users/hook/user.hook";
import { User } from "@/features/admin/admin-users/type/user.types";
import UserForm from "../component/user.form";
import UserView from "../component/user.view";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/hooks/use-debaunce";
import { DataTable, DataTableColumn } from "@/components/shared/ui/custom-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modals
  const createModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();

  // State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, debounce, setSearch] = useDebounce("", 500);
  const { pageNumber, pageSize, handlePageChange, handlePageSizeChange } =
    usePagination();

  // Query
  const { data, isLoading } = useGetUserQuery({
    pageNumber,
    pageSize,
    search: debounce,
  });

  const deleteUserMutation = useDeleteUserMutation();

  // URL param handling
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId && data?.data) {
      const user = data.data.find((u: User) => u.id === userId);
      if (user) {
        setSelectedUser(user);
        viewModal.openModal();
      }
    } else {
      if (viewModal.isOpen) {
        viewModal.closeModal();
      }
    }
  }, [searchParams, data]);

  // Handlers
  const handleView = (user: User) => {
    setSelectedUser(user);
    viewModal.openModal();
    router.push(`?userId=${user.id}`, { scroll: false });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    editModal.openModal();
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id, {
        onSuccess: () => {
          deleteModal.closeModal();
          setSelectedUser(null);
        },
      });
    }
  };

  const handleCloseView = () => {
    viewModal.closeModal();
    setSelectedUser(null);
    router.push("/dashboard/admin/users", { scroll: false });
  };

  const handleEditClose = () => {
    editModal.closeModal();
    setSelectedUser(null);
  };

  // Table columns
  const columns: DataTableColumn<User>[] = [
    {
      accessorKey: "username",
      header: "FIO",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Group gap="sm" wrap="nowrap">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                {user.username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <Text size="sm" fw={500} c="#212529">
              {user.fullname}
            </Text>
          </Group>
        );
      },
      meta: { minWidth: 250 },
    },
    {
      accessorKey: "role",
      header: "ROL",
      cell: ({ row }) => (
        <Text size="sm" c="#495057">
          {row.original.role?.name}
        </Text>
      ),
      meta: { minWidth: 100 },
    },
    {
      accessorKey: "department",
      header: "BO'LIMI",
      cell: ({ row }) => (
        <Text size="sm" c="#495057">
          {row.original.department?.name || "-"}
        </Text>
      ),
      meta: { minWidth: 150 },
    },
    {
      accessorKey: "lastLogin",
      header: "OXIRGI KIRISH",
      cell: ({ row }) => {
        const lastLogin = row.original.lastLogin;
        if (!lastLogin) {
          return <Text size="sm" c="dimmed">Hech qachon</Text>;
        }
        const date = new Date(lastLogin);
        return (
          <Text size="sm" c="#495057">
            {date.toLocaleDateString("uz-UZ")} {date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        );
      },
      meta: { minWidth: 180 },
    },
    {
      id: "actions",
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
          <IconUser size={40} color="#868e96" stroke={1.5} />
        </Box>
        <Text size="lg" fw={500} c="#495057">
          Foydalanuvchi topilmadi
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Yangi foydalanuvchi qo'shish uchun yuqoridagi tugmani bosing
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
            Foydalanuvchilar
          </Text>
          <Text size="sm" c="dimmed">
            Foydalanuvchilarni boshqarish
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
          Foydalanuvchi qo'shish
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
          placeholder="Foydalanuvchi qidirish..."
          leftSection={<IconSearch size={18} color="#868e96" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            data={data?.data ?? []}
            loading={isLoading}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalCount={data?.count || 0}
            currentPage={pageNumber}
            pageSizeOptions={[5, 10, 20, 50]}
            emptyMessage="Hech qanday foydalanuvchi topilmadi"
          />
        )}
      </Box>

      {/* Create Modal */}
      <CustomModal
        closeOnOverlayClick
        size="3xl"
        onClose={createModal.closeModal}
        isOpen={createModal.isOpen}
        title="Foydalanuvchi qo'shish"
        description="Foydalanuvchi ma'lumotlarini kiriting"
      >
        <UserForm mode="create" modal={createModal} />
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        size="2xl"
        closeOnOverlayClick
        onClose={editModal.closeModal}
        isOpen={editModal.isOpen}
        title="Foydalanuvchini tahrirlash"
        description="Foydalanuvchi ma'lumotlarini tahrirlang"
      >
        <UserForm
          mode="edit"
          userData={selectedUser as any}
          modal={editModal}
        />
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        title="Foydalanuvchini o'chirish"
        description="Foydalanuvchini o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
        isOpen={deleteModal.isOpen}
        onConfirm={handleDeleteConfirm}
        onClose={deleteModal.closeModal}
        variant="destructive"
      />

      {/* View Modal */}
      <CustomModal
        closeOnOverlayClick
        isOpen={viewModal.isOpen}
        onClose={handleCloseView}
        title="Foydalanuvchi ma'lumotlari"
      >
        <UserView />
      </CustomModal>
    </Box>
  );
};

export default UserPage;
