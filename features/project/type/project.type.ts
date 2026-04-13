import { DataPagination } from "@/types/global.types";
import { CHART_COLORS } from "@/lib/colors";

export enum ProjectStatus {
    PLANNING = "PLANNING",
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    ARCHIVED = "ARCHIVED",
}

export enum ProjectVisibility {
    PRIVATE = "PRIVATE",
    DEPARTMENT = "DEPARTMENT",
    PUBLIC = "PUBLIC",
}

export const PROJECT_VISIBILITY_OPTIONS = [
    { value: ProjectVisibility.PRIVATE, label: "Maxfiy", icon: "🔒", color: "gray", description: "Faqat tanlangan a'zolar ko'radi" },
    { value: ProjectVisibility.DEPARTMENT, label: "Bo'lim", icon: "🏢", color: "blue", description: "Tanlangan bo'lim hammasi ko'radi" },
    { value: ProjectVisibility.PUBLIC, label: "Umumiy", icon: "🌐", color: "green", description: "Hamma kompaniya xodimlari ko'radi" },
] as const;

export const PROJECT_STATUS_OPTIONS = [
    { value: ProjectStatus.PLANNING, label: "Rejalashtirish" },
    { value: ProjectStatus.ACTIVE, label: "Faol" },
    { value: ProjectStatus.ON_HOLD, label: "To'xtatilgan" },
    { value: ProjectStatus.COMPLETED, label: "Yakunlangan" },
    { value: ProjectStatus.CANCELLED, label: "Bekor qilingan" },
    { value: ProjectStatus.ARCHIVED, label: "Arxivlangan" },
] as const;

export const PROJECT_COLOR_PALETTE = CHART_COLORS;

export interface ProjectGetResponse {
    id: string;
    name: string;
    description?: string;
    key: string;
    status: ProjectStatus;
    visibility?: ProjectVisibility;
    createdById?: string;
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
    penaltyPerDay: number;
    isArchived?: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        tasks: number;
        members: number;
    };
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
    visibility?: ProjectVisibility;
    departmentId?: string;
    initialMemberIds?: string[];
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
    visibility?: ProjectVisibility;
    departmentId?: string;
}
