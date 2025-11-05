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
  message: string,
  errorMaps: Record<string, string>[],
): string | null => {
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
    const message = error.response?.data?.message || error.message;

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

    return message || "Xatolik yuz berdi";
  };

  return async <T = any>(apiCall: () => Promise<any>): Promise<T> => {
    try {
      const response = await apiCall();
      return response.data;
    } catch (error: any) {
      const errorMessage = handleError(error);
      const processedError = new Error(errorMessage) as any;
      processedError.response = error.response;
      processedError.status = error.response?.status;
      processedError.code = error.response?.data?.code || error.code;
      throw processedError;
    }
  };
};
