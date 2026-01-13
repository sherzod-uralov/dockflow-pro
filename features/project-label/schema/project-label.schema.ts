import { z } from "zod";

export const projectLabelCreateSchema = z.object({
  projectId: z.string().uuid("Loyiha tanlanishi shart"),
  name: z.string().min(2, "Kamida 2 ta belgi").max(100, "Ko'pi bilan 100 ta belgi"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Noto'g'ri rang formati (masalan: #ff4444)"),
  description: z.string().max(255, "Ko'pi bilan 255 ta belgi").optional(),
});

export const projectLabelUpdateSchema = z.object({
  name: z.string().min(2, "Kamida 2 ta belgi").max(100, "Ko'pi bilan 100 ta belgi").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Noto'g'ri rang formati").optional(),
  description: z.string().max(255, "Ko'pi bilan 255 ta belgi").optional(),
});

export type ProjectLabelCreateInput = z.infer<typeof projectLabelCreateSchema>;
export type ProjectLabelUpdateInput = z.infer<typeof projectLabelUpdateSchema>;
