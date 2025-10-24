"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import { ModalState } from "@/types/modal";
import {
  useDeleteDocumentTemplate,
  useGetAllDocumentTemplates,
  DocumentTemplateResponse,
} from "@/features/document-template";
import { DataTable } from "@/components/shared/ui/custom-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, FileEdit } from "lucide-react";
import {
  CustomAction,
  ActionItem,
  createEditAction,
  createDeleteAction,
  createCopyAction,
} from "@/components/shared/ui/custom-action";
import DocumentTemplateFormModal from "../component/document-template.form";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";
import { createDocumentEditUrl } from "@/utils/url-helper";
import { toast } from "sonner";
import Cookies from "js-cookie";

const DocumentTemplatePage = () => {
  const router = useRouter();
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();
  const { handlePageChange, handlePageSizeChange, pageNumber, pageSize } =
    usePagination();
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplateResponse | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);

  const { data, isLoading } = useGetAllDocumentTemplates({
    search: debouncedSearch,
    pageSize: pageSize,
    pageNumber: pageNumber,
  });

  const deleteMutation = useDeleteDocumentTemplate();

  const handleEdit = (item: DocumentTemplateResponse) => {
    setSelectedTemplate(item);
    editModal.openModal();
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    deleteModal.closeModal();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEditSuccess = () => {
    setSelectedTemplate(null);
  };

  const handleEditModalClose = () => {
    setSelectedTemplate(null);
    editModal.closeModal();
  };

  const handleEditDocument = (item: DocumentTemplateResponse) => {
    if (!item.templateFile?.fileUrl) {
      toast.error("Hujjat fayli topilmadi");
      return;
    }

    const editUrl = createDocumentEditUrl(
      item.templateFile.fileUrl,
      item.id,
      Cookies.get("accessToken") || "",
    );

    router.push(editUrl);
  };

  return (
    <>
      <UserToolbar
        searchQuery={searchQuery}
        searchPlaceholder="Shablonlarni qidirish..."
        onSearch={handleSearch}
        createLabel="Shablon qo'shish"
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
            header: "Nomi",
            accessorKey: "name",
          },
          {
            header: "Tavsif",
            accessorKey: "description",
          },
          {
            header: "Hujjat turi",
            accessorKey: "documentType",
            cell: ({ row }) => row.original.documentType.name,
          },
          {
            header: "Fayl",
            accessorKey: "templateFile",
            cell: ({ row }) => {
              const file = row.original.templateFile;
              return file ? (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{file.fileName}</span>
                  <span className="text-xs text-muted-foreground">
                    {file.fileSize}
                  </span>
                </div>
              ) : (
                <Badge variant="secondary">Fayl yo'q</Badge>
              );
            },
          },
          {
            header: "Holati",
            accessorKey: "isActive",
            cell: ({ row }) => (
              <Badge variant={row.original.isActive ? "default" : "secondary"}>
                {row.original.isActive ? "Faol" : "Nofaol"}
              </Badge>
            ),
          },
          {
            header: "Ommaviy",
            accessorKey: "isPublic",
            cell: ({ row }) => (
              <Badge variant={row.original.isPublic ? "default" : "outline"}>
                {row.original.isPublic ? "Ha" : "Yo'q"}
              </Badge>
            ),
          },
          {
            header: "Harakatlar",
            accessorKey: "actions",
            cell: ({ row }) => {
              const item = row.original;

              const actions: ActionItem[] = [
                {
                  label: "Hujjatni tahrirlash",
                  icon: FileEdit,
                  onClick: () => handleEditDocument(item),
                  variant: "default",
                  disabled: !item.templateFile?.fileUrl,
                  id: "",
                },
                createEditAction(() => handleEdit(item)),
                createCopyAction(() => handleCopyToClipboard(item.id, "ID")),
                createDeleteAction(() => {
                  setSelectedTemplate(item);
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
        title="Shablon qo'shish"
        description="Yangi hujjat shablonini yarating"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <DocumentTemplateFormModal modal={createModal} mode="create" />
      </CustomModal>

      <CustomModal
        closeOnOverlayClick={false}
        title="Shablonni yangilash"
        description="Shablon ma'lumotlarini tahrirlang"
        isOpen={editModal.isOpen}
        onClose={handleEditModalClose}
      >
        <DocumentTemplateFormModal
          modal={editModal}
          mode="update"
          documentTemplate={selectedTemplate as any}
          onSuccess={handleEditSuccess}
        />
      </CustomModal>

      <ConfirmationModal
        closeOnOverlayClick={false}
        title="Shablonni o'chirish"
        description="Ushbu shablonni o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
        onClose={deleteModal.closeModal}
        isOpen={deleteModal.isOpen}
        onConfirm={() => {
          handleDelete(selectedTemplate?.id as string);
        }}
      />
    </>
  );
};

export default DocumentTemplatePage;
