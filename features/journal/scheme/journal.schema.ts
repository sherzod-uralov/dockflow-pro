import { z } from "zod";

export const journalSchema = () =>
  z.object({
    name: z.string().min(2).max(100),
    prefix: z.string().min(1).max(10),
    format: z.string().min(3),
    departmentId: z.string().uuid({
      message: "Departament IDsi noto'g'ri formatda",
    }),
    responsibleUserId: z.string().uuid({
      message: "Mas'ul foydalanuvchi IDsi noto'g'ri formatda",
    }),
  });

export type JournalCreateType = z.infer<ReturnType<typeof journalSchema>>;
