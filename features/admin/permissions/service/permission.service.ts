import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { Permission } from "../type/permission.type";
import { PermissionQueryParams } from "../type/permission.type";
import { errorHandlers } from "@/utils/http-error-handler";

const permissionHandler = errorHandlers.ruxsat;

export const permissionService = {
  getAllPermissions: async (params?: PermissionQueryParams) => {
    return await permissionHandler.executeList(() =>
      axiosInstance.get(endpoints.permission.list, {
        params: {
          search: params?.search,
          pageSize: params?.pageSize,
          pageNumber: params?.pageNumber,
        },
      }),
    );
  },

  createPermission: async (data: Permission) => {
    return await permissionHandler.executeCreate(() =>
      axiosInstance.post(endpoints.permission.create, data),
    );
  },

  deletePermission: async (id: string) => {
    return await permissionHandler.executeDelete(() =>
      axiosInstance.delete(endpoints.permission.delete(id)),
    );
  },

  updatePermission: async (id: string, data: Partial<Permission>) => {
    return await permissionHandler.executeUpdate(() =>
      axiosInstance.patch(endpoints.permission.update(id), data),
    );
  },
  getPermission: async (id: string) => {
    return await permissionHandler.executeGet(() =>
      axiosInstance.get(endpoints.permission.detail(id)),
    );
  },
  getPermissionById: async (id: string) => {
    return await permissionHandler.executeGet(() =>
      axiosInstance.get(endpoints.permission.detail(id)),
    );
  },
};
