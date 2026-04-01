import { endpoints } from "@/api/axios.endpoints";
import axiosInstance from "@/api/axios.instance";
import { createCRUDService, extendCRUDService } from "@/lib/crud-service";
import {
  SprintGetResponse,
  GetAllSprints,
  SprintQueryParams,
  SprintCreatePayload,
  SprintUpdatePayload,
} from "../type/sprint.type";

const baseSprintService = createCRUDService<
  SprintGetResponse,
  SprintCreatePayload,
  SprintUpdatePayload,
  SprintQueryParams,
  GetAllSprints
>(endpoints.sprint, {
  transformParams: (params) => ({
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
    projectId: params?.projectId,
    status: params?.status,
  }),
});

export const sprintService = extendCRUDService(
  baseSprintService,
  {
    start: async (id: string): Promise<SprintGetResponse> => {
      const { data } = await axiosInstance.post<SprintGetResponse>(endpoints.sprint.start(id));
      return data;
    },
    complete: async (id: string): Promise<SprintGetResponse> => {
      const { data } = await axiosInstance.post<SprintGetResponse>(endpoints.sprint.complete(id));
      return data;
    },
    cancel: async (id: string): Promise<SprintGetResponse> => {
      const { data } = await axiosInstance.post<SprintGetResponse>(endpoints.sprint.cancel(id));
      return data;
    },
  }
);

export const {
  getAll: getAllSprints,
  getById: getSprintById,
  create: createSprint,
  update: updateSprint,
  delete: deleteSprint,
} = sprintService;

export const startSprint = sprintService.start;
export const completeSprint = sprintService.complete;
export const cancelSprint = sprintService.cancel;
