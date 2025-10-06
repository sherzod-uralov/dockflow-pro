import { z } from "zod";

export const loginScheme = z.object({
  username: z.string().min(3, {
    message: "Foydalanuvchi nomi 3 tadan katta bo'lishi kerak",
  }),
  password: z.string().min(3, {
    message: "Parol uzunligi 8 tadan katta bo'lishi kerak",
  }),
});

export type LoginFormValue = z.infer<typeof loginScheme>;
