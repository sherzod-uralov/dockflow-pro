import { z } from "zod";

export const deportamentScheme = z.object({
  name: z
    .string()
    .min(2, "Deportament nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
  description: z
    .string()
    .min(10, "Tavsif kamida 10 ta belgidan iborat bo'lishi kerak"),

  code: z.string().min(3, "Kod kamida 2 ta belgidan iborat bo'lishi kerak"),
  location: z
    .string()
    .min(3, "Manzil kamida 2 ta belgidan iborat bo'lishi kerak"),
  parentId: z.string().nullable().optional(),
  directorId: z.string().nullable().optional(),
});

export type DeportamentInferType = z.infer<typeof deportamentScheme>;
