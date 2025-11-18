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

  // ✨ НОВЫЕ: ошибки для action types
  "Invalid action type": "Noto'g'ri amal turi",
  "QR_CODE action type requires document": "QR_CODE turi uchun hujjat kerak",
  "Cannot save annotations for this action type":
    "Bu amal turi uchun izohlarni saqlab bo'lmaydi",
  "Only QR_CODE action type can save annotations":
    "Faqat QR_CODE turi izohlarni saqlashi mumkin",
  "Invalid workflow step data": "Noto'g'ri ish jarayoni qadam ma'lumotlari",
  "workflowType must be either Ketma-ket or Parallel":
    "Ish jarayoni turi Ketma-ket yoki Parallel bo'lishi kerak",
  "steps must contain at least 1 element":
    "Kamida bitta qadam bo'lishi kerak",
  "actionType must be one of the following values":
    "Amal turi quyidagi qiymatlardan biri bo'lishi kerak",
  "actionType must be one of":
    "Amal turi quyidagilardan biri bo'lishi kerak",
  "APPROVAL, SIGN, QR_CODE, REVIEW, ACKNOWLEDGE":
    "APPROVAL (Tasdiqlash), SIGN (Imzolash), QR_CODE (QR kod), REVIEW (Ko'rib chiqish), ACKNOWLEDGE (Tanishish)",
  "property documentId should not exist":
    "Hujjat ID ni tahrirlash rejimida yuborish mumkin emas",
  "documentId should not exist":
    "Hujjat ID mavjud bo'lmasligi kerak (faqat yangi workflow uchun)",
  "documentId must be a UUID":
    "Hujjat ID noto'g'ri formatda (UUID bo'lishi kerak)",
};

export const workflowErrorHandler = createErrorHandler(WORKFLOW_ERRORS);
