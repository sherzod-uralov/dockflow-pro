import { z } from "zod";

export const documentTypeScheme = z.object({
  name: z
    .string()
    .min(2, "DocumentType nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
});
