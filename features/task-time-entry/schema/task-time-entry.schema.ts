import { z } from "zod";

export const taskTimeEntryCreateSchema = z.object({
  taskId: z.string().uuid("Vazifa tanlanishi shart"),
  description: z.string().optional(),
  hours: z.number().positive("Soat musbat bo'lishi kerak"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana formati: YYYY-MM-DD"),
  isBillable: z.boolean().optional().default(true),
});

export const taskTimeEntryUpdateSchema = z.object({
  description: z.string().optional(),
  hours: z.number().positive("Soat musbat bo'lishi kerak").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana formati: YYYY-MM-DD").optional(),
  isBillable: z.boolean().optional(),
});

export type TaskTimeEntryCreateInput = z.infer<typeof taskTimeEntryCreateSchema>;
export type TaskTimeEntryUpdateInput = z.infer<typeof taskTimeEntryUpdateSchema>;
