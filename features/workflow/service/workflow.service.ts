import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  WorkflowQueryParams,
  WorkflowListResponse,
  WorkflowApiResponse,
  WorkflowStepUpdateType,
  WorkflowStepApiResponse,
  WorkflowStepRejectPayload,
  MyTasksResponse,
  MyTasksQueryParams,
  WorkflowFromTemplatePayload,
} from "@/features/workflow/type/workflow.type";
import { WorkflowCreateType } from "../schema/workflow.schema";

const baseCRUDService = createCRUDService<
  WorkflowApiResponse,
  WorkflowCreateType,
  Partial<WorkflowCreateType>,
  WorkflowQueryParams,
  WorkflowListResponse
>(endpoints.workflow, {
  transformParams: (params) => ({
    search: params?.search,
    documentId: params?.documentId,
    status: params?.status,
    type: params?.type,
    documentTypeId: params?.documentTypeId,
    assignedToUserId: params?.assignedToUserId,
    createdById: params?.createdById,
    stepActionType: params?.stepActionType,
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
    overdue: params?.overdue,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
    page: params?.page,
    limit: params?.limit,
  }),
});

export const workflowService = {
  getAllWorkflows: baseCRUDService.getAll,
  getWorkflowById: baseCRUDService.getById,
  createWorkflow: baseCRUDService.create,
  updateWorkflow: baseCRUDService.update,
  deleteWorkflow: baseCRUDService.delete,

  createWorkflowFromTemplate: async (payload: WorkflowFromTemplatePayload) => {
    const { data } = await axiosInstance.post<WorkflowApiResponse>(
      endpoints.workflow.create,
      payload
    );
    return data;
  },

  getWorkflowSteps: async (workflowId: string) => {
    const { data } = await axiosInstance.get(
      `/api/v1/workflow-step/workflow/${workflowId}`
    );
    return data;
  },
  updateWorkflowStep: async (id: string, payload: WorkflowStepUpdateType) => {
    const { data } = await axiosInstance.patch<WorkflowStepApiResponse>(
      endpoints.workflowStep.update(id),
      payload
    );
    return data;
  },

  assignWorkflowStep: async (id: string) => {
    const { data } = await axiosInstance.patch<WorkflowStepApiResponse>(
      endpoints.workflowStep.assign(id)
    );
    return data;
  },

  completeWorkflowStep: async (id: string, comment?: string) => {
    const { data } = await axiosInstance.patch<WorkflowStepApiResponse>(
      endpoints.workflowStep.complete(id),
      comment ? { comment } : {}
    );
    return data;
  },

  rejectWorkflowStep: async (id: string, payload?: WorkflowStepRejectPayload) => {
    const { data } = await axiosInstance.patch<WorkflowStepApiResponse>(
      endpoints.workflowStep.reject(id),
      payload || {}
    );
    return data;
  },

  verifyWorkflowStep: async (id: string, formData: FormData) => {
    const { data } = await axiosInstance.post(
      endpoints.workflowStep.verify(id),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  getMyTasks: async (params?: MyTasksQueryParams) => {
    const queryParams: Record<string, unknown> = {
      pageNumber: params?.page ?? 1,
      pageSize: params?.limit ?? 9,
    };

    if (params?.status) queryParams.status = params.status;
    if (params?.actionType) queryParams.actionType = params.actionType;

    const { data } = await axiosInstance.get<MyTasksResponse>(
      endpoints.workflowStep.list,
      { params: queryParams }
    );
    return data;
  },

  downloadDocument: async (documentId: string, filename?: string) => {
    try {
      const response = await axiosInstance.get(
        endpoints.document.download(documentId),
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || `document-${documentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error: any) {
      if (error?.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        let message = text;
        try {
          const json = JSON.parse(text);
          message = json.message || text;
        } catch {}
        error.response.data = { message };
      }
      throw error;
    }
  },

  getCalendarView: async (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    const { data } = await axiosInstance.get(endpoints.workflowStep.calendarView, {
      params,
    });
    return data;
  },
};
