"use client";

import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { ModalState } from "@/types/modal";
import {
  useDeletePermission,
  useGetAllPermissions,
} from "../hook/permission.hook";
import { DataTable } from "@/components/shared/ui/custom-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";
import {
  CustomAction,
  ActionItem,
  createViewAction,
  createEditAction,
  createDeleteAction,
  createCopyAction,
} from "@/components/shared/ui/custom-action";
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

  const handleView = (permission: Permission) => {
    setSelectedPermission(permission);
    viewModal.openModal();
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    editModal.openModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Haqiqatan ham bu ruxsatni o'chirmoqchimisiz?")) {
      deletePermissionMutation.mutate(id);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateSuccess = () => {};

  const handleEditSuccess = () => {
    setSelectedPermission(null);
  };

  const handleEditModalClose = () => {
    setSelectedPermission(null);
    editModal.closeModal();
  };

  return (
    <>
      <UserToolbar
        searchQuery={searchQuery}
        searchPlaceholder="Ruxsatlarni qidirish..."
        onSearch={handleSearch}
        createLabel="Ruxsat qo'shish"
        onCreate={createModal.openModal}
      />

      <DataTable
        loading={isLoading}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalCount={data?.count || 0}
        currentPage={pageNumber}
        columns={[
          {
            header: "ID",
            accessorKey: "id",
            cell: ({ row }) => {
              const id = row.original.id;
              return (
                <div className="flex w-full items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono cursor-pointer hover:bg-muted"
                    onClick={() => handleCopyToClipboard(id, "ID")}
                  >
                    {id.slice(0, 8)}...
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 group"
                    onClick={() => handleCopyToClipboard(id, "ID")}
                  >
                    <Copy className="h-3 w-3 group-hover:text-text-on-dark" />
                  </Button>
                </div>
              );
            },
          },
          {
            header: "Nom",
            accessorKey: "name",
          },
          {
            header: "Tavsif",
            accessorKey: "description",
            cell: ({ row }) => (
              <div
                className="max-w-xs truncate"
                title={row.original.description}
              >
                {row.original.description}
              </div>
            ),
          },
          {
            header: "Kalit",
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
          },
          {
            header: "Modul",
            accessorKey: "module",
            cell: ({ row }) => (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-700 capitalize"
              >
                {row.original.module}
              </Badge>
            ),
          },
          {
            header: "Harakatlar",
            accessorKey: "actions",
            cell: ({ row }) => {
              const permission = row.original;

              const actions: ActionItem[] = [
                createViewAction(() => handleView(permission)),
                createEditAction(() => handleEdit(permission)),
                createCopyAction(() =>
                  handleCopyToClipboard(permission.key, "KEY"),
                ),
                createDeleteAction(() => handleDelete(permission.id)),
              ];

              return <CustomAction actions={actions} />;
            },
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
      <CustomModal
        closeOnOverlayClick={false}
        title="Ruxsat qo'shish"
        description="Ruxsat qo'shish uchun maydonlar to'ldirilishi kerak"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <PermissionFormModal
          modal={createModal}
          mode="create"
          onSuccess={handleCreateSuccess}
        />
      </CustomModal>
      <CustomModal
        closeOnOverlayClick={false}
        title={`${selectedPermission?.name} haqida to'liq ma'lumotlar`}
        description="Ruxsat haqida to'liq ma'lumotlar"
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
      >
        {selectedPermission && (
          <PermissionView
            permission={selectedPermission}
            onClose={viewModal.closeModal}
          />
        )}
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
    </>
  );
};

export default PermissionPage;
