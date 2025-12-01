import { useMutation, useQuery, useQueryClient } from "react-query";
import { permissionService } from "../service/permission.service";
import {
  getAllPermissions,
  Permission,
  PermissionQueryParams,
} from "../type/permission.type";
import { showError, showSuccess } from "@/utils/show-error";

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Permission) =>
      permissionService.createPermission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
      showSuccess("Ruxsat muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      showError(error);
    },
  });
};

export const useGetAllPermissions = (params?: PermissionQueryParams) => {
  return useQuery<getAllPermissions>({
    queryKey: ["permissions", params],
    queryFn: () => permissionService.getAllPermissions(params),
    keepPreviousData: true,
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Permission> }) =>
      permissionService.updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
      showSuccess("Ruxsat muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      showError(error);
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => permissionService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
      showSuccess("Ruxsat muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => {
      showError(error);
    },
  });
};

export const useGetPermissionById = (id: string) => {
  return useQuery({
    queryKey: ["permission", id],
    queryFn: () => permissionService.getPermissionById(id),
    enabled: !!id,
    onError: (error: any) => {
      showError(error);
    },
  });
};
