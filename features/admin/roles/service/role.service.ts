import { endpoints } from "@/api/axios.endpoints";
import axiosInstance from "@/api/axios.instance";
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
    const { data } = await axiosInstance.get<RoleResponse>(endpoints.role.list, {
      params: { pageSize, pageNumber, search },
    });
    return data;
  },

  createRole: async (payload: RoleZodType) => {
    const { data } = await axiosInstance.post(endpoints.role.create, payload);
    return data;
  },

  deleteRole: async (id: string) => {
    const { data } = await axiosInstance.delete(endpoints.role.delete(id));
    return data;
  },

  updateRole: async (id: string, payload: RoleZodType) => {
    const { data } = await axiosInstance.patch(endpoints.role.update(id), payload);
    return data;
  },

  getRoleById: async (id: string): Promise<RoleData> => {
    const { data } = await axiosInstance.get(endpoints.role.detail(id));
    return data;
  },
};
