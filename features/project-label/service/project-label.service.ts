import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService, PaginatedResponse } from "@/lib/crud-service";
import {
  ProjectLabelGetResponse,
  ProjectLabelCreatePayload,
  ProjectLabelUpdatePayload,
  ProjectLabelQueryParams,
} from "../type/project-label.type";

export const projectLabelService = createCRUDService<
  ProjectLabelGetResponse,
  ProjectLabelCreatePayload,
  ProjectLabelUpdatePayload,
  ProjectLabelQueryParams,
  PaginatedResponse<ProjectLabelGetResponse>
>(endpoints.projectLabel, {
  transformParams: (params) => ({
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
    projectId: params?.projectId,
    search: params?.search,
  }),
});
