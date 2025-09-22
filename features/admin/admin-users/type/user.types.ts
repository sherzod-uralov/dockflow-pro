import { DataPagination } from "@/types/global.types";
import { UserSchemaZodType } from "../schema/user.schema";
import { ModalState } from "@/types/modal";

export interface UserGetRequest extends DataPagination {
  data: User[];
}

export interface User {
  id: string;
  fullname: string;
  username: string;
  avatarUrl: string;
  isActive: boolean;
  role: string;
  department: null;
  lastLogin: null;
  createdAt: string;
}

export interface userCreateBody {
  fullname: string;
  username: string;
  password: string;
  roleId: string;
  departmentId: string;
  avatarUrl: string;
  isActive: boolean;
}

export interface UserFormProps {
  mode: "create" | "edit";
  modal: ModalState;
  userData?: UserSchemaZodType;
}
