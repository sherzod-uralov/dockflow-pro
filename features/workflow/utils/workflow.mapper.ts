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
  return {
    documentId: apiData.documentId,
    workflowType: apiData.workflowType || WorkflowType.CONSECUTIVE,
    steps: apiData.workflowSteps
      .sort((a, b) => a.order - b.order)
      .map((step) => ({
        id: step.id,
        assignedToUserId: step.assignedToUserId,
        actionType: step.actionType || WorkflowActionType.APPROVAL,
      })),
  };
};

/**
 * Трансформация Form data → API payload
 * ✅ КРИТИЧНО: Добавляет ВСЕ обязательные поля для Backend
 * ⚠️ workflowType не отправляется на backend (поле используется только на frontend)
 * ✨ ПРИМЕЧАНИЕ: Backend автоматически устанавливает первый шаг в статус IN_PROGRESS
 */
export const formToApiPayload = (
  formData: WorkflowFormType,
  isUpdate: boolean = false,
) => {
  const payload: any = {
    steps: formData.steps.map((step, index) => ({
      order: index,
      actionType: step.actionType,
      assignedToUserId: step.assignedToUserId,
      isRejected: false,
    })),
  };

  // ✅ ИСПРАВЛЕНО: documentId только для создания, не для обновления
  if (!isUpdate) {
    payload.documentId = formData.documentId;
    payload.currentStepOrder = 0;
    payload.status = "ACTIVE";
  }
  // ✨ ВАЖНО: При update documentId НЕ должен включаться в payload

  // ✨ ДОПОЛНИТЕЛЬНАЯ ЗАЩИТА: убираем documentId если он случайно попал в payload при update
  if (isUpdate && 'documentId' in payload) {
    delete payload.documentId;
  }

  // 🐛 DEBUG: Логирование для отладки
  if (process.env.NODE_ENV === "development") {
    console.log("📦 Workflow Payload:", {
      isUpdate,
      hasDocumentId: 'documentId' in payload,
      payload,
    });
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

  if (originalForm.workflowType !== current.workflowType) return true;
  if (originalForm.steps.length !== current.steps.length) return true;

  return originalForm.steps.some((originalStep, index) => {
    const currentStep = current.steps[index];
    if (!currentStep) return true;

    return (
      originalStep.assignedToUserId !== currentStep.assignedToUserId ||
      originalStep.actionType !== currentStep.actionType
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
  return {
    documentId: newDocumentId || workflow.documentId,
    workflowType: workflow.workflowType || WorkflowType.CONSECUTIVE,
    steps: workflow.workflowSteps
      .sort((a, b) => a.order - b.order)
      .map((step) => ({
        assignedToUserId: step.assignedToUserId,
        actionType: step.actionType || WorkflowActionType.APPROVAL,
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
    actionType: WorkflowActionType.APPROVAL,
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
