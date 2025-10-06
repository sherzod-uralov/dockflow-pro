import { z } from "zod";

export const documentTypeScheme = z.object({
  name: z
    .string()
    .min(2, "Hujjat nomi nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
  description: z
    .string()
    .min(8, "Hujjat tavsifi  kamida 8 ta belgidan iborat bo'lishi kerak"),
});
