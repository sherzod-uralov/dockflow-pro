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
import { useState, useEffect } from "react";
import { RoleData } from "../type/role.type";
import { usePagination } from "@/hooks/use-pagination";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { useRouter, useSearchParams } from "next/navigation";
import RoleView from "../component/role-view";

const RolesPage = () => {
  const createModal = useModal();
  const deleteModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const { pageNumber, handlePageSizeChange, pageSize, handlePageChange } =
    usePagination();
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);

  const { data } = useGetRoles({
    pageSize: pageSize,
    pageNumber: pageNumber,
    search: debouncedSearch,
  });
  const deleteMutation = useDeleteRole();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleId = searchParams.get("roleId");

    if (roleId) {
      const role = data?.data?.find((r: RoleData) => r.id === roleId);

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

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
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

  return (
    <div className="space-y-6">
      <UserToolbar
        createLabel="Ro'l qo'shish"
        onCreate={() => createModal.openModal()}
        filterLabel="Filtrlash"
        searchQuery={searchQuery}
        searchPlaceholder="Ro'llarni qidirish"
        onSearch={setSearchQuery}
      />

      <DataTable
        columns={[
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
                    <div className="flex items-center gap-1">
                      {permissions.slice(0, 1).map((permission) => (
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
                createViewAction(() => handleViewRole(role)),
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
        description="Ro'lni ochirgandan so'ng qaytarib bo'lmaydi rozimisiz?"
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={() => {
          handleDelete(selectedRole?.id || "");
          deleteModal.closeModal();
        }}
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
    </div>
  );
};

export default RolesPage;
