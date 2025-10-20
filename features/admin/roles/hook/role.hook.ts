import { useMutation, useQuery, useQueryClient } from "react-query";
import { RoleZodType } from "../schema/role.schema";
import { rolesService } from "../service/role.service";
import { toast } from "sonner";

export const useRoleCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RoleZodType) => rolesService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Rol muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message);
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
      toast.success("Rol muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => {
      toast.error(error.message);
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
      toast.success("Rol muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message);
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
