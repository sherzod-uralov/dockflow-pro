"use client";

import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { ModalState } from "@/types/modal";
import {
  useDeleteDocument,
  useGetAllDocuments,
} from "../hook/document.hook";
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
import { Document } from "../type/document.type";
import DocumentFormModal from "../component/document.form";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";

const DocumentPage = () => {
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();

  const { handlePageChange, handlePageSizeChange, pageNumber, pageSize } =
    usePagination();
  const [selectedDocument, setSelectedDocument] =
    useState<Document | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);

  const { data, isLoading } = useGetAllDocuments({
    search: debouncedSearch || undefined,
    pageSize: pageSize,
    pageNumber: pageNumber,
  });
  const deleteDocumentMutation = useDeleteDocument();

  const handleEdit = (item: Document) => {
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
                <div className="flex w-full items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono cursor-pointer hover:bg-muted"
                    onClick={() => handleCopyToClipboard(id, "ID")}
                  >
                    {id?.slice(0, 8)}...
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
        closeOnOverlayClick={false}
        title="Document qo'shish"
        description="Document qo'shish uchun maydonlar to'ldirilishi kerak"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <DocumentFormModal modal={createModal} mode="create" />
      </CustomModal>

      <CustomModal
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
