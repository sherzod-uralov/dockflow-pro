import { createErrorHandler } from "@/lib/http-error-handler";

export const WORKFLOW_ERRORS: Record<string, string> = {
  "Workflow not found": "Ish jarayoni topilmadi",
  "Document not found": "Hujjat topilmadi",
  "Workflow already exists for this document":
    "Bu hujjat uchun ish jarayoni mavjud",
  "Step orders must be unique": "Qadam tartiblari takrorlanmasligi kerak",
  "One or more assigned users not found":
    "Tayinlangan foydalanuvchilar topilmadi",
  "Step with the specified order does not exist":
    "Bunday tartibli qadam mavjud emas",
  "Workflow not found for this document":
    "Bu hujjat uchun ish jarayoni topilmadi",
};

export const workflowErrorHandler = createErrorHandler(WORKFLOW_ERRORS);
