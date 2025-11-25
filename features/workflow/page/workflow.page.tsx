"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { usePagination } from "@/hooks/use-pagination";
import { ModalState } from "@/types/modal";
import { WorkflowApiResponse } from "@/features/workflow/type/workflow.type";

import {
  useDeleteWorkflow,
  useGetAllWorkflows,
} from "@/features/workflow/hook/workflow.hook";
import WorkflowForm from "@/features/workflow/component/workflow.form";
import WorkflowFromTemplateForm from "@/features/workflow/component/workflow-from-template.form";
import TaskCard from "@/features/workflow/component/task-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";

const WorkflowPage = () => {
  const router = useRouter();
  const createModal: ModalState = useModal();
  const templateModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();

  const { pageNumber, pageSize, handlePageSizeChange, handlePageChange } =
    usePagination();

  const [selectedWorkflow, setSelectedWorkflow] =
    React.useState<WorkflowApiResponse | null>(null);

  const [search, debouncedSearch, setSearch] = useDebounce("", 500);

  const { data, isLoading } = useGetAllWorkflows({
    documentId: debouncedSearch || undefined,
    page: pageNumber,
    limit: pageSize,
  });
  (data);
  const deleteMutation = useDeleteWorkflow();

  const confirmDelete = () => {
    if (selectedWorkflow) {
      deleteMutation.mutate(selectedWorkflow.id, {
        onSuccess: () => {
          deleteModal.closeModal();
        },
      });
    }
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Hujjat aylanmasi topilmadi</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Hozircha hech qanday hujjat aylanmasi mavjud emas. Yangi hujjat aylanmasi yaratish
          uchun yuqoridagi tugmani bosing.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => templateModal.openModal()}
          >
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Shablondan yaratish
          </Button>
          <Button onClick={() => createModal.openModal()}>
            Hujjat aylanmasi yaratish
          </Button>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none md:w-80">
            <input
              placeholder="Hujjat aylanmasi qidirish"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-3 py-2 bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Hujjat aylanmasi yaratish"
        description="Hujjat uchun aylanma yarating va bosqichlarni belgilang"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <WorkflowForm modal={createModal} mode="create" />
      </CustomModal>

      {/* Create from Template Modal */}
      <CustomModal
        size="lg"
        closeOnOverlayClick={false}
        title="Shablondan hujjat aylanmasi yaratish"
        description="Hujjat va hujjat aylanmasi shablonini tanlang"
        isOpen={templateModal.isOpen}
        onClose={templateModal.closeModal}
      >
        <WorkflowFromTemplateForm modal={templateModal} />
      </CustomModal>

      {/* Edit Modal */}
      {selectedWorkflow && (
        <CustomModal
          size="3xl"
          closeOnOverlayClick={false}
          title="Hujjat aylanmasini tahrirlash"
          description="Hujjat aylanmasi ma'lumotlarini o'zgartirish"
          isOpen={editModal.isOpen}
          onClose={editModal.closeModal}
        >
          <WorkflowForm
            modal={editModal}
            mode="edit"
            workflow={selectedWorkflow}
          />
        </CustomModal>
      )}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
      />
      {isLoading ? (
        renderSkeleton()
      ) : !data || data.data.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {data?.data?.map((workflow) => {
              const currentStep = workflow.workflowSteps.find(
                (step) => step.order === workflow.currentStepOrder,
              );
              if (!currentStep) return null;
              const taskData = {
                ...currentStep,
                workflow: {
                  id: workflow.id,
                  documentId: workflow.document?.id || "",
                  currentStepOrder: workflow.currentStepOrder,
                  status: workflow.status,
                  document: workflow.document
                    ? {
                        id: workflow.document.id,
                        title: workflow.document.title,
                        documentNumber: workflow.document.documentNumber,
                        description: workflow.document.description || "",
                        status: workflow.status,
                        priority: "MEDIUM",
                      }
                    : undefined,
                },
              };

              return (
                <TaskCard
                  key={workflow.id}
                  task={taskData}
                  onCardClick={() => {
                    router.push(`/dashboard/workflow/${workflow.id}`);
                  }}
                  onEdit={() => {
                    setSelectedWorkflow(workflow);
                    editModal.openModal();
                  }}
                  onDelete={() => {
                    setSelectedWorkflow(workflow);
                    deleteModal.openModal();
                  }}
                  showActions={true}
                />
              );
            })}
          </div>

          {data.count > pageSize && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Jami: {data.count} ta hujjat aylanmasi
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber === 1}
                >
                  Oldingi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber * pageSize >= data.count}
                >
                  Keyingi
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default WorkflowPage;
