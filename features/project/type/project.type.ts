import { DataPagination } from "@/types/global.types";

export enum ProjectStatus {
    PLANNING = "PLANNING",
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    ARCHIVED = "ARCHIVED",
}

export const PROJECT_STATUS_OPTIONS = [
    { value: ProjectStatus.PLANNING, label: "Rejalashtirish" },
    { value: ProjectStatus.ACTIVE, label: "Faol" },
    { value: ProjectStatus.ON_HOLD, label: "To'xtatilgan" },
    { value: ProjectStatus.COMPLETED, label: "Yakunlangan" },
    { value: ProjectStatus.CANCELLED, label: "Bekor qilingan" },
    { value: ProjectStatus.ARCHIVED, label: "Arxivlangan" },
] as const;

export const PROJECT_COLOR_PALETTE = [
    "#3498db", // Blue
    "#2ecc71", // Green
    "#e74c3c", // Red
    "#f39c12", // Orange
    "#9b59b6", // Purple
    "#1abc9c", // Turquoise
    "#e67e22", // Carrot
    "#34495e", // Dark Gray
    "#16a085", // Green Sea
    "#c0392b", // Dark Red
] as const;

export interface ProjectGetResponse {
    id: string;
    name: string;
    description?: string;
    key: string;
    status: ProjectStatus;
    departmentId?: string;
    department?: {
        id: string;
        name: string;
    };
    startDate?: string;
    endDate?: string;
    budget?: number;
    color?: string;
    icon?: string;
    createdBy?: {
        id: string;
        fullname: string;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface GetAllProjects extends DataPagination {
    data: ProjectGetResponse[];
}

export interface ProjectQueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    status?: ProjectStatus;
    departmentId?: string;
}

export interface ProjectFormData {
    name: string;
    description?: string;
    key: string;
    status: ProjectStatus;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    color?: string;
    icon?: string;
}

export interface ProjectCreatePayload extends ProjectFormData { }

export interface ProjectUpdatePayload {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    color?: string;
    icon?: string;
}
