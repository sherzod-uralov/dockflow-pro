import { DataPagination } from "@/types/global.types";

export enum SprintStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const SPRINT_STATUS_OPTIONS = [
  { value: SprintStatus.PLANNING, label: "Rejalashtirish", color: "#95a5a6" },
  { value: SprintStatus.ACTIVE, label: "Faol", color: "#3498db" },
  { value: SprintStatus.COMPLETED, label: "Yakunlangan", color: "#2ecc71" },
  { value: SprintStatus.CANCELLED, label: "Bekor qilingan", color: "#e74c3c" },
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
