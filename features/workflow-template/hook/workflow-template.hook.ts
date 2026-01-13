import { createCRUDHooks } from "@/lib/crud-hooks";
import { workflowTemplateService } from "../service/workflow-template.service";
import {
  WorkflowTemplateResponse,
  GetAllWorkflowTemplates,
  WorkflowTemplateQueryParams,
  WorkflowTemplateCreatePayload,
  WorkflowTemplateUpdatePayload,
} from "../type/workflow-template.type";

const workflowTemplateHooks = createCRUDHooks<
  WorkflowTemplateResponse,
  WorkflowTemplateCreatePayload,
  WorkflowTemplateUpdatePayload,
  WorkflowTemplateQueryParams,
  GetAllWorkflowTemplates
>({
  service: workflowTemplateService,
  queryKey: "workflowTemplates",
  singleQueryKey: "workflowTemplate",
});

// Export individual hooks for backwards compatibility
export const useGetAllWorkflowTemplates = (params?: WorkflowTemplateQueryParams) =>
  workflowTemplateHooks.useGetAll(params);

export const useGetWorkflowTemplateById = (id: string) =>
  workflowTemplateHooks.useGetById(id);

export const useCreateWorkflowTemplate = workflowTemplateHooks.useCreate;

export const useUpdateWorkflowTemplate = workflowTemplateHooks.useUpdate;

export const useDeleteWorkflowTemplate = workflowTemplateHooks.useDelete;
