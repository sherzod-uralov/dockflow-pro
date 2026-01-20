import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import { DepartmentInferType } from "../schema/department.schema";
import {
  DepartmentResponse,
  GetAllDepartments,
  DepartmentQueryParams,
} from "@/features/department/type/department.type";

export const departmentService = createCRUDService<
  DepartmentResponse,
  DepartmentInferType,
  Partial<DepartmentInferType>,
  DepartmentQueryParams,
  GetAllDepartments
>(endpoints.department, {
  transformParams: (params) => ({
    search: params?.search,
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
  }),
});

// Backwards compatible aliases
export const {
  getAll: getAllDepartments,
  getById: getDepartmentById,
  create: createDepartment,
  update: updateDepartment,
  delete: deleteDepartment,
} = departmentService;
