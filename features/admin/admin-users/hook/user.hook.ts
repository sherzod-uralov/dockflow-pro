import { useMutation, useQuery, useQueryClient } from "react-query";
import { userService } from "@/features/admin/admin-users/service/user.service";
import {
  User,
  userDetails,
  UserGetRequest,
  UserHookProps,
} from "@/features/admin/admin-users/type/user.types";
import { showError, showSuccess } from "@/utils/show-error";
import { UserSchemaZodType } from "../schema/user.schema";
import { useForm } from "react-hook-form";

export const useGetUserQuery = ({
  pageNumber = 1,
  pageSize = 10,
  search = "",
  departmentId,
}: Partial<UserHookProps> = {}) => {
  return useQuery<UserGetRequest>({
    queryKey: ["user", pageNumber, pageSize, search, departmentId],
    queryFn: () => userService.getAllUsers({ pageNumber, pageSize, search, departmentId }),
    keepPreviousData: true,
  });
};

export const useCreateUserMutation = (form?: ReturnType<typeof useForm>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: UserSchemaZodType) => userService.createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries("user");
      showSuccess("Foydalanuvchi muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      showError(error);
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries("user");
      showSuccess("Foydalanuvchi muvaffaqiyatli o'chirildi");
    },
    onError: () => {
      showError("Foydalanuvchi o'chirishda xatolik yuz berdi");
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: User }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries("user");
      showSuccess("Foydalanuvchi muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      showError(error);
    },
  });
};

export const useGetUserByIdQuery = (id: string) => {
  return useQuery<userDetails>({
    queryKey: ["user", id],
    queryFn: () => userService.getUserById(id),
    keepPreviousData: true,
  });
};
