import { DataPagination } from "@/types/global.types";
import { ModalState } from "@/types/modal";

export interface Role {
  name: string;
  description: string;
  permissions: string[];
}

export interface RoleData {
  id: string;
  name: string;
  description: string;
  permissions: Array<{ id: string; name: string }>;
  users: number;
}

export interface RoleResponse extends DataPagination {
  data: RoleData[];
}

export interface RoleFormProps {
  modal: ModalState;
  mode: "create" | "edit";
  role?: RoleData | null;
}
