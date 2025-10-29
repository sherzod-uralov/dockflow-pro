import { DataPagination } from "@/types/global.types";
import { ModalState } from "@/types/modal";

// ============================================
// ENUMS & CONSTANTS
// ============================================

export enum WorkflowType {
  CONSECUTIVE = "Ketma-ket",
  PARALLEL = "Parallel",
}

export type WorkflowStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | "DRAFT";
export type WorkflowStepStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED";
export type WorkflowActionType = "APPROVAL" | "REVIEW" | "SIGN" | "NOTIFY";

// ============================================
// API RESPONSE TYPES
// ============================================

// Информация о документе (вложенная)
export type DocumentInfo = {
  id: string;
  title: string;
  description: string;
  documentNumber: string;
  version: number;
};

// Назначенный пользователь (вложенная)
export type AssignedUser = {
  id: string;
  fullname: string;
  username: string;
};

// Действие, выполненное над WorkflowStep
export type WorkflowStepAction = {
  id: string;
  workflowStepId: string;
  actionType: "APPROVED" | "REJECTED" | "REVIEWED" | "SIGNED" | "NOTIFIED";
  performedByUserId: string;
  performedBy?: AssignedUser;
  comment: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

// WorkflowStep с полными данными (как приходит из API)
export type WorkflowStepApiResponse = {
  id: string;
  order: number;
  status: WorkflowStepStatus;
  actionType: WorkflowActionType;
  workflowId: string;
  assignedToUserId: string;
  assignedToUser?: AssignedUser; // ✨ Опциональное (если API не возвращает expanded данные)
  startedAt: string | null;
  completedAt: string | null;
  dueDate: string | null; // ✨ Опциональное
  isRejected: boolean;
  rejectionReason: string | null;
  rejectedAt: string | null;
  actions?: WorkflowStepAction[]; // ✨ История действий
  createdAt: string;
  updatedAt: string;
};

// Workflow с полными данными (как приходит из API)
export type WorkflowApiResponse = {
  id: string;
  documentId: string;
  currentStepOrder: number;
  status: WorkflowStatus;
  workflowType?: WorkflowType; // ⚠️ Опциональное - backend пока не поддерживает это поле
  document: DocumentInfo;
  workflowSteps: WorkflowStepApiResponse[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

// ============================================
// FORM TYPES (для создания/редактирования)
// ============================================

// Данные одного step для формы (плоская структура)
// ✨ ОБНОВЛЕНО: вернули dueDate как опциональное
export type WorkflowStepFormData = {
  id?: string; // ✨ ID существующего step (только для edit режима)
  assignedToUserId: string;
  dueDate?: string | null; // Опциональное поле
};

// Данные для обновления workflow step
export type WorkflowStepUpdateType = {
  order?: number;
  status?: WorkflowStepStatus;
  actionType?: WorkflowActionType;
  assignedToUserId?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  dueDate?: string | null;
  isRejected?: boolean;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
};

// Данные для отклонения workflow step
export type WorkflowStepRejectPayload = {
  comment?: string; // Причина отклонения (опционально)
};

// Список задач пользователя (workflow steps)
export interface MyTasksResponse extends DataPagination {
  data: Array<
    WorkflowStepApiResponse & {
      workflow?: {
        id: string;
        document: DocumentInfo;
      };
    }
  >;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Параметры запроса для моих задач (workflow steps текущего пользователя)
export interface MyTasksQueryParams {
  status?: WorkflowStepStatus; // Фильтр по статусу step
  actionType?: WorkflowActionType; // Фильтр по типу действия
  page?: number;
  limit?: number;
}

// Данные workflow для формы (плоская структура)
// ✨ Общий actionType остается (все steps имеют одинаковый)
export type WorkflowFormData = {
  documentId: string;
  actionType: WorkflowActionType; // Общий для всех steps
  workflowType: WorkflowType; // Тип выполнения workflow
  steps: WorkflowStepFormData[];
};

// ============================================
// LIST & PAGINATION
// ============================================

export interface WorkflowListResponse extends DataPagination {
  data: WorkflowApiResponse[];
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface WorkflowQueryParams {
  documentId?: string; // ✨ Filter by document ID
  status?: WorkflowStatus; // ✨ Filter by status
  page?: number; // ✨ ИЗМЕНЕНО: было pageNumber
  limit?: number; // ✨ ИЗМЕНЕНО: было pageSize
}

// ============================================
// COMPONENT PROPS
// ============================================

export type WorkflowFormProps = {
  modal: ModalState;
  mode: "create" | "edit";
  workflow?: WorkflowApiResponse;
  onSuccess?: () => void;
};

// ============================================
// LEGACY SUPPORT (для обратной совместимости)
// ============================================

export interface Workflow {
  id?: string;
  name: string;
}

export interface GetAllWorkflows extends DataPagination {
  data: Workflow[];
}
