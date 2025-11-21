import { DataPagination } from "@/types/global.types";
import { ModalState } from "@/types/modal";

export enum WorkflowType {
  CONSECUTIVE = "Ketma-ket",
  PARALLEL = "Parallel",
}

export enum WorkflowStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  DRAFT = "DRAFT",
}

export enum WorkflowStepStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

export enum WorkflowActionType {
  APPROVAL = "APPROVAL",
  REVIEW = "REVIEW",
  SIGN = "SIGN",
  QR_CODE = "QR_CODE",
  ACKNOWLEDGE = "ACKNOWLEDGE",
}

export const ACTION_TYPE_OPTIONS = [
  {
    value: WorkflowActionType.APPROVAL,
    label: "Tasdiqlash",
    description: "Hujjatni tasdiqlash jarayoni",
  },
  {
    value: WorkflowActionType.REVIEW,
    label: "Ko'rib chiqish",
    description: "Hujjatni ko'rib chiqish",
  },
  {
    value: WorkflowActionType.SIGN,
    label: "Imzolash",
    description: "Hujjatga imzo qo'yish",
  },
  {
    value: WorkflowActionType.QR_CODE,
    label: "QR kod qo'shish",
    description: "Hujjatga QR kod va izohlar qo'shish",
  },
  {
    value: WorkflowActionType.ACKNOWLEDGE,
    label: "Tanishish",
    description: "Hujjat bilan tanishish",
  },
] as const;

export const WORKFLOW_TYPE_OPTIONS = [
  {
    value: WorkflowType.CONSECUTIVE,
    label: "Ketma-ket",
    description: "Har bir bosqich oldingi bosqich tugaganidan keyin boshlanadi",
  },
  {
    value: WorkflowType.PARALLEL,
    label: "Parallel",
    description: "Barcha bosqichlar bir vaqtning o'zida bajariladi",
  },
] as const;

export type DocumentInfo = {
  id: string;
  title: string;
  description: string;
  documentNumber: string;
  version: number;
};

export type AssignedUser = {
  id: string;
  fullname: string;
  username: string;
};

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

export type WorkflowStepApiResponse = {
  id: string;
  order: number;
  status: WorkflowStepStatus;
  actionType: WorkflowActionType;
  workflowId: string;
  assignedToUserId: string;
  assignedToUser?: AssignedUser;
  startedAt: string | null;
  completedAt: string | null;
  dueDate: string | null;
  isRejected: boolean;
  rejectionReason: string | null;
  rejectedAt: string | null;
  actions?: WorkflowStepAction[];
  createdAt: string;
  updatedAt: string;
};

export type WorkflowApiResponse = {
  type: string;
  id: string;
  documentId: string;
  currentStepOrder: number;
  status: WorkflowStatus;
  workflowType?: WorkflowType;
  document: DocumentInfo;
  workflowSteps: WorkflowStepApiResponse[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type WorkflowStepFormData = {
  id?: string;
  assignedToUserId: string;
  actionType: WorkflowActionType;
};

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

export type WorkflowStepRejectPayload = {
  rejectionReason: string;
  comment?: string;
  rollbackToUserId?: string;
};

export type RollbackUser = {
  userId: string;
  userName: string;
  username?: string;
  userEmail?: string;
  userRole?: string;
  stepOrder: number;
  stepActionType: string;
  stepStatus: string;
};

export type WorkflowStepsValidation = {
  isValid: boolean;
  error?: string;
  userIds: string[];
};

export function validateAndExtractUserIds(
  workflow: WorkflowApiResponse | undefined | null,
): WorkflowStepsValidation {
  if (!workflow) {
    return {
      isValid: false,
      error: "Workflow недоступен",
      userIds: [],
    };
  }

  if (!workflow.workflowSteps || workflow.workflowSteps.length === 0) {
    return {
      isValid: false,
      error: "Нет доступных шагов workflow для отклонения",
      userIds: [],
    };
  }

  const userIds = workflow.workflowSteps
    .filter((step) => step.assignedToUserId != null)
    .map((step) => step.assignedToUserId);

  if (userIds.length === 0) {
    return {
      isValid: false,
      error: "Ни одному пользователю не назначен workflow",
      userIds: [],
    };
  }

  return {
    isValid: true,
    userIds: [...new Set(userIds)], // Убираем дубликаты
  };
}

// Вспомогательная функция для получения списка пользователей, доступных для rollback
export function getAvailableRollbackUsers(
  currentStep: WorkflowStepApiResponse,
  workflow: WorkflowApiResponse,
): RollbackUser[] {
  // Rollback доступен только для CONSECUTIVE workflows
  if (workflow.workflowType !== WorkflowType.CONSECUTIVE) {
    return [];
  }

  // Валидация и извлечение данных
  const validation = validateAndExtractUserIds(workflow);
  if (!validation.isValid) {
    return [];
  }

  // Фильтруем предыдущие шаги с назначенными пользователями
  const previousSteps = workflow.workflowSteps
    .filter(
      (step) => step.order < currentStep.order && step.assignedToUserId != null,
    )
    .map((step) => ({
      userId: step.assignedToUserId,
      userName: step.assignedToUser?.fullname || "Неизвестный пользователь",
      username: step.assignedToUser?.username,
      userEmail: undefined, // Email нужно загрузить отдельно
      userRole: undefined, // Роль нужно загрузить отдельно
      stepOrder: step.order,
      stepActionType: step.actionType,
      stepStatus: step.status,
    }))
    .sort((a, b) => b.stepOrder - a.stepOrder); // Сначала самые недавние

  return previousSteps;
}

// Функция для проверки, может ли пользователь быть использован для rollback
export function isUserEligibleForRollback(
  userId: string,
  currentStep: WorkflowStepApiResponse,
  workflow: WorkflowApiResponse,
): boolean {
  // Находим шаги, назначенные этому пользователю
  const userSteps = workflow.workflowSteps.filter(
    (step) => step.assignedToUserId === userId,
  );

  // Проверяем, есть ли у пользователя шаги до текущего
  return userSteps.some((step) => step.order < currentStep.order);
}

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
// ✨ ОБНОВЛЕНО: actionType теперь в каждом step отдельно
export type WorkflowFormData = {
  documentId: string;
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
