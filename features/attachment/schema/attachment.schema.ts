import { z } from "zod";

export const attachmentSchema = z.object({
  id: z.string().uuid("ID UUID formatida bo'lishi kerak"),
  fileName: z
    .string()
    .min(1, "Fayl nomi majburiy")
    .max(255, "Fayl nomi 255 belgidan oshmasligi kerak"),
  fileUrl: z
    .string()
    .url("Fayl URL manzili to'g'ri formatda bo'lishi kerak")
    .min(1, "Fayl URL manzili majburiy"),
  fileSize: z
    .number()
    .min(1, "Fayl hajmi 1 baytdan kichik bo'lmasligi kerak")
    .max(1024 * 1024 * 1024, "Fayl hajmi 1GB dan oshmasligi kerak"),
  mimeType: z
    .string()
    .min(1, "MIME type majburiy")
    .regex(
      /^[\w-]+\/[\w-]+$/,
      "MIME type formati noto'g'ri (masalan: application/pdf)",
    ),
  documentId: z.string().uuid("Hujjat ID si UUID formatida bo'lishi kerak"),
  uploadedById: z
    .string()
    .uuid("Yuklovchi ID si UUID formatida bo'lishi kerak"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().optional(),
});

export const createAttachmentSchema = attachmentSchema
  .omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true })
  .partial({
    fileUrl: true,
    fileSize: true,
    mimeType: true,
  })
  .extend({
    file: z.any().optional(), // File upload uchun
  });

export const updateAttachmentSchema = attachmentSchema
  .partial()
  .omit({ id: true, createdAt: true, deletedAt: true })
  .extend({
    fileName: z.string().optional(),
    fileUrl: z.string().url().optional(),
    fileSize: z.number().optional(),
    mimeType: z.string().optional(),
    documentId: z.string().uuid().optional(),
    uploadedById: z.string().uuid().optional(),
  });

export const attachmentListResponseSchema = z.object({
  count: z.number().int().min(0),
  pageNumber: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  pageCount: z.number().int().min(0),
  data: z.array(attachmentSchema),
});

export const attachmentResponseSchema = attachmentSchema;

export type AttachmentInferType = z.infer<typeof attachmentSchema>;
export type CreateAttachmentInferType = z.infer<typeof createAttachmentSchema>;
export type UpdateAttachmentInferType = z.infer<typeof updateAttachmentSchema>;
export type AttachmentListResponseInferType = z.infer<
  typeof attachmentListResponseSchema
>;
export type AttachmentResponseInferType = z.infer<
  typeof attachmentResponseSchema
>;

// Validation functions
export const validateAttachment = (data: unknown): AttachmentInferType => {
  return attachmentSchema.parse(data);
};

export const validateCreateAttachment = (
  data: unknown,
): CreateAttachmentInferType => {
  return createAttachmentSchema.parse(data);
};

export const validateUpdateAttachment = (
  data: unknown,
): UpdateAttachmentInferType => {
  return updateAttachmentSchema.parse(data);
};

export const validateAttachmentListResponse = (
  data: unknown,
): AttachmentListResponseInferType => {
  return attachmentListResponseSchema.parse(data);
};

// File validation helper
export const validateFile = (
  file: File,
  maxSizeMB: number = 100, // Default 100MB
  allowedTypes: string[] = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!file) {
    throw new Error("Fayl tanlanmagan");
  }

  if (file.size > maxSizeBytes) {
    throw new Error(
      `Fayl hajmi ${maxSizeMB}MB dan katta bo'lmasligi kerak. Joriy hajm: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    );
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Faqat quyidagi fayl turlari qo'llab-quvvatlanadi: ${allowedTypes.join(", ")}`,
    );
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
};

// FormData creator for file upload
export const createAttachmentFormData = (
  file: File,
  documentId: string,
  uploadedById: string,
): FormData => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentId", documentId);
  formData.append("uploadedById", uploadedById);
  return formData;
};
