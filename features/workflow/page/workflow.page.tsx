"use client";
import React from "react";
import { UserToolbar } from "@/components/shared/ui/custom-dashboard-toolbar";
import {
  ConfirmationModal,
  CustomModal,
  useModal,
} from "@/components/shared/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { usePagination } from "@/hooks/use-pagination";
import { ModalState } from "@/types/modal";
import { DataTable } from "@/components/shared/ui/custom-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  ActionItem,
  createCopyAction,
  createDeleteAction,
  createEditAction,
  createViewAction,
  CustomAction,
} from "@/components/shared/ui/custom-action";
import { handleCopyToClipboard } from "@/utils/copy-text";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileSearch, FileSignature, Bell } from "lucide-react";
import { WorkflowApiResponse } from "@/features/workflow/type/workflow.type";

import {
  useDeleteWorkflow,
  useGetAllWorkflows,
} from "@/features/workflow/hook/workflow.hook";
import WorkflowForm from "@/features/workflow/component/workflow.form";
import WorkflowView from "@/features/workflow/component/workflow.view";

const WorkflowPage = () => {
  const createModal: ModalState = useModal();
  const editModal: ModalState = useModal();
  const viewModal: ModalState = useModal();
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

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      ACTIVE: "default",
      COMPLETED: "secondary",
      CANCELLED: "destructive",
      DRAFT: "outline",
    };

    const labels: Record<string, string> = {
      ACTIVE: "Faol",
      COMPLETED: "Tugallangan",
      CANCELLED: "Bekor qilingan",
      DRAFT: "Qoralama",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  // ✨ НОВОЕ: Helper для отображения ActionType
  const getActionTypeBadge = (actionType: string) => {
    const config: Record<
      string,
      {
        label: string;
        icon: any;
        color: string;
      }
    > = {
      APPROVAL: {
        label: "Tasdiqlash",
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800 border-green-300",
      },
      REVIEW: {
        label: "Ko'rib chiqish",
        icon: FileSearch,
        color: "bg-blue-100 text-blue-800 border-blue-300",
      },
      SIGN: {
        label: "Imzolash",
        icon: FileSignature,
        color: "bg-purple-100 text-purple-800 border-purple-300",
      },
      NOTIFY: {
        label: "Xabarnoma",
        icon: Bell,
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      },
    };

    const item = config[actionType] || config.APPROVAL;
    const Icon = item.icon;

    return (
      <Badge
        variant="outline"
        className={`${item.color} flex items-center gap-1.5 w-fit`}
      >
        <Icon className="h-3 w-3" />
        {item.label}
      </Badge>
    );
  };

  const columns: ColumnDef<WorkflowApiResponse>[] = [
    {
      accessorKey: "document.title",
      header: "Hujjat",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.document.title}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.document.documentNumber}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Holat",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      // ✨ НОВАЯ КОЛОНКА: ActionType
      id: "actionType",
      accessorKey: "workflowSteps",
      header: "Amal turi",
      cell: ({ row }) => {
        // Берем actionType из первого step (все одинаковые)
        const actionType = row.original.workflowSteps[0]?.actionType;
        return actionType ? (
          getActionTypeBadge(actionType)
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "currentStepOrder",
      header: "Joriy bosqich",
      cell: ({ row }) => (
        <span className="font-mono">
          {row.original.currentStepOrder} / {row.original.workflowSteps.length}
        </span>
      ),
    },
    {
      id: "stepsCount",
      accessorKey: "workflowSteps",
      header: "Bosqichlar soni",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.workflowSteps.length} ta bosqich
        </Badge>
      ),
    },
    {
      header: "Harakatlar",
      id: "actions",
      cell: ({ row }) => {
        const workflow = row.original;
        const actions: ActionItem[] = [
          createViewAction(() => {
            setSelectedWorkflow(workflow);
            viewModal.openModal();
          }),
          createEditAction(() => {
            setSelectedWorkflow(workflow);
            editModal.openModal();
          }),
          createCopyAction(() => handleCopyToClipboard(workflow.id, "ID")),
          createDeleteAction(() => {
            setSelectedWorkflow(workflow);
            deleteModal.openModal();
          }),
        ];

        return <CustomAction actions={actions} />;
      },
    },
  ];

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

      {/* View Modal */}
      {selectedWorkflow && (
        <CustomModal
          size="3xl"
          title="Workflow haqida ma'lumot"
          description="Workflow va uning bosqichlari"
          isOpen={viewModal.isOpen}
          onClose={viewModal.closeModal}
        >
          <WorkflowView
            workflow={selectedWorkflow}
            onClose={viewModal.closeModal}
          />
        </CustomModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
      />

      {/* Data Table */}
      <DataTable
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalCount={data?.count || 0}
        currentPage={pageNumber}
        columns={columns}
        data={data ? data.data : []}
      />
    </>
  );
};

export default WorkflowPage;
