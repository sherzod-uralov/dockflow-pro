import { useMutation, useQuery } from "react-query";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";
import { LoginBody } from "@/features/login/type/login.type";
import { authService } from "@/features/login/service/login.service";
import { showError, showSuccess } from "@/utils/show-error";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: LoginBody) => authService.login(payload),
    onSuccess: () => {
      showSuccess("Muvaffaqiyatli kirdingiz");
    },
    onError: (error) => {
      showError(error);
    },
  });
};

export const useGetProfileQuery = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
    keepPreviousData: true,
  });
};

export const useLogoutMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      Cookie.remove("accessToken");
      showSuccess("Tizimdan muvaffaqiyatli chiqdingiz");
      router.push("/login");
    },
    onError: () => {
      showError("Chiqishda xatolik");
    },
  });
};

export const useProfileUpdateMutation = () => {
  return useMutation({
    mutationFn: (payload: any) => authService.updateProfile(payload),
    onSuccess: () => {
      showSuccess("Profil muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      throw new Error(error.message);
    },
  });
};
