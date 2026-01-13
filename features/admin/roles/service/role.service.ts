import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import { RoleZodType } from "../schema/role.schema";
import { RoleData, RoleResponse } from "../type/role.type";
import { GlobalGetAllPaginationProps } from "@/types/global.types";

export const rolesService = createCRUDService<
  RoleData,
  RoleZodType,
  RoleZodType,
  GlobalGetAllPaginationProps,
  RoleResponse
>(endpoints.role, {
  transformParams: (params) => ({
    search: params?.search,
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
  }),
});

// Backwards compatible aliases
export const {
  getAll: getAllRoles,
  getById: getRoleById,
  create: createRole,
  update: updateRole,
  delete: deleteRole,
} = rolesService;
