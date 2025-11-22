import { z } from "zod";

// ============================================
// WORKFLOW TEMPLATE STEP SCHEMA
// ============================================

export const workflowTemplateStepSchema = z.object({
  order: z.number().min(0, "Tartib raqami 0 dan katta bo'lishi kerak"),

  actionType: z.enum(["APPROVAL", "REVIEW", "SIGN", "QR_CODE", "ACKNOWLEDGE"], {
    required_error: "Amal turini tanlang",
    invalid_type_error: "Noto'g'ri amal turi",
  }),

  assignedToUserId: z.string().min(1, "Foydalanuvchini tanlang"),
});

// ============================================
// WORKFLOW TEMPLATE SCHEMA
// ============================================

export const workflowTemplateSchema = z
  .object({
    name: z
      .string()
      .min(1, "Shablon nomi kiritilishi shart")
      .max(255, "Shablon nomi 255 ta belgidan oshmasligi kerak"),

    description: z
      .string()
      .min(1, "Tavsif kiritilishi shart")
      .max(1000, "Tavsif 1000 ta belgidan oshmasligi kerak"),

    documentTypeId: z.string().min(1, "Hujjat turi tanlanishi shart"),

    type: z.enum(["CONSECUTIVE", "PARALLEL"], {
      required_error: "Shablon turini tanlang",
      invalid_type_error: "Noto'g'ri shablon turi",
    }),

    isActive: z.boolean().optional().default(true),

    isPublic: z.boolean().optional().default(true),

    steps: z
      .array(workflowTemplateStepSchema)
      .min(1, "Kamida bitta bosqich talab qilinadi")
      .max(20, "Maksimal 20 ta bosqich qo'shish mumkin"),
  })
  .superRefine((data, ctx) => {
    // Check for duplicate user assignments
    const userIds = data.steps
      .map((s) => s.assignedToUserId)
      .filter((id): id is string => typeof id === "string" && id.length > 0);
    const seen = new Map<string, number>();

    userIds.forEach((userId) => {
      const originalIndex = data.steps.findIndex(
        (s) => s.assignedToUserId === userId,
      );
      if (seen.has(userId)) {
        const firstIndex = seen.get(userId);
        if (firstIndex !== undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Bu foydalanuvchi allaqachon ${firstIndex + 1}-bosqichda tanlangan`,
            path: [`steps`, originalIndex, `assignedToUserId`],
          });
        }
      } else {
        seen.set(userId, originalIndex);
      }
    });
  });

// ============================================
// UPDATE SCHEMA
// ============================================

export const workflowTemplateUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Shablon nomi kiritilishi shart")
    .max(255, "Shablon nomi 255 ta belgidan oshmasligi kerak")
    .optional(),

  description: z
    .string()
    .min(1, "Tavsif kiritilishi shart")
    .max(1000, "Tavsif 1000 ta belgidan oshmasligi kerak")
    .optional(),

  documentTypeId: z.string().min(1, "Hujjat turi tanlanishi shart").optional(),

  type: z
    .enum(["CONSECUTIVE", "PARALLEL"], {
      required_error: "Shablon turini tanlang",
      invalid_type_error: "Noto'g'ri shablon turi",
    })
    .optional(),

  isActive: z.boolean().optional(),

  isPublic: z.boolean().optional(),

  steps: z
    .array(workflowTemplateStepSchema)
    .min(1, "Kamida bitta bosqich talab qilinadi")
    .max(20, "Maksimal 20 ta bosqich qo'shish mumkin")
    .optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type WorkflowTemplateFormType = z.infer<typeof workflowTemplateSchema>;
export type WorkflowTemplateUpdateFormType = z.infer<
  typeof workflowTemplateUpdateSchema
>;
export type WorkflowTemplateStepFormType = z.infer<
  typeof workflowTemplateStepSchema
>;
