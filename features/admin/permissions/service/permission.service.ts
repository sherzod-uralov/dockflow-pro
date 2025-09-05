import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { Permission } from "../type/permission.type";
import { PermissionQueryParams } from "../hook/permission.hook";

export const permissionService = {
  getAllPermissions: async (params?: PermissionQueryParams) => {
    try {
      const response = await axiosInstance.get(endpoints.permission.list, {
        params: {
          name: params?.name,
          pageSize: params?.pageSize,
          pageNumber: params?.pageNumber,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createPermission: async (data: Permission) => {
    try {
      const response = await axiosInstance.post(
        endpoints.permission.create,
        data,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};
