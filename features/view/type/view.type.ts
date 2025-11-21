import { WorkflowActionType, WorkflowStepStatus, WorkflowStatus } from "@/features/workflow/type/workflow.type";

export interface DocumentTypeInfo {
  id: string;
  name: string;
}

export interface CreatedByInfo {
  id: string;
  fullname: string;
}

export interface WorkflowStepActionInfo {
  id: string;
  actionType: string;
  performedBy: {
    id: string;
    fullname: string;
    username: string;
  };
  comment: string | null;
  createdAt: string;
}

export interface WorkflowStepInfo {
  id: string;
  order: number;
  status: WorkflowStepStatus;
  actionType: WorkflowActionType;
  assignedToUser: {
    id: string;
    fullname: string;
    username: string;
  };
  startedAt: string | null;
  completedAt: string | null;
  dueDate: string | null;
  isRejected: boolean;
  rejectionReason: string | null;
  rejectedAt: string | null;
  actions: WorkflowStepActionInfo[];
}

export interface WorkflowInfo {
  id: string;
  status: WorkflowStatus;
  currentStepOrder: number;
  workflowType: string;
  workflowSteps: WorkflowStepInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVerifyResponse {
  id: string;
  title: string;
  description: string;
  documentNumber: string;
  version: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | "APPROVED" | "PENDING" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  documentType: DocumentTypeInfo;
  createdBy: CreatedByInfo;
  createdAt: string;
  workflow: WorkflowInfo | null;
}
