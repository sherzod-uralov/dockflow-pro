import { useMutation, useQuery, useQueryClient } from "react-query";
import { userService } from "@/features/admin/admin-users/service/user.service";
import {
  User,
  userDetails,
  UserGetRequest,
  UserHookProps,
} from "@/features/admin/admin-users/type/user.types";
import { toast } from "sonner";
import { UserSchemaZodType } from "../schema/user.schema";
import { useForm } from "react-hook-form";

export const useGetUserQuery = ({
  pageNumber = 1,
  pageSize = 10,
  search = "",
}: Partial<UserHookProps> = {}) => {
  return useQuery<UserGetRequest>({
    queryKey: ["user", pageNumber, pageSize, search],
    queryFn: () => userService.getAllUsers({ pageNumber, pageSize, search }),
    keepPreviousData: true,
  });
};

export const useCreateUserMutation = (form?: ReturnType<typeof useForm>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: UserSchemaZodType) => userService.createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries("user");
      toast.success("Foydalanuvchi muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries("user");
      toast.success("Foydalanuvchi muvaffaqiyatli o'chirildi");
    },
    onError: () => {
      toast.error("Foydalanuvchi o'chirishda xatolik yuz berdi");
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
      toast.success("Foydalanuvchi muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ?? error?.message ?? "Xatolik yuz berdi";
      toast.error(msg);
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
