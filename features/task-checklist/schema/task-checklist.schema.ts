import { z } from "zod";

export const taskChecklistCreateSchema = z.object({
  taskId: z.string().uuid("Vazifa tanlanishi shart"),
  title: z.string().min(2, "Kamida 2 ta belgi").max(255, "Ko'pi bilan 255 ta belgi"),
  position: z.number().min(0).optional().default(0),
});

export const taskChecklistUpdateSchema = z.object({
  title: z.string().min(2, "Kamida 2 ta belgi").max(255, "Ko'pi bilan 255 ta belgi").optional(),
  position: z.number().min(0).optional(),
});

export const checklistItemCreateSchema = z.object({
  title: z.string().min(2, "Kamida 2 ta belgi").max(500, "Ko'pi bilan 500 ta belgi"),
  position: z.number().min(0).optional().default(0),
});

export const checklistItemUpdateSchema = z.object({
  title: z.string().min(2, "Kamida 2 ta belgi").max(500, "Ko'pi bilan 500 ta belgi").optional(),
  isCompleted: z.boolean().optional(),
  position: z.number().min(0).optional(),
});

export type TaskChecklistCreateInput = z.infer<typeof taskChecklistCreateSchema>;
export type TaskChecklistUpdateInput = z.infer<typeof taskChecklistUpdateSchema>;
export type ChecklistItemCreateInput = z.infer<typeof checklistItemCreateSchema>;
export type ChecklistItemUpdateInput = z.infer<typeof checklistItemUpdateSchema>;
