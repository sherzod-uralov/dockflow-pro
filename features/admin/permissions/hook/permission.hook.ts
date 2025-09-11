import { useMutation, useQuery, useQueryClient } from "react-query";
import { permissionService } from "../service/permission.service";
import {
  getAllPermissions,
  Permission,
  PermissionQueryParams,
} from "../type/permission.type";
import { toast } from "sonner";

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Permission) =>
      permissionService.createPermission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
      toast.success("Ruxsat muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message);
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
      toast.success("Ruxsat muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => permissionService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
      toast.success("Ruxsat muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "O'chirishda xatolik yuz berdi",
      );
    },
  });
};

export const useGetPermissionById = (id: string) => {
  return useQuery({
    queryKey: ["permission", id],
    queryFn: () => permissionService.getPermissionById(id),
    enabled: !!id,
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Ma'lumotni olishda xatolik",
      );
    },
  });
};
