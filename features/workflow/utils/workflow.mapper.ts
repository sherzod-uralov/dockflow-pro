import {
  WorkflowApiResponse,
  WorkflowFormData,
  WorkflowStepFormData,
  WorkflowActionType,
  WorkflowType,
} from "@/features/workflow";
import {
  WorkflowCreateType,
  WorkflowFormType,
} from "../schema/workflow.schema";

/**
 * Трансформация API response → Form data
 */
export const apiToFormData = (
  apiData: WorkflowApiResponse,
): WorkflowFormType => {
  const actionType = apiData.workflowSteps[0]?.actionType || "APPROVAL";

  return {
    documentId: apiData.documentId,
    actionType: actionType,
    workflowType: apiData.workflowType || WorkflowType.CONSECUTIVE,
    steps: apiData.workflowSteps
      .sort((a, b) => a.order - b.order)
      .map((step) => ({
        id: step.id,
        assignedToUserId: step.assignedToUserId,
        dueDate: step.dueDate ? step.dueDate.split("T")[0] : null,
      })),
  };
};

/**
 * Трансформация Form data → API payload
 * ✅ КРИТИЧНО: Добавляет ВСЕ обязательные поля для Backend
 * ⚠️ workflowType не отправляется на backend (поле используется только на frontend)
 */
export const formToApiPayload = (
  formData: WorkflowFormType,
  isUpdate: boolean = false,
) => {
  const payload: any = {
    steps: formData.steps.map((step, index) => ({
      order: index,
      actionType: formData.actionType,
      assignedToUserId: step.assignedToUserId,
      dueDate: step.dueDate ? `${step.dueDate}T23:59:59.000Z` : null,
      isRejected: false,
    })),
  };

  if (!isUpdate) {
    payload.documentId = formData.documentId;
    payload.currentStepOrder = 0;
    payload.status = "ACTIVE";
  } else {
    payload.actionType = formData.actionType;
    if (payload.documentId) {
      delete payload.documentId;
    }
  }

  return payload;
};

/**
 * Проверка, изменились ли данные формы относительно оригинала
 */
export const hasFormChanged = (
  original: WorkflowApiResponse,
  current: WorkflowFormType,
): boolean => {
  const originalForm = apiToFormData(original);

  if (originalForm.actionType !== current.actionType) return true;
  if (originalForm.workflowType !== current.workflowType) return true;
  if (originalForm.steps.length !== current.steps.length) return true;

  return originalForm.steps.some((originalStep, index) => {
    const currentStep = current.steps[index];
    if (!currentStep) return true;

    return (
      originalStep.assignedToUserId !== currentStep.assignedToUserId ||
      originalStep.dueDate !== currentStep.dueDate
    );
  });
};

/**
 * Создать копию workflow для дублирования
 */
export const duplicateWorkflow = (
  workflow: WorkflowApiResponse,
  newDocumentId?: string,
): WorkflowFormType => {
  const actionType = workflow.workflowSteps[0]?.actionType || "APPROVAL";

  return {
    documentId: newDocumentId || workflow.documentId,
    actionType: actionType,
    workflowType: workflow.workflowType || WorkflowType.CONSECUTIVE,
    steps: workflow.workflowSteps
      .sort((a, b) => a.order - b.order)
      .map((step) => ({
        assignedToUserId: step.assignedToUserId,
        dueDate: null,
      })),
  };
};

/**
 * Создать шаблон нового step для добавления
 */
export const createEmptyStep = (): WorkflowStepFormData => {
  return {
    // id отсутствует - это новый step
    assignedToUserId: "",
    dueDate: null,
  };
};

/**
 * Валидировать уникальность assignedToUserId
 */
export const validateUniqueAssignees = (
  steps: WorkflowStepFormData[],
): { isValid: boolean; duplicates: string[]; duplicateIndexes: number[] } => {
  const userIds = steps.map((s) => s.assignedToUserId).filter(Boolean);

  const uniqueIds = new Set(userIds);
  const duplicates: string[] = [];
  const duplicateIndexes: number[] = [];

  if (uniqueIds.size !== userIds.length) {
    const seen = new Map<string, number[]>();
    userIds.forEach((id, index) => {
      if (!seen.has(id)) {
        seen.set(id, []);
      }
      seen.get(id)!.push(index);
    });

    seen.forEach((indexes, userId) => {
      if (indexes.length > 1) {
        duplicates.push(userId);
        duplicateIndexes.push(...indexes);
      }
    });
  }

  return {
    isValid: uniqueIds.size === userIds.length,
    duplicates: Array.from(new Set(duplicates)),
    duplicateIndexes: Array.from(new Set(duplicateIndexes)),
  };
};

/**
 * Пересортировать steps после drag & drop
 */
export const reorderSteps = (
  steps: WorkflowStepFormData[],
  fromIndex: number,
  toIndex: number,
): WorkflowStepFormData[] => {
  const result = Array.from(steps);
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

/**
 * Проверить, есть ли незаполненные обязательные поля в steps
 */
export const findIncompleteSteps = (
  steps: WorkflowStepFormData[],
): number[] => {
  return steps
    .map((step, index) => ({
      index,
      isIncomplete: !step.assignedToUserId,
    }))
    .filter((item) => item.isIncomplete)
    .map((item) => item.index);
};
