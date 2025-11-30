import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { DeportamentInferType } from "../schema/deportament.schema";
import { DeportamentQueryParams } from "@/features/deportament";

export const deportamentService = {
  getAllDeportaments: async (params?: DeportamentQueryParams) => {
    const { data } = await axiosInstance.get(endpoints.deportament.list, {
      params: {
        search: params?.search,
        pageSize: params?.pageSize,
        pageNumber: params?.pageNumber,
      },
    });
    return data;
  },

  createDeportament: async (payload: DeportamentInferType) => {
    const { data } = await axiosInstance.post(endpoints.deportament.create, payload);
    return data;
  },

  updateDeportament: async (id: string, payload: Partial<DeportamentInferType>) => {
    const { data } = await axiosInstance.patch(endpoints.deportament.update(id), payload);
    return data;
  },

  deleteDeportament: async (id: string) => {
    const { data } = await axiosInstance.delete(endpoints.deportament.delete(id));
    return data;
  },

  getDeportamentById: async (id: string) => {
    const { data } = await axiosInstance.get(endpoints.deportament.detail(id));
    return data;
  },
};
