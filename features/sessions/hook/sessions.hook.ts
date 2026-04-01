import { useQuery, useMutation, useQueryClient } from "react-query";
import { showError, showSuccess } from "@/utils/show-error";
import { sessionsService } from "../service/sessions.service";
import { SessionQueryParams, SessionGetResponse, GetAllSessions } from "../type/sessions.type";

export const useGetAllSessions = (params?: SessionQueryParams) => {
  return useQuery<GetAllSessions>({
    queryKey: ["sessions", params],
    queryFn: () => sessionsService.getAll(params),
    keepPreviousData: true,
  });
};

export const useGetSessionById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery<SessionGetResponse>({
    queryKey: ["session", id],
    queryFn: () => sessionsService.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, string>({
    mutationFn: (id) => sessionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["sessions"]);
      showSuccess("Sessiya o'chirildi");
    },
    onError: showError,
  });
};

export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, void>({
    mutationFn: () => sessionsService.revokeAll(),
    onSuccess: () => {
      queryClient.invalidateQueries(["sessions"]);
      showSuccess("Barcha sessiyalar bekor qilindi");
    },
    onError: showError,
  });
};
