import axiosInstance from "@/api/axios.instance";
import { Deportament, DeportamentQueryParams } from "../type/deportament.type";
import { errorHandlers } from "@/utils/http-error-handler";
import { endpoints } from "@/api/axios.endpoints";
import { DeportamentInferType } from "../schema/deportament.schema";

const deportamentHandler = errorHandlers.deportament;

export const deportamentService = {
  getAllDeportaments: async (params?: DeportamentQueryParams) => {
    return await deportamentHandler.executeList(() =>
      axiosInstance.get(endpoints.deportament.list, {
        params: {
          search: params?.search,
          pageSize: params?.pageSize,
          pageNumber: params?.pageNumber,
        },
      }),
    );
  },
  createDeportament: async (data: DeportamentInferType) => {
    return await deportamentHandler.executeCreate(() =>
      axiosInstance.post(endpoints.deportament.create, data),
    );
  },
  updateDeportament: async (
    id: string,
    data: Partial<DeportamentInferType>,
  ) => {
    return await deportamentHandler.executeUpdate(() =>
      axiosInstance.patch(endpoints.deportament.update(id), data),
    );
  },
  deleteDeportament: async (id: string) => {
    return await deportamentHandler.executeDelete(() =>
      axiosInstance.delete(endpoints.deportament.delete(id)),
    );
  },
  getDeportamentById: async (id: string) => {
    return await deportamentHandler.executeGet(() =>
      axiosInstance.get(endpoints.deportament.detail(id)),
    );
  },
};
