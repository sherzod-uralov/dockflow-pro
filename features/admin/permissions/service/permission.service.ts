import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import type { Permission, getAllPermissions as GetAllPermissionsResponse, PermissionQueryParams } from "../type/permission.type";

export const permissionService = createCRUDService<
  Permission,
  Permission,
  Partial<Permission>,
  PermissionQueryParams,
  GetAllPermissionsResponse
>(endpoints.permission, {
  transformParams: (params) => ({
    search: params?.search,
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
  }),
});

// Backwards compatible aliases
export const {
  getAll: getAllPermissions,
  getById: getPermissionById,
  create: createPermission,
  update: updatePermission,
  delete: deletePermission,
} = permissionService;
