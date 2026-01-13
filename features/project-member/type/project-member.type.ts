import { GlobalGetAllPaginationProps } from "@/types/global.types";

export type ProjectMemberRole = "OWNER" | "MANAGER" | "MEMBER" | "VIEWER";

export const PROJECT_MEMBER_ROLE_OPTIONS = [
  { value: "OWNER", label: "Egasi" },
  { value: "MANAGER", label: "Menejer" },
  { value: "MEMBER", label: "A'zo" },
  { value: "VIEWER", label: "Ko'ruvchi" },
] as const;

export interface ProjectMemberGetResponse {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  joinedAt: Date;
  project?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    fullname: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMemberCreatePayload {
  projectId: string;
  userId: string;
  role?: ProjectMemberRole;
}

export interface ProjectMemberUpdatePayload {
  role?: ProjectMemberRole;
}

export interface ProjectMemberQueryParams extends GlobalGetAllPaginationProps {
  projectId?: string;
  userId?: string;
  role?: ProjectMemberRole;
  search?: string;
}
