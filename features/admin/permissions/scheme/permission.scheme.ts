import { z } from "zod";

export const permissionScheme = z.object({
  name: z
    .string()
    .min(2, "Ruxsat nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
  description: z
    .string()
    .min(5, "Tavsif kamida 5 ta belgidan iborat bo'lishi kerak"),
  key: z
    .string()
    .regex(
      /^[a-zA-Z]+:(read|create|delete|update|change-request)$/,
      "Kalit faqat 'soz:read|create|delete|update|change-request' formatida bo'lishi kerak (masalan: document:delete)",
    ),
  module: z
    .string()
    .min(2, "Modul nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
});
