import { DataPagination } from "@/types/global.types";

// ============================================
// ENUMS
// ============================================

export enum WorkflowTemplateType {
  CONSECUTIVE = "CONSECUTIVE",
  PARALLEL = "PARALLEL",
}

export enum WorkflowTemplateActionType {
  APPROVAL = "APPROVAL",
  REVIEW = "REVIEW",
  SIGN = "SIGN",
  QR_CODE = "QR_CODE",
  ACKNOWLEDGE = "ACKNOWLEDGE",
}

export const WORKFLOW_TEMPLATE_TYPE_OPTIONS = [
  {
    value: WorkflowTemplateType.CONSECUTIVE,
    label: "Ketma-ket",
    description: "Har bir bosqich oldingi bosqich tugaganidan keyin boshlanadi",
  },
  {
    value: WorkflowTemplateType.PARALLEL,
    label: "Parallel",
    description: "Barcha bosqichlar bir vaqtning o'zida bajariladi",
  },
] as const;

export const ACTION_TYPE_OPTIONS = [
  {
    value: WorkflowTemplateActionType.APPROVAL,
    label: "Tasdiqlash",
    description: "Hujjatni tasdiqlash jarayoni",
  },
  {
    value: WorkflowTemplateActionType.REVIEW,
    label: "Ko'rib chiqish",
    description: "Hujjatni ko'rib chiqish",
  },
  {
    value: WorkflowTemplateActionType.SIGN,
    label: "Imzolash",
    description: "Hujjatga imzo qo'yish",
  },
  {
    value: WorkflowTemplateActionType.QR_CODE,
    label: "QR kod qo'shish",
    description: "Hujjatga QR kod va izohlar qo'shish",
  },
  {
    value: WorkflowTemplateActionType.ACKNOWLEDGE,
    label: "Tanishish",
    description: "Hujjat bilan tanishish",
  },
] as const;

// ============================================
// STEP TYPES
// ============================================

export interface WorkflowTemplateStepResponse {
  id: string;
  order: number;
  actionType: WorkflowTemplateActionType;
  assignedToUser?: {
    id: string;
    fullname: string;
    username: string;
  };
  assignedToRole?: {
    id: string;
    name: string;
  };
  assignedToDepartment?: {
    id: string;
    name: string;
  };
  dueInDays: number;
  description: string;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTemplateStepPayload {
  order: number;
  actionType: WorkflowTemplateActionType;
  assignedToUserId?: string;
}

// ============================================
// WORKFLOW TEMPLATE RESPONSE
// ============================================

export interface WorkflowTemplateResponse {
  id: string;
  name: string;
  description: string;
  documentType: {
    id: string;
    name: string;
  };
  type: WorkflowTemplateType;
  isActive: boolean;
  isPublic: boolean;
  steps: WorkflowTemplateStepResponse[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LIST & PAGINATION
// ============================================

export interface GetAllWorkflowTemplates extends DataPagination {
  data: WorkflowTemplateResponse[];
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface WorkflowTemplateQueryParams {
  search?: string;
  documentTypeId?: string;
  type?: WorkflowTemplateType;
  isActive?: boolean;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  pageNumber?: number;
  pageSize?: number;
}

// ============================================
// CREATE & UPDATE PAYLOADS
// ============================================

export interface WorkflowTemplateCreatePayload {
  name: string;
  description: string;
  documentTypeId: string;
  type: WorkflowTemplateType;
  isActive?: boolean;
  isPublic?: boolean;
  steps: WorkflowTemplateStepPayload[];
}

export interface WorkflowTemplateUpdatePayload {
  name?: string;
  description?: string;
  documentTypeId?: string;
  type?: WorkflowTemplateType;
  isActive?: boolean;
  isPublic?: boolean;
  steps?: WorkflowTemplateStepPayload[];
}

// ============================================
// FILTER VALUES
// ============================================

export interface WorkflowTemplateFilterValues {
  documentTypeId?: string;
  type?: WorkflowTemplateType;
  isActive?: boolean;
  isPublic?: boolean;
}
