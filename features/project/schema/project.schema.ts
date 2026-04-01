import { z } from "zod";
import { ProjectStatus } from "../type/project.type";

export const projectCreateSchema = z.object({
    name: z
        .string()
        .min(1, "Loyiha nomi kiritilishi shart")
        .max(200, "Loyiha nomi 200 belgidan oshmasligi kerak"),
    description: z.string().optional(),
    key: z
        .string()
        .min(2, "Kalit kamida 2 belgidan iborat bo'lishi kerak")
        .max(10, "Kalit 10 belgidan oshmasligi kerak")
        .regex(/^[A-Z0-9_-]+$/, "Kalit faqat katta harflar, raqamlar, _ va - dan iborat bo'lishi kerak")
        .transform((val) => val.toUpperCase()),
    status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
    departmentId: z.string().uuid("Noto'g'ri bo'lim ID").optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budget: z.number().min(0, "Byudjet manfiy bo'lishi mumkin emas").optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Noto'g'ri rang formati").optional(),
    icon: z.string().optional(),
});

export const projectUpdateSchema = z.object({
    name: z
        .string()
        .min(1, "Loyiha nomi kiritilishi shart")
        .max(200, "Loyiha nomi 200 belgidan oshmasligi kerak")
        .optional(),
    description: z.string().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    departmentId: z.string().uuid("Noto'g'ri bo'lim ID").optional().nullable(),
});

export const projectQuerySchema = z.object({
    pageNumber: z.number().min(1).optional(),
    pageSize: z.number().min(1).max(100).optional(),
    search: z.string().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    departmentId: z.string().uuid().optional(),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
