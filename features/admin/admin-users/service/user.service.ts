import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { UserGetRequest } from "@/features/admin/admin-users/type/user.types";
import { AxiosResponse } from "axios";

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
};
