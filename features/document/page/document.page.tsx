"use client";

import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { ModalState } from "@/types/modal";
import { DataTable } from "@/components/shared/ui/custom-table";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";
import {
  CustomAction,
  ActionItem,
  createEditAction,
  createDeleteAction,
  createCopyAction,
} from "@/components/shared/ui/custom-action";
import { DocumentGetResponse } from "@/features/document/type/document.type";
import DocumentFormModal from "../component/document.form";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";
import { useDeleteDocument, useGetAllDocuments } from "@/features/document";
import { Badge } from "@/components/ui/badge";

const DocumentPage = () => {
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();

  const { handlePageChange, handlePageSizeChange, pageNumber, pageSize } =
    usePagination();
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentGetResponse | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);

  const { data, isLoading } = useGetAllDocuments({
    search: debouncedSearch || undefined,
    pageSize: pageSize,
    pageNumber: pageNumber,
  });
  const deleteDocumentMutation = useDeleteDocument();

  const handleEdit = (item: DocumentGetResponse) => {
    setSelectedDocument(item);
    editModal.openModal();
  };

  const handleDelete = (id: string) => {
    deleteDocumentMutation.mutate(id);
    deleteModal.closeModal();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEditSuccess = () => {
    setSelectedDocument(null);
  };

  const handleEditModalClose = () => {
    setSelectedDocument(null);
    editModal.closeModal();
  };

  return (
    <>
      <UserToolbar
        searchQuery={searchQuery}
        searchPlaceholder="Documentlarni qidirish..."
        onSearch={handleSearch}
        createLabel="Document qo'shish"
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
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono cursor-pointer hover:bg-muted"
                    onClick={() => handleCopyToClipboard(id as string, "ID")}
                  >
                    {id?.slice(0, 8)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 group"
                    onClick={() => handleCopyToClipboard(id as string, "ID")}
                  >
                    <Copy className="h-3 w-3 group-hover:text-text-on-dark" />
                  </Button>
                </div>
              );
            },
          },
          {
            header: "Sarlavha",
            accessorKey: "title",
          },
          {
            header: "Holati",
            accessorKey: "status",
            cell: ({ row }) => {
              const status = row.original.status;
              return (
                <Badge
                  //@ts-ignore
                  variant={
                    status === "PUBLISHED"
                      ? "success"
                      : status === "DRAFT"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {status}
                </Badge>
              );
            },
          },
          {
            header: "Muhimlik",
            accessorKey: "priority",
            cell: ({ row }) => {
              const priority = row.original.priority;
              return (
                <Badge
                  //@ts-ignore
                  variant={
                    priority === "HIGH"
                      ? "destructive"
                      : priority === "MEDIUM"
                        ? "warning"
                        : "default"
                  }
                >
                  {priority}
                </Badge>
              );
            },
          },
          {
            header: "Harakatlar",
            accessorKey: "actions",
            cell: ({ row }) => {
              const item = row.original;

              const actions: ActionItem[] = [
                createEditAction(() => handleEdit(item)),
                createCopyAction(() =>
                  handleCopyToClipboard(item.id || "", "ID"),
                ),
                createDeleteAction(() => {
                  setSelectedDocument(item);
                  deleteModal.openModal();
                }),
              ];

              return <CustomAction actions={actions} />;
            },
          },
        ]}
        data={data?.data || []}
      />

      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Document qo'shish"
        description="Document qo'shish uchun maydonlar to'ldirilishi kerak"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <DocumentFormModal modal={createModal} mode="create" />
      </CustomModal>

      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Documentni yangilash"
        description="Document ma'lumotlarini yangilang"
        isOpen={editModal.isOpen}
        onClose={handleEditModalClose}
      >
        <DocumentFormModal
          modal={editModal}
          mode="update"
          document={selectedDocument as any}
          onSuccess={handleEditSuccess}
        />
      </CustomModal>

      <ConfirmationModal
        closeOnOverlayClick={false}
        title="Documentni o'chirish"
        description="Ushbu ma'lumotni o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
        onClose={deleteModal.closeModal}
        isOpen={deleteModal.isOpen}
        onConfirm={() => {
          handleDelete(selectedDocument?.id as string);
        }}
      />
    </>
  );
};

export default DocumentPage;
