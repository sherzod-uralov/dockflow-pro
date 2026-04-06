import { createCRUDHooks } from "@/lib/crud-hooks";
import { projectLabelService } from "../service/project-label.service";
import {
  ProjectLabelGetResponse,
  ProjectLabelCreatePayload,
  ProjectLabelUpdatePayload,
  ProjectLabelQueryParams,
} from "../type/project-label.type";
import { PaginatedResponse } from "@/lib/crud-service";

const hooks = createCRUDHooks<
  ProjectLabelGetResponse,
  ProjectLabelCreatePayload,
  ProjectLabelUpdatePayload,
  ProjectLabelQueryParams,
  PaginatedResponse<ProjectLabelGetResponse>
>({
  service: projectLabelService,
  queryKey: "project-labels",
  singleQueryKey: "project-label",
});

export const useGetAllProjectLabels = hooks.useGetAll;
export const useGetProjectLabelById = hooks.useGetById;
export const useCreateProjectLabel = hooks.useCreate;
export const useUpdateProjectLabel = hooks.useUpdate;
export const useDeleteProjectLabel = hooks.useDelete;
