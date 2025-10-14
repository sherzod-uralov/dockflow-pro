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
    .optional()
    .refine(
      (val) =>
        !val ||
        (val.length >= 8 &&
          /[A-Z]/.test(val) &&
          /[a-z]/.test(val) &&
          /[0-9]/.test(val)),
      {
        message:
          "Parol kamida 8 belgi uzunlikda bo'lishi va kamida bitta bosh harf, kichik harf va raqam o'z ichiga olishi kerak",
      },
    ),

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
