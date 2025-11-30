import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import {
  AuditLogQueryParams,
  CreateAuditLogRequest,
} from "../type/audit-log.type";

export const auditLogService = {
  getAllAuditLogs: async (params?: AuditLogQueryParams) => {
    const { data } = await axiosInstance.get(endpoints.auditLog.list, {
      params: {
        search: params?.search,
        pageSize: params?.pageSize,
        pageNumber: params?.pageNumber,
        entity: params?.entity,
        entityId: params?.entityId,
        action: params?.action,
        performedByUserId: params?.performedByUserId,
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
    });
    return data;
  },

  createAuditLog: async (payload: CreateAuditLogRequest) => {
    const { data } = await axiosInstance.post(endpoints.auditLog.create, payload);
    return data;
  },

  getAuditLogById: async (id: string) => {
    const { data } = await axiosInstance.get(endpoints.auditLog.detail(id));
    return data;
  },
};
