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
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CustomAction,
  ActionItem,
  createEditAction,
  createDeleteAction,
  createCopyAction,
  createViewAction,
} from "@/components/shared/ui/custom-action";
import { DocumentGetResponse } from "@/features/document/type/document.type";
import DocumentFormModal from "../component/document.form";
import DocumentView from "../component/document.view";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";
import { useDeleteDocument, useGetAllDocuments } from "@/features/document";
import { Badge } from "@/components/ui/badge";

const DocumentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();
  const viewModal: ModalState = useModal();

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

  useEffect(() => {
    const documentId = searchParams.get("documentId");

    if (documentId) {
      const document = data?.data?.find(
        (d: DocumentGetResponse) => d.id === documentId,
      );

      if (document) {
        setSelectedDocument(document);
        viewModal.openModal();
      }
    } else {
      if (viewModal.isOpen) {
        viewModal.closeModal();
      }
    }
  }, [searchParams, data]);

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

  const handleViewDocument = (item: DocumentGetResponse) => {
    setSelectedDocument(item);
    viewModal.openModal();
    router.push(`?documentId=${item.id}`, { scroll: false });
  };

  const handleCloseViewModal = () => {
    viewModal.closeModal();
    setSelectedDocument(null);
    router.push(window.location.pathname, { scroll: false });
  };

  return (
    <>
      <UserToolbar
        searchQuery={searchQuery}
        searchPlaceholder="Hujjatlarni qidirish..."
        onSearch={handleSearch}
        createLabel="Hujjat qo'shish"
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
                createViewAction(() => handleViewDocument(item)),
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
        title="Hujjat qo'shish"
        description="Hujjat qo'shish uchun maydonlar to'ldirilishi kerak"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <DocumentFormModal modal={createModal} mode="create" />
      </CustomModal>

      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Hujjatni yangilash"
        description="Hujjat ma'lumotlarini yangilang"
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
        title="Hujjatni o'chirish"
        description="Ushbu ma'lumotni o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
        onClose={deleteModal.closeModal}
        isOpen={deleteModal.isOpen}
        onConfirm={() => {
          handleDelete(selectedDocument?.id as string);
        }}
      />

      <CustomModal
        size="2xl"
        closeOnOverlayClick
        isOpen={viewModal.isOpen}
        onClose={handleCloseViewModal}
        title="Hujjat ma'lumotlari"
      >
        <DocumentView />
      </CustomModal>
    </>
  );
};

export default DocumentPage;
