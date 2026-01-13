import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import { DeportamentInferType } from "../schema/deportament.schema";
import {
  DepartmentResponse,
  GetAllDeportaments,
  DeportamentQueryParams,
} from "@/features/deportament/type/deportament.type";

export const deportamentService = createCRUDService<
  DepartmentResponse,
  DeportamentInferType,
  Partial<DeportamentInferType>,
  DeportamentQueryParams,
  GetAllDeportaments
>(endpoints.deportament, {
  transformParams: (params) => ({
    search: params?.search,
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
  }),
});

// Backwards compatible aliases
export const {
  getAll: getAllDeportaments,
  getById: getDeportamentById,
  create: createDeportament,
  update: updateDeportament,
  delete: deleteDeportament,
} = deportamentService;
