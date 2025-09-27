import { z } from "zod";

export const documentScheme = z.object({
  name: z
    .string()
    .min(2, "Document nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
  deportamentId: z.string().uuid().optional(),
});
