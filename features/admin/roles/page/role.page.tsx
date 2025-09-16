"use client";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import RoleForm from "../component/role.form";
import { useDeleteRole, useGetRoles } from "../hook/role.hook";
import { DataTable } from "@/components/shared/ui/custom-table";
import {
  ActionItem,
  createCopyAction,
  createDeleteAction,
  createEditAction,
  createViewAction,
  CustomAction,
} from "@/components/shared/ui/custom-action";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { RoleData } from "../type/role.type";
import { usePagination } from "@/hooks/use-pagination";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/ui/custom-modal";

const RolesPage = () => {
  const createModal = useModal();
  const deleteModal = useModal();
  const editModal = useModal();
  const { pageNumber, handlePageSizeChange, pageSize, handlePageChange } =
    usePagination();

  const { data } = useGetRoles({
    pageSize: pageSize,
    pageNumber: pageNumber,
  });
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const deleteMutation = useDeleteRole();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleUpdate = (role: RoleData) => {
    setSelectedRole(role);
    editModal.openModal();
  };

  return (
    <>
      <UserToolbar
        createLabel="Ro'l qo'shish"
        onCreate={() => createModal.openModal()}
        filterLabel="Filtrlash"
        searchQuery=""
        searchPlaceholder="Ro'llarni qidirish"
        onSearch={() => console.log("search")}
      />

      <DataTable
        columns={[
          {
            header: "ID",
            accessorKey: "id",
            cell: ({ row }) => (
              <Badge
                variant="outline"
                onClick={() => handleCopyToClipboard(row.original.id, "ID")}
                className="truncate cursor-pointer"
              >
                {row.original.id.slice(0, 20)}...
              </Badge>
            ),
          },
          { header: "Nomi", accessorKey: "name" },
          { header: "Tavsifi", accessorKey: "description" },
          {
            header: "Ruxsatlar",
            accessorKey: "permissions",
            cell: ({ row }) => {
              const permissions = row.original.permissions;
              return (
                <div className="max-w-[200px]">
                  {permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {permissions.slice(0, 3).map((permission) => (
                        <span
                          key={permission.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {permission.name}
                        </span>
                      ))}
                      {permissions.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{permissions.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Ruxsat yo'q</span>
                  )}
                </div>
              );
            },
          },
          {
            header: "Foydalanuvchilar",
            accessorKey: "users",
            cell: ({ row }) => (
              <div className="text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {row.original.users}
                </span>
              </div>
            ),
          },
          {
            header: "Harakatlar",
            accessorKey: "actions",
            cell: ({ row }) => {
              const role = row.original;

              const actions: ActionItem[] = [
                createViewAction(() => console.log("view", role.id)),
                createEditAction(() => handleUpdate(role)),
                createCopyAction(() => console.log("copy", role.id)),
                createDeleteAction(() => {
                  deleteModal.openModal();
                  setSelectedRole(role);
                }),
              ];

              return <CustomAction actions={actions} />;
            },
          },
        ]}
        data={data?.data || []}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalCount={data?.count || 0}
        currentPage={pageNumber}
      />
      <CustomModal
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
        description="Ro'lni ochirgandan so'ng qaytarib bo'lmaydi rozimisiz?"
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={() => {
          handleDelete(selectedRole?.id || "");
          deleteModal.closeModal();
        }}
      />
      <CustomModal
        closeOnOverlayClick={false}
        title="Rol tahrirlash"
        description="Rol tahrirlash uchun maydonlarni to'ldiring"
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
      >
        <RoleForm mode="edit" role={selectedRole} modal={editModal} />
      </CustomModal>
    </>
  );
};

export default RolesPage;
