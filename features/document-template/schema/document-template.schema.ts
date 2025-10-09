import { z } from "zod";

export const documentTemplateScheme = z.object({
  name: z
    .string()
    .min(2, "DocumentTemplate nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
});
