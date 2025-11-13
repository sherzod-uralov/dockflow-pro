"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { usePagination } from "@/hooks/use-pagination";
import { ModalState } from "@/types/modal";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { WorkflowApiResponse } from "@/features/workflow/type/workflow.type";

import {
  useDeleteWorkflow,
  useGetAllWorkflows,
} from "@/features/workflow/hook/workflow.hook";
import WorkflowForm from "@/features/workflow/component/workflow.form";
import TaskCard from "@/features/workflow/component/task-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

const WorkflowPage = () => {
  const router = useRouter();
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const deleteModal: ModalState = useModal();

  const { pageNumber, pageSize, handlePageSizeChange, handlePageChange } =
    usePagination();

  const [selectedWorkflow, setSelectedWorkflow] =
    React.useState<WorkflowApiResponse | null>(null);

  const [search, debouncedSearch, setSearch] = useDebounce("", 500);

  // ✨ ИЗМЕНЕНО: Маппим параметры для Backend
  const { data, isLoading } = useGetAllWorkflows({
    documentId: debouncedSearch || undefined, // search → documentId
    page: pageNumber, // pageNumber → page
    limit: pageSize, // pageSize → limit
  });
  console.log(data);
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
        <h3 className="text-lg font-semibold mb-2">Workflow topilmadi</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Hozircha hech qanday workflow mavjud emas. Yangi workflow yaratish
          uchun yuqoridagi tugmani bosing.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <>
      <UserToolbar
        createLabel="Workflow yaratish"
        onCreate={() => createModal.openModal()}
        filterLabel="Filtrlash"
        searchPlaceholder="Workflow qidirish"
        searchQuery={search}
        onSearch={setSearch}
      />

      {/* Create Modal */}
      <CustomModal
        size="3xl"
        closeOnOverlayClick={false}
        title="Workflow yaratish"
        description="Hujjat uchun workflow yarating va bosqichlarni belgilang"
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      >
        <WorkflowForm modal={createModal} mode="create" />
      </CustomModal>

      {/* Edit Modal */}
      {selectedWorkflow && (
        <CustomModal
          size="3xl"
          closeOnOverlayClick={false}
          title="Workflow tahrirlash"
          description="Workflow ma'lumotlarini o'zgartirish"
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

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
      />

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Bu yerda barcha workflow lar ko'rsatilgan. Har bir workflow ning
          joriy bosqichini ko'rish va boshqarish mumkin.
        </AlertDescription>
      </Alert>

      {/* Workflows Grid */}
      {isLoading ? (
        renderSkeleton()
      ) : !data || data.data.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((workflow) => {
              // Находим текущий шаг workflow
              const currentStep = workflow.workflowSteps.find(
                (step) => step.order === workflow.currentStepOrder,
              );

              if (!currentStep) return null;

              // Адаптируем данные для TaskCard
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
                  onActionComplete={() => {
                    // Обновляем список workflows после действия
                  }}
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

          {/* Pagination Info */}
          {data.count > pageSize && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Jami: {data.count} ta workflow
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
