import { z } from "zod";

export const documentScheme = z.object({
  title: z
    .string()
    .min(2, "Hujjat nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
  description: z.string().min(1, "Hujjat tavsifi kiritilishi kerak"),
  documentNumber: z
    .string()
    .min(1, "Hujjat raqami kiritilishi kerak")
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  documentTypeId: z.string().uuid("Hujjat turi tanlanishi kerak"),
  journalId: z.string().uuid("Jurnal tanlanishi kerak"),
  templateId: z.string().optional(),
  tags: z.record(z.string(), z.string()).optional().default({}),
  attachments: z.array(z.string().uuid()).optional().default([]),
});

export type DocumentFormType = z.infer<typeof documentScheme>;
