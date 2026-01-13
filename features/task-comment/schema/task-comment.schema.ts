import { z } from "zod";

export const taskCommentCreateSchema = z.object({
  taskId: z.string().uuid("Vazifa tanlanishi shart"),
  content: z.string().min(1, "Izoh matni kiritilishi shart"),
  parentCommentId: z.string().uuid().optional(),
});

export const taskCommentUpdateSchema = z.object({
  content: z.string().min(1, "Izoh matni kiritilishi shart"),
});

export type TaskCommentCreateInput = z.infer<typeof taskCommentCreateSchema>;
export type TaskCommentUpdateInput = z.infer<typeof taskCommentUpdateSchema>;
