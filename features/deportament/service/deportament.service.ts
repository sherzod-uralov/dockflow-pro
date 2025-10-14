import axiosInstance from "@/api/axios.instance";
import { handleDepartmentError } from "@/utils/http-error-handler";
import { endpoints } from "@/api/axios.endpoints";
import { DeportamentInferType } from "../schema/deportament.schema";
import { DeportamentQueryParams } from "@/features/deportament";

const departmentHandler = handleDepartmentError;

export const deportamentService = {
  getAllDeportaments: async (params?: DeportamentQueryParams) => {
    return await departmentHandler.executeList(() =>
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
    return await departmentHandler.executeCreate(() =>
      axiosInstance.post(endpoints.deportament.create, data),
    );
  },
  updateDeportament: async (
    id: string,
    data: Partial<DeportamentInferType>,
  ) => {
    return await departmentHandler.executeUpdate(() =>
      axiosInstance.patch(endpoints.deportament.update(id), data),
    );
  },
  deleteDeportament: async (id: string) => {
    return await departmentHandler.executeDelete(() =>
      axiosInstance.delete(endpoints.deportament.delete(id)),
    );
  },
  getDeportamentById: async (id: string) => {
    return await departmentHandler.executeGet(() =>
      axiosInstance.get(endpoints.deportament.detail(id)),
    );
  },
};
