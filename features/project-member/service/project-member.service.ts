import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService, PaginatedResponse } from "@/lib/crud-service";
import {
  ProjectMemberGetResponse,
  ProjectMemberCreatePayload,
  ProjectMemberUpdatePayload,
  ProjectMemberQueryParams,
} from "../type/project-member.type";

export const projectMemberService = createCRUDService<
  ProjectMemberGetResponse,
  ProjectMemberCreatePayload,
  ProjectMemberUpdatePayload,
  ProjectMemberQueryParams,
  PaginatedResponse<ProjectMemberGetResponse>
>(endpoints.projectMember, {
  transformParams: (params) => ({
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
    projectId: params?.projectId,
    userId: params?.userId,
    role: params?.role,
    search: params?.search,
  }),
});
