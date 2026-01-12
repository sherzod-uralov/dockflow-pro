import {
  WorkflowApiResponse,
  WorkflowStepFormData,
  WorkflowActionType,
  WorkflowType,
} from "@/features/workflow";
import {
  WorkflowFormType,
} from "../schema/workflow.schema";

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
        dueDate: step.dueDate || undefined,
      })),
  };
};

export const formToApiPayload = (
  formData: WorkflowFormType,
  isUpdate: boolean = false,
) => {
  const payload: any = {
    steps: formData.steps.map((step, index) => ({
      order: index + 1,
      actionType: step.actionType,
      assignedToUserId: step.assignedToUserId,
      dueDate: step.dueDate || null,
      isRejected: false,
    })),
  };

  if (!isUpdate) {
    payload.documentId = formData.documentId;
    payload.currentStepOrder = 1;
    payload.status = "ACTIVE";
  }
  if (isUpdate && 'documentId' in payload) {
    delete payload.documentId;
  }

  return payload;
};


export const createEmptyStep = (): WorkflowStepFormData => {
  return {
    assignedToUserId: "",
    actionType: WorkflowActionType.SIGN,
  };
};


