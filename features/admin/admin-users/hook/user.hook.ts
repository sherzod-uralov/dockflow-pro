import { useQuery } from "react-query";
import { createCRUDHooks } from "@/lib/crud-hooks";
import { userService } from "../service/user.service";
import {
  User,
  userDetails,
  UserGetRequest,
  UserHookProps,
} from "../type/user.types";
import { UserSchemaZodType } from "../schema/user.schema";

const userHooks = createCRUDHooks<
  User,
  UserSchemaZodType,
  Partial<User>,
  UserHookProps,
  UserGetRequest
>({
  service: userService,
  queryKey: "users",
  singleQueryKey: "user",
});

export const useGetUserQuery = ({
  pageNumber = 1,
  pageSize = 10,
  search = "",
  departmentId,
  projectId,
}: Partial<UserHookProps> = {}) =>
  userHooks.useGetAll({ pageNumber, pageSize, search, departmentId, projectId });

export const useCreateUserMutation = userHooks.useCreate;

export const useUpdateUserMutation = userHooks.useUpdate;

export const useDeleteUserMutation = userHooks.useDelete;

export const useGetUserByIdQuery = (id: string) => {
  return useQuery<userDetails>({
    queryKey: ["user", id],
    queryFn: () => userService.getById(id) as Promise<userDetails>,
    enabled: !!id,
  });
};
