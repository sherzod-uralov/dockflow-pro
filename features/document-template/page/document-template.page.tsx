"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  DocumentTemplateFilter,
  DocumentTemplateFilterValues,
} from "@/features/document-template";
import { DataTable } from "@/components/shared/ui/custom-table";
import { Badge } from "@/components/ui/badge";
import { FileEdit } from "lucide-react";
import {
  CustomAction,
  ActionItem,
  createEditAction,
  createDeleteAction,
  createCopyAction,
  createViewAction,
} from "@/components/shared/ui/custom-action";
import DocumentTemplateFormModal from "../component/document-template.form";
import DocumentTemplateView from "../component/document-template.view";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";

const DocumentTemplatePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();
  const viewModal: ModalState = useModal();
  const { handlePageChange, handlePageSizeChange, pageNumber, pageSize } =
    usePagination();
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplateResponse | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<DocumentTemplateFilterValues>({
    documentTypeId: undefined,
    isActive: undefined,
    isPublic: undefined,
  });

  const { data, isLoading } = useGetAllDocumentTemplates({
    search: debouncedSearch,
    pageSize: pageSize,
    pageNumber: pageNumber,
    documentTypeId: filters.documentTypeId,
    isActive: filters.isActive,
    isPublic: filters.isPublic,
  });

  const deleteMutation = useDeleteDocumentTemplate();

  useEffect(() => {
    const templateId = searchParams.get("templateId");

    if (templateId) {
      const template = data?.data?.find(
        (t: DocumentTemplateResponse) => t.id === templateId,
      );

      if (template) {
        setSelectedTemplate(template);
        viewModal.openModal();
      }
    } else {
      if (viewModal.isOpen) {
        viewModal.closeModal();
      }
    }
  }, [searchParams, data]);

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
    router.push(`/document-edit?id=${item.templateFile?.id}`);
  };

  const handleViewTemplate = (item: DocumentTemplateResponse) => {
    setSelectedTemplate(item);
    viewModal.openModal();
    router.push(`?templateId=${item.id}`, { scroll: false });
  };

  const handleCloseViewModal = () => {
    viewModal.closeModal();
    setSelectedTemplate(null);
    router.push(window.location.pathname, { scroll: false });
  };

  const handleApplyFilters = (newFilters: DocumentTemplateFilterValues) => {
    setFilters(newFilters);
  };

  const handleToggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  return (
    <>
      <UserToolbar
        searchQuery={searchQuery}
        searchPlaceholder="Shablonlarni qidirish..."
        onSearch={handleSearch}
        createLabel="Shablon qo'shish"
        onCreate={createModal.openModal}
        filterLabel="Filtrlash"
        onFilter={() => handleToggleFilter()}
      />

      <DocumentTemplateFilter
        isOpen={isFilterOpen}
        onToggle={handleToggleFilter}
        filters={filters}
        onApplyFilters={handleApplyFilters}
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
                createViewAction(() => handleViewTemplate(item)),
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
        size="3xl"
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

      <CustomModal
        closeOnOverlayClick
        isOpen={viewModal.isOpen}
        onClose={handleCloseViewModal}
        title="Shablon ma'lumotlari"
      >
        <DocumentTemplateView />
      </CustomModal>
    </>
  );
};

export default DocumentTemplatePage;
