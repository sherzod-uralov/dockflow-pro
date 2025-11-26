import { z } from "zod";

export const deportamentScheme = z.object({
  name: z
    .string(),
  description: z
    .string()
    .min(3, "Tavsif kamida 3 ta belgidan iborat bo'lishi kerak"),

  code: z.string(),
  location: z
    .string()
    .min(3, "Manzil kamida 2 ta belgidan iborat bo'lishi kerak"),
  directorId: z.string().nullable().optional(),
});

export type DeportamentInferType = z.infer<typeof deportamentScheme>;
