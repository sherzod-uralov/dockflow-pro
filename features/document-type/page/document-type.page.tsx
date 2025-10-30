"use client";

import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { ModalState } from "@/types/modal";
import {
  useDeleteDocumentType,
  useGetAllDocumentTypes,
} from "../hook/document-type.hook";
import { DataTable } from "@/components/shared/ui/custom-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CustomAction,
  ActionItem,
  createViewAction,
  createEditAction,
  createDeleteAction,
  createCopyAction,
} from "@/components/shared/ui/custom-action";
import { DocumentType } from "../type/document-type.type";
import DocumentTypeFormModal from "../component/document-type.form";
import DocumentTypeView from "../component/document-type.view";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";

const DocumentTypePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();
  const viewModal: ModalState = useModal();

  const { handlePageChange, handlePageSizeChange, pageNumber, pageSize } =
    usePagination();
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<DocumentType | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);

  const { data, isLoading } = useGetAllDocumentTypes({
    search: debouncedSearch || undefined,
    pageSize: pageSize,
    pageNumber: pageNumber,
  });
  const deleteDocumentTypeMutation = useDeleteDocumentType();

  useEffect(() => {
    const documentTypeId = searchParams.get("documentTypeId");

    if (documentTypeId) {
      const documentType = data?.data?.find(
        (dt: DocumentType) => dt.id === documentTypeId,
      );

      if (documentType) {
        setSelectedDocumentType(documentType);
        viewModal.openModal();
      }
    } else {
      if (viewModal.isOpen) {
        viewModal.closeModal();
      }
    }
  }, [searchParams, data]);

  const handleViewDocumentType = (item: DocumentType) => {
    setSelectedDocumentType(item);
    viewModal.openModal();
    router.push(`?documentTypeId=${item.id}`, { scroll: false });
  };

  const handleCloseViewModal = () => {
    viewModal.closeModal();
    setSelectedDocumentType(null);
    router.push(window.location.pathname, { scroll: false });
  };

  const handleEdit = (item: DocumentType) => {
    setSelectedDocumentType(item);
    editModal.openModal();
  };

  const handleDelete = (id: string) => {
    deleteDocumentTypeMutation.mutate(id);
    deleteModal.closeModal();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEditSuccess = () => {
    setSelectedDocumentType(null);
  };

  const handleEditModalClose = () => {
    setSelectedDocumentType(null);
    editModal.closeModal();
  };

  return (
    <>
      <UserToolbar
        searchQuery={searchQuery}
        searchPlaceholder="Hujjat turini qidirish..."
        onSearch={handleSearch}
        createLabel="Hujjat turini qo'shish"
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
            header: "Nom",
            accessorKey: "name",
          },

          {
            header: "Tavsif",
            accessorKey: "description",
          },
          {
            header: "Harakatlar",
            accessorKey: "actions",
            cell: ({ row }) => {
              const item = row.original;

              const actions: ActionItem[] = [
                createViewAction(() => handleViewDocumentType(item)),
                createEditAction(() => handleEdit(item)),
                createCopyAction(() =>
                  handleCopyToClipboard(item.id || "", "ID"),
                ),
                createDeleteAction(() => {
                  setSelectedDocumentType(item);
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
        title="Hujjat turini qo'shish"
        description="Hujjat turini qo'shish uchun maydonlar to'ldirilishi kerak"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <DocumentTypeFormModal modal={createModal} mode="create" />
      </CustomModal>

      <CustomModal
        closeOnOverlayClick={false}
        title="Hujjat turini yangilash"
        description="Hujjat turini ma'lumotlarini yangilang"
        isOpen={editModal.isOpen}
        onClose={handleEditModalClose}
      >
        <DocumentTypeFormModal
          modal={editModal}
          mode="update"
          documentType={selectedDocumentType as any}
          onSuccess={handleEditSuccess}
        />
      </CustomModal>

      <ConfirmationModal
        closeOnOverlayClick={false}
        title="Hujjat turini o'chirish"
        description="Ushbu ma'lumotni o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
        onClose={deleteModal.closeModal}
        isOpen={deleteModal.isOpen}
        onConfirm={() => {
          handleDelete(selectedDocumentType?.id as string);
        }}
      />

      <CustomModal
        closeOnOverlayClick
        size="2xl"
        isOpen={viewModal.isOpen}
        onClose={handleCloseViewModal}
        title="Hujjat turi ma'lumotlari"
        description="Hujjat turi haqida to'liq ma'lumot"
      >
        <DocumentTypeView />
      </CustomModal>
    </>
  );
};

export default DocumentTypePage;
