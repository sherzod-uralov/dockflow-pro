"use client";

import React from "react";
import { Eye, Pencil, Trash2, MoreHorizontal, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableColumn,
  createSelectColumn,
} from "@/components/shared/ui/custom-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { User } from "@/features/admin/admin-users/type/user.types";
import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import UserForm from "../component/user.form";

const UserPage = () => {
  const { data, isLoading } = useGetUserQuery();
  const createModal = useModal();

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
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-transparent"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Amallar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleViewUser(user)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ko'rish
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditUser(user)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSendEmail(user)}
                className="cursor-pointer"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email yuborish
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleToggleStatus(user)}
                className="cursor-pointer"
              ></DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteUser(user)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      meta: {
        width: 80,
        sticky: "right",
      },
    },
  ];

  const handleViewUser = (user: User) => {
    console.log("Ko'rish:", user);
  };

  const handleEditUser = (user: User) => {
    console.log("Tahrirlash:", user);
  };

  const handleDeleteUser = (user: User) => {
    console.log("O'chirish:", user);
  };

  const handleSendEmail = (user: User) => {
    console.log("Email yuborish:", user);
  };

  const handleToggleStatus = (user: User) => {
    console.log("Holatni o'zgartirish:", user);
  };

  return (
    <div className="space-y-6">
      <UserToolbar
        searchQuery="Foydalanuvchi qidirish"
        createLabel="Foydalanuvchi qo'shish"
        onCreate={() => createModal.openModal()}
        filterLabel="Filtr"
        onFilter={() => console.log("filter")}
        onSearch={() => console.log("Search user")}
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        emptyMessage="Hech qanday foydalanuvchi topilmadi"
        className="bg-transparent"
      />
      <CustomModal
        closeOnOverlayClick
        onClose={createModal.closeModal}
        isOpen={createModal.isOpen}
        title="Foydalanuvchi qo'shish"
        description="Foydalanuvchi ma'lumotlarini kiriting"
      >
        <UserForm mode="create" modal={createModal} />
      </CustomModal>
    </div>
  );
};

export default UserPage;
