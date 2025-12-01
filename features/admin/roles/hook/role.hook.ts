import { useMutation, useQuery, useQueryClient } from "react-query";
import { RoleZodType } from "../schema/role.schema";
import { rolesService } from "../service/role.service";
import { showError, showSuccess } from "@/utils/show-error";

export const useRoleCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RoleZodType) => rolesService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      showSuccess("Rol muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      showError(error);
    },
  });
};

export const useGetRoles = ({ pageSize = 7, pageNumber = 1, search = "" }) => {
  return useQuery({
    queryKey: ["roles", pageNumber, pageSize, search],
    queryFn: async () =>
      rolesService.getAllRoles({ pageSize, pageNumber, search }),
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => rolesService.deleteRole(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      showSuccess("Rol muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => {
      showError(error);
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RoleZodType }) =>
      rolesService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      showSuccess("Rol muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      showError(error);
    },
  });
};

export const useGetRoleByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => rolesService.getRoleById(id),
    enabled: !!id,
  });
};
