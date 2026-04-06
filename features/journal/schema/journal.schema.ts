import { z } from "zod";

export const journalSchema = () =>
  z.object({
    name: z.string().min(2).max(100),
    prefix: z
      .string()
      .min(1, "Prefiks kiritilishi shart")
      .max(3, "Prefiks 3 ta belgidan oshmasligi kerak")
      .transform((val) => val.toUpperCase()),
    format: z
      .string()
      .min(3)
      .refine(
        (val) => {
          const hasPrefix = val.includes("{PREFIX}");
          const hasYear = val.includes("{YEAR}");
          const hasNumber = /\{NUMBER:\d+\}/.test(val);
          return hasPrefix && hasYear && hasNumber;
        },
        "Format {PREFIX}, {YEAR}, {NUMBER:N} tokenlarini o'z ichiga olishi kerak",
      ),
    departmentId: z.string().uuid({
      message: "Departament IDsi noto'g'ri formatda",
    }),
    responsibleUserId: z.string().uuid({
      message: "Mas'ul foydalanuvchi IDsi noto'g'ri formatda",
    }),
  });

export type JournalCreateType = z.infer<ReturnType<typeof journalSchema>>;
