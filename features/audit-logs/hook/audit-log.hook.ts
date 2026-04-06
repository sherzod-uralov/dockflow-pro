import { useMutation, useQuery, useQueryClient } from "react-query";
import { auditLogService } from "../service/audit-log.service";
import {
  AuditLogList,
  AuditLogQueryParams,
  CreateAuditLogRequest,
} from "../type/audit-log.type";
import { showError, showSuccess } from "@/utils/show-error";

export const useCreateAuditLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAuditLogRequest) =>
      auditLogService.createAuditLog(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["audit-logs"]);
      showSuccess(data);
    },
    onError: (error: any) => {
      showError(error);
    },
  });
};

export const useGetAllAuditLogs = (params?: AuditLogQueryParams) => {
  return useQuery<AuditLogList>({
    queryKey: ["audit-logs", params],
    queryFn: () => auditLogService.getAllAuditLogs(params),
    keepPreviousData: true,
  });
};

export const useGetAuditLogById = (id: string) => {
  return useQuery({
    queryKey: ["audit-log", id],
    queryFn: () => auditLogService.getAuditLogById(id),
    enabled: !!id,
    onError: (error: any) => {
      showError(error);
    },
  });
};
