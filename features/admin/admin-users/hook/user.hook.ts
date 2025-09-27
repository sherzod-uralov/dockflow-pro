import { useMutation, useQuery, useQueryClient } from "react-query";
import { userService } from "@/features/admin/admin-users/service/user.service";
import { UserGetRequest } from "@/features/admin/admin-users/type/user.types";
import { toast } from "sonner";
import { UserSchemaZodType } from "../schema/user.schema";
import { useForm } from "react-hook-form";

export const useGetUserQuery = () => {
  return useQuery<UserGetRequest>({
    queryKey: "user",
    queryFn: userService.getAllUsers,
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
