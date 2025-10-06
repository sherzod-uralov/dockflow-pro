"use client";

import React, { useState } from "react";
import {
  DataTable,
  DataTableColumn,
  createSelectColumn,
} from "@/components/shared/ui/custom-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import {
  useDeleteUserMutation,
  useGetUserQuery,
} from "@/features/admin/admin-users/hook/user.hook";
import { User } from "@/features/admin/admin-users/type/user.types";
import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import UserForm from "../component/user.form";
import {
  ActionItem,
  createDeleteAction,
  createEditAction,
  createViewAction,
  CustomAction,
} from "@/components/shared/ui/custom-action";
import { ModalState } from "@/types/modal";
import { useRouter } from "next/navigation";
import UserView from "../component/user.view";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/hooks/use-debaunce";

const UserPage = () => {
  const { pageNumber, pageSize, handlePageChange, handlePageSizeChange } =
    usePagination();
  const [search, debaunce, setSearch] = useDebounce("", 500);
  const { data, isLoading } = useGetUserQuery({ pageNumber, pageSize, search });
  const createModal = useModal();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();
  const viewModal: ModalState = useModal();
  const router = useRouter();
  const deleteUserMutation = useDeleteUserMutation();

  const columns: DataTableColumn<User>[] = [
    createSelectColumn<User>(),
    {
      accessorKey: "id",
    },
    {
      accessorKey: "username",
      header: "header",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                {user.username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {user.fullname}
              </span>
            </div>
          </div>
        );
      },
      meta: {
        width: 280,
      },
    },
    {
      accessorKey: "createdAt",
      header: "Qo'shilgan sana",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString("uz-UZ")}
          </span>
        );
      },
      meta: {
        width: 150,
      },
    },
    {
      accessorKey: "lastLogin",
      header: "Oxirgi kirish",
      cell: ({ row }) => {
        const lastLogin = row.original.lastLogin;
        return (
          <span className="text-sm text-muted-foreground">
            {lastLogin
              ? new Date(lastLogin).toLocaleDateString("uz-UZ")
              : "Hech qachon"}
          </span>
        );
      },
      meta: {
        width: 150,
      },
    },
    {
      id: "actions",
      header: "Amallar",
      cell: ({ row }) => {
        const user = row.original;

        const actions: ActionItem[] = [
          createViewAction(() => handleViewUser(user)),
          createEditAction(() => handleEditUser(user)),
          createDeleteAction(() => {
            setSelectedUser(user);
            deleteModal.openModal();
          }),
        ];

        return <CustomAction actions={actions} />;
      },
      meta: {
        width: 80,
        sticky: "right",
      },
    },
  ];

  const handleViewUser = (user: User) => {
    viewModal.openModal();
    router.push(`?userId=${user.id}`, { scroll: false });
  };

  const handleEditUser = (user: User) => {
    editModal.openModal();
    setSelectedUser(user);
  };

  return (
    <div className="space-y-6">
      <UserToolbar
        searchQuery={search}
        searchPlaceholder="Foydalanuvchi qidirish"
        createLabel="Foydalanuvchi qo'shish"
        onCreate={() => createModal.openModal()}
        onSearch={setSearch}
      />
      <DataTable
        columns={columns}
        data={(data?.data as any[]) ?? []}
        loading={isLoading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        emptyMessage="Hech qanday foydalanuvchi topilmadi"
        className="bg-transparent"
      />
      <CustomModal
        closeOnOverlayClick
        size="full"
        onClose={createModal.closeModal}
        isOpen={createModal.isOpen}
        title="Foydalanuvchi qo'shish"
        description="Foydalanuvchi ma'lumotlarini kiriting"
      >
        <UserForm mode="create" modal={createModal} />
      </CustomModal>
      <CustomModal
        closeOnOverlayClick
        onClose={editModal.closeModal}
        isOpen={editModal.isOpen}
        title="Foydalanuvchi tahrirlash"
        description="Foydalanuvchi ma'lumotlarini tahrirlang"
      >
        <UserForm
          mode="edit"
          userData={selectedUser as any}
          modal={editModal}
        />
      </CustomModal>
      <ConfirmationModal
        title="Foydalanuvchini o'chirish"
        description="Foydalanuvchini o'chirgandan so'ng qaytarib bo'lmaydi rozimisiz?"
        isOpen={deleteModal.isOpen}
        onConfirm={() => deleteUserMutation.mutate(selectedUser?.id || "")}
        onClose={deleteModal.closeModal}
      />
      <CustomModal
        closeOnOverlayClick
        isOpen={viewModal.isOpen}
        onClose={() => {
          viewModal.closeModal();
          router.push("?", { scroll: false });
        }}
        title="Foydalanuvchi malumotlari"
      >
        <UserView />
      </CustomModal>
    </div>
  );
};

export default UserPage;
