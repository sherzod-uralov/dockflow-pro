import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import { User, UserGetRequest, UserHookProps } from "../type/user.types";
import { UserSchemaZodType } from "../schema/user.schema";

export const userService = createCRUDService<
  User,
  UserSchemaZodType,
  Partial<User>,
  UserHookProps,
  UserGetRequest
>(endpoints.user, {
  transformParams: (params) => ({
    pageNumber: params ? Number(params.pageNumber) : undefined,
    pageSize: params ? Number(params.pageSize) : undefined,
    search: params?.search || undefined,
    departmentId: params?.departmentId || undefined,
  }),
});

// Backwards compatible aliases
export const {
  getAll: getAllUsers,
  getById: getUserById,
  create: createUser,
  update: updateUser,
  delete: deleteUser,
} = userService;
