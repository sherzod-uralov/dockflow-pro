import { z } from "zod";

export const UserSchema = z.object({
  fullname: z
    .string()
    .min(2, {
      message: "Ism familiya kamida 2 ta belgidan iborat bo‘lishi kerak",
    })
    .max(100, { message: "Ism familiya 100 ta belgidan oshmasligi kerak" }),

  username: z
    .string()
    .min(2, {
      message: "Foydalanuvchi nomi kamida 2 ta belgidan iborat bo‘lishi kerak",
    })
    .max(100, {
      message: "Foydalanuvchi nomi 100 ta belgidan oshmasligi kerak",
    }),

  password: z
    .string()
    .min(8, { message: "Parol kamida 8 ta belgidan iborat bo‘lishi kerak" })
    .max(100, { message: "Parol 100 ta belgidan oshmasligi kerak" }),

  roleId: z.string().uuid({ message: "Rol identifikatori noto‘g‘ri formatda" }),

  departmentId: z
    .string()
    .uuid({ message: "Bo‘lim identifikatori noto‘g‘ri formatda" }),

  avatarUrl: z
    .string()
    .url({ message: "Avatar URL noto‘g‘ri formatda bo‘lishi kerak" })
    .optional(),

  isActive: z
    .boolean({ required_error: "Foydalanuvchi holati ko‘rsatilishi shart" })
    .default(true),
});

export type UserSchemaZodType = z.infer<typeof UserSchema>;
