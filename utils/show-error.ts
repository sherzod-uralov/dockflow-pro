import { notifications } from "@mantine/notifications";

const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  "Missing authentication token": "Tizimga kiring",
  "User not found or inactive": "Foydalanuvchi topilmadi",
  "Invalid or expired token": "Sessiya tugadi, qayta kiring",
  "Invalid credentials": "Login yoki parol noto'g'ri",
  "User not found": "Foydalanuvchi topilmadi",
  "Insufficient permissions": "Ruxsat yo'q",

  // Document
  "Document not found": "Hujjat topilmadi",
  "Document number must be unique": "hujjat raqami allaqachon mavjud",
  "Document type not found": "Hujjat turi topilmadi",

  // Document Type
  "Document type name must be unique": "Bu nom allaqachon mavjud",

  // Document Template
  "Document template not found": "Shablon topilmadi",
  "Document template with this name already exists": "Bu nom allaqachon mavjud",
  "Cannot delete template that is being used by documents": "Shablon ishlatilmoqda",

  // Workflow
  "Workflow not found": "Hujjat aylanmasi topilmadi",
  "Workflow already exists for this document": "Bu hujjatda aylanma mavjud",
  "Step orders must be unique": "Bosqich tartib raqamlari takrorlanmasligi kerak",
  "Workflow step not found": "Bosqich topilmadi",
  "This workflow has been completed and cannot be modified": "Aylanma tugallangan",
  "This step has already been completed": "Bosqich allaqachon bajarilgan",
  "Steps must be completed in order": "Bosqichlar tartib bilan bajarilishi kerak",
  "Rollback feature is only available for CONSECUTIVE workflows": "Qaytarish faqat ketma-ket aylanmalarda",
  "Rollback user not found": "Qaytarish uchun foydalanuvchi topilmadi",
  "One or more assigned users not found": "Tayinlangan foydalanuvchilar topilmadi",
  "Cannot complete this step": "Bu bosqichni bajarib bo'lmaydi",
  "Cannot reject this step": "Bu bosqichni rad etib bo'lmaydi",
  "Invalid action type": "Noto'g'ri amal turi",
  "workflowType must be either": "Aylanma turi Ketma-ket yoki Parallel bo'lishi kerak",
  "steps must contain at least 1 element": "Kamida bitta bosqich kerak",

  // Workflow Step
  "Step ID doesn't exist, is deleted, or user doesn't have access": "Bosqich topilmadi yoki ruxsat yo'q",
  "Provided workflowId doesn't exist or is deleted": "Aylanma topilmadi",
  "Provided assignedToUserId doesn't exist or is deleted": "Tayinlangan foydalanuvchi topilmadi",
  "A step with this order already exists in the workflow": "Bu tartib raqami allaqachon mavjud",
  "Step ID doesn't exist or is deleted when updating": "Yangilanayotgan bosqich topilmadi",
  "Only the workflow creator can update workflow steps": "Faqat yaratuvchi bosqichni o'zgartirishi mumkin",
  "Provided assignedToUserId doesn't exist or is deleted when updating": "Yangilanayotgan foydalanuvchi topilmadi",
  "Attempting to change order to existing one": "Bu tartib raqami allaqachon mavjud",
  "Step ID doesn't exist or is deleted when deleting": "O'chiriladigan bosqich topilmadi",
  "Attempting to delete from completed workflow": "Tugallangan aylanmadan o'chirib bo'lmaydi",
  "Only the workflow creator can delete workflow steps": "Faqat yaratuvchi bosqichni o'chirishi mumkin",
  "Workflow ID doesn't exist or is deleted": "Aylanma topilmadi",
  "Step ID doesn't exist or is deleted when assigning": "Tayinlanayotgan bosqich topilmadi",
  "Attempting to assign user to completed workflow": "Tugallangan aylanmaga tayinlab bo'lmaydi",
  "Only the workflow creator can reassign workflow steps": "Faqat yaratuvchi qayta tayinlashi mumkin",
  "Step not found or not assigned to user": "Bosqich topilmadi yoki sizga tayinlanmagan",
  "Attempting to complete step in completed workflow": "Tugallangan aylanmada bajarib bo'lmaydi",
  "Step is not the current step in CONSECUTIVE workflow": "Bu bosqich navbatdagi bosqich emas",
  "Step status is already COMPLETED": "Bosqich allaqachon bajarilgan",
  "User ID is required to reject a step": "Foydalanuvchi ID kiritilishi kerak",
  "Attempting to reject step in completed workflow": "Tugallangan aylanmada rad etib bo'lmaydi",
  "Attempting rollback on PARALLEL workflow": "Parallel aylanmada qaytarib bo'lmaydi",
  "Provided rollbackToUserId doesn't exist or is deleted": "Qaytarish uchun foydalanuvchi topilmadi",
  "No previous workflow step found for user": "Foydalanuvchi uchun oldingi bosqich topilmadi",
  "Step ID doesn't exist or is deleted when fetching actions": "Bosqich topilmadi",
  "Workflow ID doesn't exist or is deleted when fetching actions": "Aylanma topilmadi",
  "Step ID doesn't exist or is deleted when adding comment": "Bosqich topilmadi",
  "Assigned user not found": "Tayinlangan foydalanuvchi topilmadi",

  // User
  "Username already exists": "Bu login allaqachon mavjud",
  "Role not found": "Rol topilmadi",
  "Department not found": "Bo'lim topilmadi",

  // Attachment
  "Attachment not found": "Fayl topilmadi",
  "No file provided": "Fayl tanlanmagan",

  // Permission
  "Permission key already used": "Bu kalit allaqachon mavjud",

  // Journal
  "Journal not found": "Jurnal topilmadi",

  // Department
  "This user is already assigned as a director of another department": "Bu foydalanuvchi boshqa bo'limda direktor",
  "Department code must be unique": "Bu kod allaqachon mavjud",
  "description must be shorter than or equal to 1000 characters": "Tavfsif uzunligi 1000 ta belgidan oshmasligi kerak",

  // Workflow Template
  "Workflow template not found": "Aylanma shabloni topilmadi",
  "Workflow template with this name already exists": "Bu nom allaqachon mavjud",
};

const STATUS_MESSAGES: Record<number, string> = {
  400: "Noto'g'ri so'rov",
  401: "Tizimga kiring",
  403: "Ruxsat yo'q",
  404: "Topilmadi",
  409: "Allaqachon mavjud",
  500: "Server xatosi",
};

export function showError(error: any) {
  const status = error?.response?.status || error?.status || 500;
  const message = typeof error === "string" ? error : (error?.response?.data?.message || error?.message || "");

  console.log(message)
  let uzbekMessage = ERROR_MESSAGES[message];

  console.log(uzbekMessage)
  if (!uzbekMessage) {
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        uzbekMessage = value;
        break;
      }
    }
  }

  if (!uzbekMessage) {
    uzbekMessage = STATUS_MESSAGES[status] || "Xatolik yuz berdi";
  }

  notifications.show({
    message: uzbekMessage,
    color: "red",
  });
}

export function showSuccess(message: string) {
  notifications.show({
    message,
    color: "green",
  });
}

export function showInfo(message: string) {
  notifications.show({
    message,
    color: "blue",
  });
}