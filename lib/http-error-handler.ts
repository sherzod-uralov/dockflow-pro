export interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      code?: string;
    };
  };
  message?: string;
}

export const HTTP_ERRORS: Record<string, string> = {
  400: "Noto'g'ri so'rov",
  401: "Tizimga kirish talab qilinadi",
  403: "Ruxsat yo'q",
  404: "Ma'lumot topilmadi",
  409: "Ma'lumot allaqachon mavjud",
  500: "Server xatoligi",
  502: "Server bilan bog'lanishda xatolik",
  503: "Xizmat vaqtincha ishlamayapti",
};

const findErrorMessage = (
  message: string | any,
  errorMaps: Record<string, string>[],
): string | null => {
  // ✨ ИСПРАВЛЕНО: проверяем, что message - это строка
  if (!message || typeof message !== 'string') {
    return null;
  }

  const lowerMsg = message.toLowerCase();

  for (const errorMap of errorMaps) {
    for (const [key, value] of Object.entries(errorMap)) {
      if (lowerMsg.includes(key.toLowerCase())) {
        return value;
      }
    }
  }

  return null;
};

export const createErrorHandler = (domainErrors: Record<string, string>) => {
  const handleError = (error: any, custom?: Record<string, string>): string => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    // ✨ УЛУЧШЕНО: извлечение сообщения с поддержкой разных форматов
    let message: string | any =
      responseData?.message ||
      responseData?.error ||
      error.message;

    // ✨ НОВОЕ: обработка когда message - это массив
    if (Array.isArray(message)) {
      message = message
        .map((msg: any) => {
          if (typeof msg === 'string') return msg;
          if (msg.message) return msg.message;
          return JSON.stringify(msg);
        })
        .filter(Boolean)
        .join(', ');
    }

    // ✨ НОВОЕ: обработка массива ошибок валидации
    if (responseData?.errors && Array.isArray(responseData.errors)) {
      const validationMessages = responseData.errors
        .map((err: any) => {
          if (typeof err === 'string') return err;
          if (err.message) return err.message;
          if (err.field && err.message) return `${err.field}: ${err.message}`;
          return JSON.stringify(err);
        })
        .filter(Boolean)
        .join(', ');

      if (validationMessages) {
        message = validationMessages;
      }
    }

    // ✨ НОВОЕ: обработка вложенных ошибок
    if (!message && responseData?.error && typeof responseData.error === 'object') {
      message = responseData.error.message || JSON.stringify(responseData.error);
    }

    if (custom && message) {
      const customMatch = findErrorMessage(message, [custom]);
      if (customMatch) return customMatch;
    }

    if (message) {
      const match = findErrorMessage(message, [domainErrors]);
      if (match) return match;
    }

    if (status && HTTP_ERRORS[status]) {
      return HTTP_ERRORS[status];
    }

    // ✨ УЛУЧШЕНО: преобразование message в строку
    if (message && typeof message !== 'string') {
      try {
        message = JSON.stringify(message);
      } catch {
        message = String(message);
      }
    }

    return message || "Xatolik yuz berdi";
  };

  return async <T = any>(apiCall: () => Promise<any>): Promise<T> => {
    try {
      const response = await apiCall();
      return response.data;
    } catch (error: any) {
      // ✨ НОВОЕ: детальное логирование для отладки
      if (process.env.NODE_ENV === "development") {
        console.group("🚫 HTTP Error Details");
        console.error("Status:", error.response?.status);
        console.error("Response Data:", error.response?.data);
        console.error("Original Message:", error.message);
        console.error("Full Error:", error);
        console.groupEnd();
      }

      const errorMessage = handleError(error);
      const processedError = new Error(errorMessage) as any;
      processedError.response = error.response;
      processedError.status = error.response?.status;
      processedError.code = error.response?.data?.code || error.code;
      processedError.originalData = error.response?.data; // ✨ НОВОЕ: сохраняем оригинальные данные
      throw processedError;
    }
  };
};
