"use client";
import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import PermissionCreateModal from "../component/permission.create.modal";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { ModalState } from "@/types/modal";
import { useGetAllPermissions } from "../hook/permission.hook";
import { DataTable } from "@/components/shared/ui/custom-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { useState } from "react";

const PermissionPage = () => {
  const createModal: ModalState = useModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const { data, isLoading } = useGetAllPermissions({
    name: searchQuery || undefined,
    pageSize: pageSize,
    pageNumber: pageNumber,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPageNumber(1);
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNumber(1);
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
              const handleCopy = async () => {
                try {
                  await navigator.clipboard.writeText(id);
                  toast.success("ID nusxalandi!");
                } catch (err) {
                  console.error("Clipboard xatolik:", err);
                  toast.error("ID nusxalanmadi 😔");
                }
              };
              return (
                <div className="flex w-full items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono cursor-pointer hover:bg-muted"
                    onClick={handleCopy}
                  >
                    {id.slice(0, 8)}...
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 group"
                    onClick={handleCopy}
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
          },
          {
            header: "Kalit",
            accessorKey: "key",
            cell: ({ row }) => (
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
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
        <PermissionCreateModal modal={createModal} />
      </CustomModal>
    </>
  );
};

export default PermissionPage;
