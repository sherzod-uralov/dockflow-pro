import { DataPagination } from "@/types/global.types";
import { UserSchemaZodType } from "../schema/user.schema";
import { ModalState } from "@/types/modal";

export interface UserGetRequest extends DataPagination {
  data: User[];
}

export interface userResponse {
  id: string;
  fullname: string;
  username: string;
  avatarUrl: string;
  isActive: boolean;
  role: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    fullname: string;
    username: string;
  };
  lastLogin: null;
}

export interface User {
  id: string;
  fullname: string;
  username: string;
  avatarUrl: string;
  isActive: boolean;
  role: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    fullname: string;
    username: string;
  } | null;
  lastLogin: null | string;
  createdAt?: string; // optional qilish
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
  userData?: userResponse;
}

export interface userDetails {
  id: string;
  fullname: string;
  username: string;
  avatarUrl: string;
  isActive: boolean;
  role: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  };
  lastLogin: null;
  createdAt: string;
  updatedAt: string;
}

export interface UserHookProps {
  pageNumber: number;
  pageSize: number;
  search?: string;
}
