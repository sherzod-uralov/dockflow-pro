import {
  WorkflowApiResponse,
  WorkflowStepApiResponse,
} from "../type/workflow.type";

/**
 * Получить текущий активный step
 */
export const getCurrentStep = (
  workflow: WorkflowApiResponse,
): WorkflowStepApiResponse | undefined => {
  return workflow.workflowSteps.find(
    (step) => step.order === workflow.currentStepOrder,
  );
};

/**
 * Проверить, завершен ли workflow
 */
export const isWorkflowCompleted = (workflow: WorkflowApiResponse): boolean => {
  return workflow.workflowSteps.every((step) => step.status === "COMPLETED");
};

/**
 * Получить процент выполнения workflow
 */
export const getWorkflowProgress = (workflow: WorkflowApiResponse): number => {
  const completedSteps = workflow.workflowSteps.filter(
    (step) => step.status === "COMPLETED",
  ).length;

  const totalSteps = workflow.workflowSteps.length;

  return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
};

/**
 * Получить следующий step после текущего
 */
export const getNextStep = (
  workflow: WorkflowApiResponse,
): WorkflowStepApiResponse | undefined => {
  return workflow.workflowSteps.find(
    (step) => step.order === workflow.currentStepOrder + 1,
  );
};

/**
 * Получить предыдущий step
 */
export const getPreviousStep = (
  workflow: WorkflowApiResponse,
): WorkflowStepApiResponse | undefined => {
  return workflow.workflowSteps.find(
    (step) => step.order === workflow.currentStepOrder - 1,
  );
};

/**
 * Проверить, может ли step быть выполнен (все предыдущие завершены)
 */
export const canExecuteStep = (
  workflow: WorkflowApiResponse,
  stepOrder: number,
): boolean => {
  // Все steps с меньшим order должны быть COMPLETED
  return workflow.workflowSteps
    .filter((step) => step.order < stepOrder)
    .every((step) => step.status === "COMPLETED");
};

/**
 * Получить количество оставшихся steps
 */
export const getRemainingStepsCount = (
  workflow: WorkflowApiResponse,
): number => {
  return workflow.workflowSteps.filter((step) => step.status !== "COMPLETED")
    .length;
};


/**
 * Получить цвет статуса
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: "text-yellow-600",
    IN_PROGRESS: "text-blue-600",
    COMPLETED: "text-green-600",
    REJECTED: "text-red-600",
    ACTIVE: "text-blue-600",
    CANCELLED: "text-red-600",
    DRAFT: "text-gray-600",
  };

  return colors[status] || "text-gray-600";
};

/**
 * Получить иконку статуса
 */
export const getStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    PENDING: "⏳",
    IN_PROGRESS: "🔄",
    COMPLETED: "✅",
    REJECTED: "❌",
    ACTIVE: "🟢",
    CANCELLED: "⛔",
    DRAFT: "📝",
  };

  return icons[status] || "📄";
};

/**
 * Получить название actionType на узбекском
 */
export const getActionTypeLabel = (actionType: string): string => {
  const labels: Record<string, string> = {
    APPROVAL: "Tasdiqlash",
    REVIEW: "Ko'rib chiqish",
    SIGN: "Imzolash",
    QR_CODE: "QR kod qo'shish",
    ACKNOWLEDGE: "Tanishish",
  };

  return labels[actionType] || actionType;
};

/**
 * Получить описание actionType
 */
export const getActionTypeDescription = (actionType: string): string => {
  const descriptions: Record<string, string> = {
    APPROVAL: "Hujjatni tasdiqlash jarayoni",
    REVIEW: "Hujjatni ko'rib chiqish va baholash",
    SIGN: "Hujjatga elektron imzo qo'yish",
    QR_CODE: "Hujjatga QR kod va izohlar qo'shish",
    ACKNOWLEDGE: "Hujjat bilan tanishish",
  };

  return descriptions[actionType] || "";
};

/**
 * Проверить, все ли steps имеют одинаковый actionType
 */
export const hasUniformActionType = (
  workflow: WorkflowApiResponse,
): boolean => {
  if (workflow.workflowSteps.length === 0) return true;

  const firstActionType = workflow.workflowSteps[0].actionType;
  return workflow.workflowSteps.every(
    (step) => step.actionType === firstActionType,
  );
};

/**
 * Получить продолжительность выполнения step (в минутах)
 */
export const getStepDuration = (
  step: WorkflowStepApiResponse,
): number | null => {
  if (!step.startedAt || !step.completedAt) return null;

  const start = new Date(step.startedAt);
  const end = new Date(step.completedAt);

  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

/**
 * Получить общую продолжительность workflow (в часах)
 */
export const getWorkflowDuration = (
  workflow: WorkflowApiResponse,
): number | null => {
  const firstStep = workflow.workflowSteps.sort((a, b) => a.order - b.order)[0];
  const lastCompletedStep = workflow.workflowSteps
    .filter((s) => s.completedAt)
    .sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime(),
    )[0];

  if (!firstStep?.startedAt || !lastCompletedStep?.completedAt) return null;

  const start = new Date(firstStep.startedAt);
  const end = new Date(lastCompletedStep.completedAt);

  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
};
