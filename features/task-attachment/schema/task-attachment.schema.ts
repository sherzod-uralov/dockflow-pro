import { z } from "zod";

export const taskAttachmentCreateSchema = z.object({
  taskId: z.string().uuid("Vazifa tanlanishi shart"),
  attachmentId: z.string().uuid("Fayl tanlanishi shart"),
  description: z.string().max(500, "Ko'pi bilan 500 ta belgi").optional(),
});

export const taskAttachmentUpdateSchema = z.object({
  description: z.string().max(500, "Ko'pi bilan 500 ta belgi").optional(),
});

export type TaskAttachmentCreateInput = z.infer<typeof taskAttachmentCreateSchema>;
export type TaskAttachmentUpdateInput = z.infer<typeof taskAttachmentUpdateSchema>;
