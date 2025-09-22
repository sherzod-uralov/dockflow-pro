import { z } from "zod";

export const journalCreate = () =>
  z.object({
    // Название журнала, от 2 до 100 символов
    name: z.string().min(2).max(100),

    // Префикс, от 1 до 10 символов
    prefix: z.string().min(1).max(10),

    // Формат, должен содержать как минимум 3 символа
    format: z.string().min(3),

    // ID департамента, должен быть в формате UUID
    departmentId: z.string().uuid({
      message: "Departament IDsi noto'g'ri formatda",
    }),

    // ID ответственного пользователя, должен быть в формате UUID
    responsibleUserId: z.string().uuid({
      message: "Mas'ul foydalanuvchi IDsi noto'g'ri formatda",
    }),
  });

export type JournalCreateType = z.infer<ReturnType<typeof journalCreate>>;
