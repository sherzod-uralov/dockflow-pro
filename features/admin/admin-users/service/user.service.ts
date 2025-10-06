import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import {
  User,
  UserGetRequest,
  UserHookProps,
} from "@/features/admin/admin-users/type/user.types";
import { AxiosResponse } from "axios";
import { handleUserError } from "@/utils/http-error-handler";
import { UserSchemaZodType } from "../schema/user.schema";

export const userService = {
  getAllUsers: async (params: UserHookProps): Promise<UserGetRequest> => {
    try {
      const response: AxiosResponse<UserGetRequest> =
        await axiosInstance.get<UserGetRequest>(endpoints.user.list, {
          params,
        });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createUser: async (user: UserSchemaZodType) => {
    return await handleUserError.executeCreate(() =>
      axiosInstance.post(endpoints.user.create, user),
    );
  },
  deleteUser: async (id: string) => {
    return await handleUserError.executeDelete(() =>
      axiosInstance.delete(endpoints.user.delete(id)),
    );
  },
  updateUser: async (id: string, data: User) => {
    return await handleUserError.executeUpdate(() =>
      axiosInstance.patch(endpoints.user.update(id), data),
    );
  },
  getUserById: async (id: string) => {
    return await handleUserError.executeGet(() =>
      axiosInstance.get(endpoints.user.detail(id)),
    );
  },
};
