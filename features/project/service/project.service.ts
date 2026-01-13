import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  ProjectGetResponse,
  GetAllProjects,
  ProjectQueryParams,
  ProjectCreatePayload,
  ProjectUpdatePayload,
} from "../type/project.type";

export const projectService = createCRUDService<
  ProjectGetResponse,
  ProjectCreatePayload,
  ProjectUpdatePayload,
  ProjectQueryParams,
  GetAllProjects
>(endpoints.project, {
  transformParams: (params) => ({
    search: params?.search,
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
    status: params?.status,
    departmentId: params?.departmentId,
  }),
});

// Backwards compatible aliases
export const {
  getAll: getAllProjects,
  getById: getProjectById,
  create: createProject,
  update: updateProject,
  delete: deleteProject,
} = projectService;
