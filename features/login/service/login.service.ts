import { LoginBody } from "@/features/login/type/login.type";
import { endpoints } from "@/api/axios.endpoints";
import axiosInstance from "@/api/axios.instance";
import { AxiosResponse } from "axios";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  login: async (data: LoginBody) => {
    try {
      const response: AxiosResponse = await axiosInstance.post<LoginResponse>(
        endpoints.auth.login,
        data,
      );
      return response.data;
    } catch (error: any) {
      if (error.response.status === 401) {
        throw new Error("login yoki parol noto'g'ri kiritilgan");
      }
    }
  },
  getProfile: async () => {
    try {
      const response = await axiosInstance.get(endpoints.auth.profile.list);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
