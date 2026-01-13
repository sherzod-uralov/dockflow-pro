import { createCRUDHooks } from "@/lib/crud-hooks";
import { rolesService } from "../service/role.service";
import { RoleZodType } from "../schema/role.schema";
import { RoleData, RoleResponse } from "../type/role.type";
import { GlobalGetAllPaginationProps } from "@/types/global.types";

const roleHooks = createCRUDHooks<
  RoleData,
  RoleZodType,
  RoleZodType,
  GlobalGetAllPaginationProps,
  RoleResponse
>({
  service: rolesService,
  queryKey: "roles",
  singleQueryKey: "role",
});

// Export individual hooks for backwards compatibility
export const useGetRoles = ({ pageSize = 7, pageNumber = 1, search = "" }) =>
  roleHooks.useGetAll({ pageSize, pageNumber, search });

export const useGetRoleByIdQuery = (id: string) =>
  roleHooks.useGetById(id);

export const useRoleCreateMutation = roleHooks.useCreate;

export const useUpdateRole = roleHooks.useUpdate;

export const useDeleteRole = roleHooks.useDelete;
