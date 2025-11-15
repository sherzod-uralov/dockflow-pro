import { WorkflowActionType } from "@/features/workflow";

export interface EditorPermissions {
  canEdit: boolean;
  canSign: boolean;
  canAddQRCode: boolean;
  canSaveAnnotations: boolean;
  canViewOnly: boolean;
}

/**
 * Определяет разрешения редактора на основе типа действия workflow step
 */
export const getEditorPermissions = (
  actionType: WorkflowActionType | string,
): EditorPermissions => {
  const permissions: Record<string, EditorPermissions> = {
    APPROVAL: {
      canEdit: false,
      canSign: false,
      canAddQRCode: false,
      canSaveAnnotations: false,
      canViewOnly: true,
    },
    SIGN: {
      canEdit: true,
      canSign: true,
      canAddQRCode: false,
      canSaveAnnotations: false,
      canViewOnly: false,
    },
    QR_CODE: {
      canEdit: true,
      canSign: false,
      canAddQRCode: true,
      canSaveAnnotations: true,
      canViewOnly: false,
    },
    REVIEW: {
      canEdit: false,
      canSign: false,
      canAddQRCode: false,
      canSaveAnnotations: false,
      canViewOnly: true,
    },
    ACKNOWLEDGE: {
      canEdit: false,
      canSign: false,
      canAddQRCode: false,
      canSaveAnnotations: false,
      canViewOnly: true,
    },
  };

  return (
    permissions[actionType] || {
      canEdit: false,
      canSign: false,
      canAddQRCode: false,
      canSaveAnnotations: false,
      canViewOnly: true,
    }
  );
};

/**
 * Проверяет, может ли пользователь редактировать документ
 */
export const canUserEditDocument = (
  actionType: WorkflowActionType | string,
): boolean => {
  const editableTypes: string[] = [
    WorkflowActionType.SIGN,
    WorkflowActionType.QR_CODE,
  ];
  return editableTypes.includes(actionType);
};

/**
 * Проверяет, может ли пользователь сохранять аннотации (только QR_CODE)
 */
export const canUserSaveAnnotations = (
  actionType: WorkflowActionType | string,
): boolean => {
  return actionType === WorkflowActionType.QR_CODE;
};

/**
 * Получает текст для кнопки сохранения в зависимости от типа действия
 */
export const getSaveButtonText = (
  actionType: WorkflowActionType | string,
): string => {
  const texts: Record<string, string> = {
    QR_CODE: "Izohlarni saqlash",
    SIGN: "Imzolash",
    APPROVAL: "Tasdiqlash",
    REVIEW: "Ko'rib chiqishni yakunlash",
    ACKNOWLEDGE: "Tanishishni tasdiqlash",
  };

  return texts[actionType] || "Saqlash";
};

/**
 * Получает описание разрешений для UI
 */
export const getPermissionDescription = (
  actionType: WorkflowActionType | string,
): string => {
  const descriptions: Record<string, string> = {
    APPROVAL:
      "Siz hujjatni faqat ko'rishingiz mumkin. Tahrirlash imkoni yo'q.",
    SIGN: "Siz hujjatni tahrirlashingiz va imzolashingiz mumkin.",
    QR_CODE:
      "Siz hujjatni tahrirlashingiz, QR kodlar va izohlar qo'shishingiz mumkin.",
    REVIEW: "Siz hujjatni faqat ko'rib chiqishingiz mumkin.",
    ACKNOWLEDGE: "Siz hujjat bilan tanishishingiz kerak.",
  };

  return (
    descriptions[actionType] ||
    "Siz hujjatni faqat ko'rishingiz mumkin."
  );
};
