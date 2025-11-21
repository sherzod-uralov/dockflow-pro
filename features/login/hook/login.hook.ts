import { useMutation, useQuery } from "react-query";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";
import { LoginBody } from "@/features/login/type/login.type";
import { authService } from "@/features/login/service/login.service";
import { toast } from "sonner";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: LoginBody) => authService.login(payload),
    onSuccess: () => {
      toast.success("muvaffaqiyatli kirdingiz", {
        description: "siz tizimga kirdingiz",
      });
    },
    onError: () => {
      toast.error("parolyoki login noto'g'ri");
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
      toast.success("Tizimdan muvaffaqiyatli chiqdingiz");
      router.push("/login");
    },
    onError: () => {
      toast.error("Chiqishda xatolik");
    },
  });
};

export const useProfileUpdateMutation = () => {
  return useMutation({
    mutationFn: (payload: any) => authService.updateProfile(payload),
    onSuccess: () => {
      toast.success("Profil muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      throw new Error(error.message);
    },
  });
};
