import { z } from "zod";
import { TaskPriority } from "../type/task.type";

export const taskCreateSchema = z.object({
    title: z
        .string()
        .min(1, "Vazifa nomi kiritilishi shart")
        .max(500, "Vazifa nomi 500 belgidan oshmasligi kerak"),
    description: z.string().optional(),
    projectId: z.string().uuid("Noto'g'ri loyiha ID"),
    categoryId: z.string().uuid("Noto'g'ri kategoriya ID").optional(),
    priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
    score: z.number().min(0, "Ball manfiy bo'lishi mumkin emas").optional(),
    assigneeIds: z.array(z.string().uuid("Noto'g'ri foydalanuvchi ID")).optional(),
    parentTaskId: z.string().uuid("Noto'g'ri ota vazifa ID").optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    estimatedHours: z.number().min(0, "Taxminiy soatlar manfiy bo'lishi mumkin emas").optional(),
    position: z.number().min(0).optional(),
    boardColumnId: z.string().uuid("Noto'g'ri ustun ID").optional(),
    coverImageUrl: z.string().optional(),
});

export const taskUpdateSchema = z.object({
    title: z
        .string()
        .min(1, "Vazifa nomi kiritilishi shart")
        .max(500, "Vazifa nomi 500 belgidan oshmasligi kerak")
        .optional(),
    description: z.string().optional(),
    categoryId: z.string().uuid("Noto'g'ri kategoriya ID").optional().nullable(),
    priority: z.nativeEnum(TaskPriority).optional(),
    score: z.number().min(0, "Ball manfiy bo'lishi mumkin emas").optional().nullable(),
    assigneeIds: z.array(z.string().uuid("Noto'g'ri foydalanuvchi ID")).optional().nullable(),
    parentTaskId: z.string().uuid("Noto'g'ri ota vazifa ID").optional().nullable(),
    startDate: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    estimatedHours: z.number().min(0, "Taxminiy soatlar manfiy bo'lishi mumkin emas").optional().nullable(),
    position: z.number().min(0).optional(),
    boardColumnId: z.string().uuid("Noto'g'ri ustun ID").optional().nullable(),
    coverImageUrl: z.string().optional().nullable(),
});

export const taskQuerySchema = z.object({
    pageNumber: z.number().min(1).optional(),
    pageSize: z.number().min(1).max(100).optional(),
    search: z.string().optional(),
    projectId: z.string().uuid().optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assigneeId: z.string().uuid().optional(),
    createdById: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    boardColumnId: z.string().uuid().optional(),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
