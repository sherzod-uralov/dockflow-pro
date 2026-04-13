import { DataPagination } from "@/types/global.types";
import { TASK_PRIORITY } from "@/lib/colors";

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT",
    CRITICAL = "CRITICAL",
}

export const TASK_PRIORITY_OPTIONS = [
    { value: TaskPriority.LOW, label: "Past", color: TASK_PRIORITY.LOW.color },
    { value: TaskPriority.MEDIUM, label: "O'rta", color: TASK_PRIORITY.MEDIUM.color },
    { value: TaskPriority.HIGH, label: "Yuqori", color: TASK_PRIORITY.HIGH.color },
    { value: TaskPriority.URGENT, label: "Shoshilinch", color: TASK_PRIORITY.URGENT.color },
    { value: TaskPriority.CRITICAL, label: "Juda muhim", color: TASK_PRIORITY.CRITICAL.color },
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

export interface TaskSubtaskInline {
    id: string;
    title: string;
    priority: TaskPriority;
}

export interface TaskGetResponse {
    id: string;
    title: string;
    description?: string;
    taskNumber: number;
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
    priority: TaskPriority;
    score: number | null;
    scoreConfigId?: string;
    assignees?: TaskAssignee[];
    parentTaskId?: string;
    parentTask?: {
        id: string;
        title: string;
    };
    subtasks?: TaskSubtaskInline[];
    startDate?: string;
    dueDate?: string;
    estimatedHours?: number;
    position?: number;
    completedAt?: string;
    isArchived?: boolean;
    createdById?: string;
    createdBy?: {
        id: string;
        fullname: string;
        username: string;
    };
    boardColumnId?: string;
    boardColumn?: {
        id: string;
        name: string;
        color?: string;
        isClosed?: boolean;
    };
    coverImageUrl?: string;
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
    priority?: TaskPriority;
    assigneeId?: string;
    createdById?: string;
    categoryId?: string;
    parentTaskId?: string;
    boardColumnId?: string;
}

export interface TaskFormData {
    title: string;
    description?: string;
    projectId: string;
    categoryId?: string;
    priority: TaskPriority;
    score?: number;
    scoreConfigId?: string;
    assigneeIds?: string[];
    parentTaskId?: string;
    startDate?: string;
    dueDate?: string;
    estimatedHours?: number;
    position?: number;
    boardColumnId?: string;
    coverImageUrl?: string;
}

export interface TaskCreatePayload extends TaskFormData {}

export interface TaskUpdatePayload {
    title?: string;
    description?: string;
    categoryId?: string;
    priority?: TaskPriority;
    score?: number;
    scoreConfigId?: string;
    assigneeIds?: string[];
    parentTaskId?: string | null;
    boardColumnId?: string;
    coverImageUrl?: string;
}

// Calendar types
export interface CalendarTask {
    id: string;
    title: string;
    taskNumber: number;
    priority: TaskPriority;
    project?: {
        name: string;
        key: string;
        color?: string;
    };
    dueDate: string;
}

export interface CalendarDayData {
    date: string;
    tasks: CalendarTask[];
}
