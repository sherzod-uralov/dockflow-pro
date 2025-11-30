import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { Permission, PermissionQueryParams } from "../type/permission.type";

export const permissionService = {
  getAllPermissions: async (params?: PermissionQueryParams) => {
    const { data } = await axiosInstance.get(endpoints.permission.list, {
      params: {
        search: params?.search,
        pageSize: params?.pageSize,
        pageNumber: params?.pageNumber,
      },
    });
    return data;
  },

  createPermission: async (payload: Permission) => {
    const { data } = await axiosInstance.post(endpoints.permission.create, payload);
    return data;
  },

  deletePermission: async (id: string) => {
    const { data } = await axiosInstance.delete(endpoints.permission.delete(id));
    return data;
  },

  updatePermission: async (id: string, payload: Partial<Permission>) => {
    const { data } = await axiosInstance.patch(endpoints.permission.update(id), payload);
    return data;
  },

  getPermissionById: async (id: string) => {
    const { data } = await axiosInstance.get(endpoints.permission.detail(id));
    return data;
  },
};
