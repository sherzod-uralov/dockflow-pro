import { z } from "zod";

// ============================================
// WORKFLOW STEP SCHEMA
// ============================================

export const workflowStepSchema = z.object({
  id: z
    .string()
    .uuid({
      message: "Step IDsi noto'g'ri formatda",
    })
    .optional(), // ✨ ID существующего step (только для edit режима)

  assignedToUserId: z
    .string()
    .uuid({
      message: "Foydalanuvchi IDsi noto'g'ri formatda",
    })
    .min(1, "Mas'ul shaxsni tanlang"),

  actionType: z.enum(["APPROVAL", "REVIEW", "SIGN", "QR_CODE", "ACKNOWLEDGE"], {
    required_error: "Amal turini tanlang",
    invalid_type_error: "Noto'g'ri amal turi",
  }),
});

// ============================================
// WORKFLOW CREATE SCHEMA
// ============================================

export const workflowCreateSchema = z
  .object({
    documentId: z
      .string()
      .uuid({
        message: "Hujjat IDsi noto'g'ri formatda",
      })
      .min(1, "Hujjatni tanlang"),

    workflowType: z.enum(["Ketma-ket", "Parallel"], {
      required_error: "Workflow turini tanlang",
      invalid_type_error: "Noto'g'ri workflow turi",
    }),

    steps: z
      .array(workflowStepSchema)
      .min(1, "Kamida bitta bosqich talab qilinadi")
      .max(20, "Maksimal 20 ta bosqich qo'shish mumkin"),
  })
  .superRefine((data, ctx) => {
    const userIds = data.steps.map((s) => s.assignedToUserId).filter(Boolean);
    const seen = new Map<string, number>();

    userIds.forEach((userId, index) => {
      if (seen.has(userId)) {
        const firstIndex = seen.get(userId)!;

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Bu foydalanuvchi allaqachon ${firstIndex + 1}-bosqichda tanlangan`,
          path: [`steps`, index, `assignedToUserId`],
        });

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Bu foydalanuvchi ${index + 1}-bosqichda ham tanlangan`,
          path: [`steps`, firstIndex, `assignedToUserId`],
        });
      } else {
        seen.set(userId, index);
      }
    });
  });

// ============================================
// WORKFLOW UPDATE SCHEMA (ИСПРАВЛЕНО)
// ============================================

export const workflowUpdateSchema = z
  .object({
    // ✅ ИСПРАВЛЕНО: documentId не валидируется в edit режиме
    // Он будет игнорироваться при отправке на backend
    documentId: z.string().optional(),

    workflowType: z.enum(["Ketma-ket", "Parallel"], {
      required_error: "Workflow turini tanlang",
      invalid_type_error: "Noto'g'ri workflow turi",
    }),

    steps: z
      .array(workflowStepSchema)
      .min(1, "Kamida bitta bosqich talab qilinadi")
      .max(20, "Maksimal 20 ta bosqich qo'shish mumkin"),
  })
  .superRefine((data, ctx) => {
    const userIds = data.steps.map((s) => s.assignedToUserId).filter(Boolean);
    const seen = new Map<string, number>();

    userIds.forEach((userId, index) => {
      if (seen.has(userId)) {
        const firstIndex = seen.get(userId)!;

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Bu foydalanuvchi allaqachon ${firstIndex + 1}-bosqichda tanlangan`,
          path: [`steps`, index, `assignedToUserId`],
        });

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Bu foydalanuvchi ${index + 1}-bosqichda ham tanlangan`,
          path: [`steps`, firstIndex, `assignedToUserId`],
        });
      } else {
        seen.set(userId, index);
      }
    });
  });

// ============================================
// LEGACY SCHEMA
// ============================================

export const workflowScheme = z.object({
  name: z
    .string()
    .min(2, "Workflow nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type WorkflowCreateType = z.infer<typeof workflowCreateSchema>;
export type WorkflowUpdateType = z.infer<typeof workflowUpdateSchema>;
export type WorkflowStepFormType = z.infer<typeof workflowStepSchema>;

// ✅ ОБНОВЛЕНО: используем union type для создания и редактирования
export type WorkflowFormType = WorkflowCreateType | WorkflowUpdateType;
