import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  WorkflowTemplateResponse,
  GetAllWorkflowTemplates,
  WorkflowTemplateQueryParams,
  WorkflowTemplateCreatePayload,
  WorkflowTemplateUpdatePayload,
} from "../type/workflow-template.type";

export const workflowTemplateService = createCRUDService<
  WorkflowTemplateResponse,
  WorkflowTemplateCreatePayload,
  WorkflowTemplateUpdatePayload,
  WorkflowTemplateQueryParams,
  GetAllWorkflowTemplates
>(endpoints.workflowTemplate, {
  transformParams: (params) => ({
    search: params?.search,
    documentTypeId: params?.documentTypeId,
    type: params?.type,
    isActive: params?.isActive,
    isPublic: params?.isPublic,
    page: params?.page ?? params?.pageNumber,
    limit: params?.limit ?? params?.pageSize,
  }),
});

// Backwards compatible aliases
export const {
  getAll: getAllWorkflowTemplates,
  getById: getWorkflowTemplateById,
  create: createWorkflowTemplate,
  update: updateWorkflowTemplate,
  delete: deleteWorkflowTemplate,
} = workflowTemplateService;
