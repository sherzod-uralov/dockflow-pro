import { createCRUDHooks } from "@/lib/crud-hooks";
import { projectMemberService } from "../service/project-member.service";
import {
  ProjectMemberGetResponse,
  ProjectMemberCreatePayload,
  ProjectMemberUpdatePayload,
  ProjectMemberQueryParams,
} from "../type/project-member.type";
import { PaginatedResponse } from "@/lib/crud-service";

const hooks = createCRUDHooks<
  ProjectMemberGetResponse,
  ProjectMemberCreatePayload,
  ProjectMemberUpdatePayload,
  ProjectMemberQueryParams,
  PaginatedResponse<ProjectMemberGetResponse>
>({
  service: projectMemberService,
  queryKey: "project-members",
  singleQueryKey: "project-member",
});

export const useGetAllProjectMembers = hooks.useGetAll;
export const useGetProjectMemberById = hooks.useGetById;
export const useCreateProjectMember = hooks.useCreate;
export const useUpdateProjectMember = hooks.useUpdate;
export const useDeleteProjectMember = hooks.useDelete;
