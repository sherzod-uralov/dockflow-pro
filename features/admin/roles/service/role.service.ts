import { endpoints } from "@/api/axios.endpoints";
import axiosInstance from "@/api/axios.instance";
import { handleRoleError } from "@/utils/http-error-handler";
import { RoleZodType } from "../schema/role.schema";
import { RoleResponse, RoleData } from "../type/role.type";

export const rolesService = {
  getAllRoles: async ({
    pageSize,
    pageNumber,
    search,
  }: {
    pageSize?: number;
    pageNumber?: number;
    search?: string;
  }): Promise<RoleResponse> => {
    return await handleRoleError.executeList(() =>
      axiosInstance.get<RoleResponse>(endpoints.role.list, {
        params: {
          pageSize,
          pageNumber,
          search,
        },
      }),
    );
  },
  createRole: async (data: RoleZodType) => {
    return await handleRoleError.executeCreate(() =>
      axiosInstance.post(endpoints.role.create, data),
    );
  },
  deleteRole: async (id: string) => {
    return await handleRoleError.executeDelete(() =>
      axiosInstance.delete(endpoints.role.delete(id)),
    );
  },
  updateRole: async (id: string, data: RoleZodType) => {
    return await handleRoleError.executeUpdate(() =>
      axiosInstance.patch(endpoints.role.update(id), data),
    );
  },
  getRoleById: async (id: string): Promise<RoleData> => {
    return await handleRoleError.executeGet(() =>
      axiosInstance.get(endpoints.role.detail(id)),
    );
  },
};
