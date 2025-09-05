import { useQuery } from "react-query";
import { userService } from "@/features/admin/admin-users/service/user.service";
import { UserGetRequest } from "@/features/admin/admin-users/type/user.types";

export const useGetUserQuery = () => {
  return useQuery<UserGetRequest>({
    queryKey: "user",
    queryFn: userService.getAllUsers,
    keepPreviousData: true,
  });
};
