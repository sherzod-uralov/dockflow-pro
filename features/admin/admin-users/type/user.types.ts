import { DataPagination } from "@/types/global.types";

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
