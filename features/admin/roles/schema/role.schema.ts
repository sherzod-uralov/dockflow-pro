import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(1000, {
    message: "tavsif uzunligi 1000 ta belgidan oshmasligi kerak",
  }),
  permissions: z
    .array(z.string().uuid())
    .min(1, { message: "iltimos ruxsatlarini tanlang" }),
});

export type RoleZodType = z.infer<typeof roleSchema>;
