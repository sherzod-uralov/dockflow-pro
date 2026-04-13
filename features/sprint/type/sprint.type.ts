import { DataPagination } from "@/types/global.types";
import { colors } from "@/lib/colors";

export enum SprintStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const SPRINT_STATUS_OPTIONS = [
  { value: SprintStatus.PLANNING, label: "Rejalashtirish", color: colors.textDimmed },
  { value: SprintStatus.ACTIVE, label: "Faol", color: colors.info },
  { value: SprintStatus.COMPLETED, label: "Yakunlangan", color: colors.success },
  { value: SprintStatus.CANCELLED, label: "Bekor qilingan", color: colors.error },
] as const;

export interface SprintGetResponse {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status: SprintStatus;
  velocity?: number;
  sprintNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllSprints extends DataPagination {
  data: SprintGetResponse[];
}

export interface SprintQueryParams {
  pageNumber?: number;
  pageSize?: number;
  projectId: string;
  status?: SprintStatus;
}

export interface SprintFormData {
  projectId: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
}

export interface SprintCreatePayload extends SprintFormData {}

export interface SprintUpdatePayload {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}
