import { createCRUDHooks } from "@/lib/crud-hooks";
import { permissionService } from "../service/permission.service";
import {
  Permission,
  getAllPermissions,
  PermissionQueryParams,
} from "../type/permission.type";

const permissionHooks = createCRUDHooks<
  Permission,
  Permission,
  Partial<Permission>,
  PermissionQueryParams,
  getAllPermissions
>({
  service: permissionService,
  queryKey: "permissions",
  singleQueryKey: "permission",
});

// Export individual hooks for backwards compatibility
export const useGetAllPermissions = (
  params?: PermissionQueryParams,
  options?: { enabled?: boolean },
) => permissionHooks.useGetAll(params, options);

export const useGetPermissionById = (id: string) =>
  permissionHooks.useGetById(id);

export const useCreatePermission = permissionHooks.useCreate;

export const useUpdatePermission = permissionHooks.useUpdate;

export const useDeletePermission = permissionHooks.useDelete;
