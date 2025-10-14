import { z } from "zod";

export const documentScheme = z.object({
  title: z
    .string()
    .min(2, "Hujjat nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
  description: z.string().optional(),
  documentNumber: z
    .string()
    .min(1, "Hujjat raqami kiritilishi kerak")
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
  documentTypeId: z.string().uuid("Yaroqli UUID kiritilishi kerak").optional(),
  journalId: z.string().uuid("Yaroqli UUID kiritilishi kerak").optional(),
  attachments: z.array(z.string().uuid()).optional(),
});

export type DocumentFormType = z.infer<typeof documentScheme>;
