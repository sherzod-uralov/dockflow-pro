import { z } from "zod";

export const documentTemplateSchema = z.object({
  name: z.string().min(1, "Shablon nomi kiritilishi shart"),
  description: z.string().min(1, "Tavsif kiritilishi shart"),
  documentTypeId: z.string().min(1, "Hujjat turi tanlanishi shart"),
  templateFileId: z.string().min(1, "Shablon fayli yuklash shart"),
  isActive: z.boolean().optional().default(true),
  isPublic: z.boolean().optional().default(true),
});

export type DocumentTemplateFormType = z.infer<typeof documentTemplateSchema>;
