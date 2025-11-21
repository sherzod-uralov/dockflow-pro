// audit-log.service.ts
import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import {
  AuditLog,
  AuditLogList,
  AuditLogQueryParams,
  CreateAuditLogRequest,
} from "../type/audit-log.type";
import { handlePermissionError } from "@/utils/http-error-handler";

const auditLogHandler = handlePermissionError;

export const auditLogService = {
  getAllAuditLogs: async (params?: AuditLogQueryParams) => {
    return await auditLogHandler.executeList(() =>
      axiosInstance.get(endpoints.auditLog.list, {
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
      }),
    );
  },

  createAuditLog: async (data: CreateAuditLogRequest) => {
    return await auditLogHandler.executeCreate(() =>
      axiosInstance.post(endpoints.auditLog.create, data),
    );
  },

  getAuditLogById: async (id: string) => {
    return await auditLogHandler.executeGet(() =>
      axiosInstance.get(endpoints.auditLog.detail(id)),
    );
  },
};
