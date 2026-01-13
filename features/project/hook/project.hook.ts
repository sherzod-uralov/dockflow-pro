import { createCRUDHooks } from "@/lib/crud-hooks";
import { projectService } from "../service/project.service";
import {
  ProjectQueryParams,
  GetAllProjects,
  ProjectCreatePayload,
  ProjectUpdatePayload,
  ProjectGetResponse,
} from "../type/project.type";

const projectHooks = createCRUDHooks<
  ProjectGetResponse,
  ProjectCreatePayload,
  ProjectUpdatePayload,
  ProjectQueryParams,
  GetAllProjects
>({
  service: projectService,
  queryKey: "projects",
  singleQueryKey: "project",
});

export const useGetAllProjects = (params?: ProjectQueryParams) =>
  projectHooks.useGetAll(params);

export const useGetProjectById = (id: string, options?: { enabled?: boolean }) =>
  projectHooks.useGetById(id, options);

export const useCreateProject = projectHooks.useCreate;

export const useUpdateProject = projectHooks.useUpdate;

export const useDeleteProject = projectHooks.useDelete;
