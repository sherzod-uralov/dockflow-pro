import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import {
  User,
  UserGetRequest,
  UserHookProps,
} from "@/features/admin/admin-users/type/user.types";
import { UserSchemaZodType } from "../schema/user.schema";

export const userService = {
  getAllUsers: async (params: UserHookProps): Promise<UserGetRequest> => {
    const { data } = await axiosInstance.get<UserGetRequest>(endpoints.user.list, {
      params: {
        pageNumber: Number(params.pageNumber),
        pageSize: Number(params.pageSize),
        search: params.search || undefined,
        departmentId: params.departmentId || undefined,
      },
    });
    return data;
  },

  createUser: async (payload: UserSchemaZodType) => {
    const { data } = await axiosInstance.post(endpoints.user.create, payload);
    return data;
  },

  deleteUser: async (id: string) => {
    const { data } = await axiosInstance.delete(endpoints.user.delete(id));
    return data;
  },

  updateUser: async (id: string, payload: User) => {
    const { data } = await axiosInstance.patch(endpoints.user.update(id), payload);
    return data;
  },

  getUserById: async (id: string) => {
    const { data } = await axiosInstance.get(endpoints.user.detail(id));
    return data;
  },
};
