"use client";

import { useState } from "react";
import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { ModalState } from "@/types/modal";
import { DataTable } from "@/components/shared/ui/custom-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CustomAction,
  ActionItem,
  createEditAction,
  createDeleteAction,
  createCopyAction,
  createViewAction,
} from "@/components/shared/ui/custom-action";
import { useDebounce } from "@/hooks/use-debaunce";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { usePagination } from "@/hooks/use-pagination";
import {
  useGetAllWorkflowTemplates,
  useDeleteWorkflowTemplate,
} from "../hook/workflow-template.hook";
import {
  WorkflowTemplateResponse,
  WORKFLOW_TEMPLATE_TYPE_OPTIONS,
} from "../type/workflow-template.type";
import WorkflowTemplateForm from "../component/workflow-template.form";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { PlusIcon, X } from "lucide-react";

const WorkflowTemplatePage = () => {
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();
  const viewModal: ModalState = useModal();

  const { handlePageChange, handlePageSizeChange, pageNumber, pageSize } =
    usePagination();

  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplateResponse | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 500);
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<string>("");

  const { data: documentTypesData } = useGetAllDocumentTypes();

  const { data, isLoading } = useGetAllWorkflowTemplates({
    search: debouncedSearch,
    pageSize: pageSize,
    pageNumber: pageNumber,
    documentTypeId: selectedDocumentTypeId || undefined,
  });

  const deleteMutation = useDeleteWorkflowTemplate();

  const handleEdit = (item: WorkflowTemplateResponse) => {
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

  const handleViewTemplate = (item: WorkflowTemplateResponse) => {
    setSelectedTemplate(item);
    viewModal.openModal();
  };

  const handleCloseViewModal = () => {
    viewModal.closeModal();
    setSelectedTemplate(null);
  };

  const getTypeLabel = (type: string) => {
    const option = WORKFLOW_TEMPLATE_TYPE_OPTIONS.find(
      (opt) => opt.value === type,
    );
    return option?.label || type;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between gap-4 mb-4">
        <Button onClick={createModal.openModal}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Shablon qo'shish
        </Button>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none md:w-64">
            <input
              placeholder="Workflow shablonlarni qidirish..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-3 pr-3 py-2 bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="relative flex-1 md:flex-none md:w-48">
            <Select
              value={selectedDocumentTypeId || undefined}
              onValueChange={(value) => setSelectedDocumentTypeId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Hujjat turi" />
              </SelectTrigger>
              <SelectContent>
                {documentTypesData?.data?.map((type: any) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedDocumentTypeId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDocumentTypeId("")}
              title="Filtrni tozalash"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <DataTable
        loading={isLoading}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalCount={data?.count || data?.total || 0}
        currentPage={pageNumber}
        columns={[
          {
            header: "Nomi",
            accessorKey: "name",
          },
          {
            header: "Tavsif",
            accessorKey: "description",
            cell: ({ row }) => (
              <span className="text-sm text-muted-foreground line-clamp-2">
                {row.original.description}
              </span>
            ),
          },
          {
            header: "Hujjat turi",
            accessorKey: "documentType",
            cell: ({ row }) => row.original.documentType?.name || "-",
          },
          {
            header: "Workflow turi",
            accessorKey: "type",
            cell: ({ row }) => (
              <Badge variant="outline">{getTypeLabel(row.original.type)}</Badge>
            ),
          },
          {
            header: "Bosqichlar",
            accessorKey: "steps",
            cell: ({ row }) => (
              <Badge variant="secondary">
                {row.original.steps?.length || 0} ta
              </Badge>
            ),
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

      {/* Create Modal */}
      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Workflow shablon qo'shish"
        description="Yangi workflow shablonini yarating"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <WorkflowTemplateForm modal={createModal} mode="create" />
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Workflow shablonni yangilash"
        description="Workflow shablon ma'lumotlarini tahrirlang"
        isOpen={editModal.isOpen}
        onClose={handleEditModalClose}
      >
        <WorkflowTemplateForm
          modal={editModal}
          mode="update"
          workflowTemplate={selectedTemplate as WorkflowTemplateResponse}
          onSuccess={handleEditSuccess}
        />
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        closeOnOverlayClick={false}
        title="Workflow shablonni o'chirish"
        description="Ushbu shablonni o'chirgandan so'ng qaytarib bo'lmaydi. Rozimisiz?"
        onClose={deleteModal.closeModal}
        isOpen={deleteModal.isOpen}
        onConfirm={() => {
          handleDelete(selectedTemplate?.id as string);
        }}
      />

      {/* View Modal */}
      <CustomModal
        size="3xl"
        closeOnOverlayClick
        isOpen={viewModal.isOpen}
        onClose={handleCloseViewModal}
        title="Workflow shablon ma'lumotlari"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nomi
                </p>
                <p className="text-sm">{selectedTemplate.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Hujjat turi
                </p>
                <p className="text-sm">
                  {selectedTemplate.documentType?.name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Workflow turi
                </p>
                <Badge variant="outline">
                  {getTypeLabel(selectedTemplate.type)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Holati
                </p>
                <Badge
                  variant={selectedTemplate.isActive ? "default" : "secondary"}
                >
                  {selectedTemplate.isActive ? "Faol" : "Nofaol"}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Tavsif
                </p>
                <p className="text-sm">{selectedTemplate.description}</p>
              </div>
            </div>

            {selectedTemplate.steps && selectedTemplate.steps.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Bosqichlar ({selectedTemplate.steps.length} ta)
                </p>
                <div className="space-y-2">
                  {selectedTemplate.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <Badge variant="outline" className="shrink-0">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {step.assignedToUser?.fullname || "Tayinlanmagan"}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {step.actionType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CustomModal>
    </>
  );
};

export default WorkflowTemplatePage;
