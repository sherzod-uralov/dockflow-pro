import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { UserGetRequest } from "@/features/admin/admin-users/type/user.types";
import { AxiosResponse } from "axios";
import { handleUserError } from "@/utils/http-error-handler";
import { UserSchemaZodType } from "../schema/user.schema";

export const userService = {
  getAllUsers: async (): Promise<UserGetRequest> => {
    try {
      const response: AxiosResponse<UserGetRequest> =
        await axiosInstance.get<UserGetRequest>(endpoints.user.list);
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
};
