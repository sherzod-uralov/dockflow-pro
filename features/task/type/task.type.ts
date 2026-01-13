import { DataPagination } from "@/types/global.types";

export enum TaskStatus {
    NOT_STARTED = "NOT_STARTED",
    ACTIVE = "ACTIVE",
    IN_REVIEW = "IN_REVIEW",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    ARCHIVED = "ARCHIVED",
}

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT",
}

export const TASK_STATUS_OPTIONS = [
    { value: TaskStatus.NOT_STARTED, label: "Boshlanmagan", color: "#95a5a6" },
    { value: TaskStatus.ACTIVE, label: "Faol", color: "#3498db" },
    { value: TaskStatus.IN_REVIEW, label: "Ko'rib chiqilmoqda", color: "#f39c12" },
    { value: TaskStatus.COMPLETED, label: "Yakunlangan", color: "#2ecc71" },
    { value: TaskStatus.CANCELLED, label: "Bekor qilingan", color: "#e74c3c" },
    { value: TaskStatus.ARCHIVED, label: "Arxivlangan", color: "#6c757d" },
] as const;

export const TASK_PRIORITY_OPTIONS = [
    { value: TaskPriority.LOW, label: "Past", color: "#95a5a6" },
    { value: TaskPriority.MEDIUM, label: "O'rta", color: "#3498db" },
    { value: TaskPriority.HIGH, label: "Yuqori", color: "#f39c12" },
    { value: TaskPriority.URGENT, label: "Shoshilinch", color: "#e74c3c" },
] as const;

export interface TaskAssigneeUser {
    id: string;
    fullname: string;
    username: string;
    avatarUrl?: string | null;
}

export interface TaskAssignee {
    id: string;
    user: TaskAssigneeUser;
}

export interface TaskGetResponse {
    id: string;
    title: string;
    description?: string;
    projectId: string;
    project?: {
        id: string;
        name: string;
        key: string;
        color?: string;
    };
    categoryId?: string;
    category?: {
        id: string;
        name: string;
    };
    status: TaskStatus;
    priority: TaskPriority;
    assignees?: TaskAssignee[];
    parentTaskId?: string;
    parentTask?: {
        id: string;
        title: string;
    };
    startDate?: string;
    dueDate?: string;
    estimatedHours?: number;
    position?: number;
    createdBy?: {
        id: string;
        fullname: string;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
    _count?: {
        subtasks: number;
        comments: number;
        attachments: number;
        watchers: number;
    };
}

export interface GetAllTasks extends DataPagination {
    data: TaskGetResponse[];
}

export interface TaskQueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeIds?: string;
    createdById?: string;
    categoryId?: string;
    parentTaskId?: string;
}

export interface TaskFormData {
    title: string;
    description?: string;
    projectId: string;
    categoryId?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeIds?: string[];
    parentTaskId?: string;
    startDate?: string;
    dueDate?: string;
    estimatedHours?: number;
    position?: number;
}

export interface TaskCreatePayload extends TaskFormData { }

export interface TaskUpdatePayload {
    title?: string;
    description?: string;
    categoryId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeIds?: string[];
    parentTaskId?: string;
    startDate?: string;
    dueDate?: string;
    estimatedHours?: number;
    position?: number;
}

// Kanban board types
export interface KanbanColumn {
    id: TaskStatus;
    title: string;
    tasks: TaskGetResponse[];
    color: string;
}

export interface KanbanBoardData {
    columns: KanbanColumn[];
}

// Calendar types
export interface CalendarTask {
    id: string;
    title: string;
    priority: TaskPriority;
    project?: {
        name: string;
        color?: string;
    };
    dueDate: string;
}

export interface CalendarDayData {
    date: string;
    tasks: CalendarTask[];
}
