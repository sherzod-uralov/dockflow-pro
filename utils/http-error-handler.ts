interface HttpErrorHandlerOptions {
  resourceName: string;
  operation?:
    | "create"
    | "update"
    | "delete"
    | "get"
    | "list"
    | "search"
    | "export"
    | "import";
  customMessages?: {
    [key: number]: string;
  };
  showNotification?: boolean;
  logError?: boolean;
  context?: string;
}

interface ApiError extends Error {
  response?: {
    status: number;
    statusText?: string;
    data?: {
      message?: string;
      error?: string;
      errors?: Array<{
        field: string;
        message: string;
      }>;
      code?: string;
    };
  };
  status?: number;
  code?: string;
  config?: any;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  message?: string;
}

export class HttpErrorHandler {
  private static getDefaultMessages(
    resourceName: string,
    operation?: string,
  ): { [key: number]: string } {
    const lowerResourceName = resourceName.toLowerCase();
    const operationText = this.getOperationText(operation);

    return {
      200: `${resourceName} muvaffaqiyatli ${this.getSuccessText(operation)}`,
      201: `${resourceName} muvaffaqiyatli yaratildi`,
      202: `${resourceName} ${operationText} so'rovi qabul qilindi`,
      204: `${resourceName} muvaffaqiyatli o'chirildi`,

      400: `${resourceName} ma'lumotlari noto'g'ri yoki to'liq emas`,
      401: `Tizimga kirish talab qilinadi. Iltimos, qayta kiring`,
      403: `${resourceName}ga ruxsat yo'q yoki huquqingiz yetarli emas`,
      404: `${resourceName} topilmadi yoki mavjud emas`,
      405: `${operationText} amali ${lowerResourceName} uchun ruxsat etilmagan`,
      406: `${resourceName} formati qo'llab-quvvatlanmaydi`,
      408: `So'rov vaqti tugadi. Iltimos, qayta urinib ko'ring`,
      409: `${resourceName} allaqachon mavjud yoki konflikt yuzaga keldi`,
      410: `${resourceName} endi mavjud emas (o'chirilgan)`,
      413: `Fayl hajmi juda katta`,
      415: `Fayl formati qo'llab-quvvatlanmaydi`,
      422: `${resourceName} ma'lumotlarini tekshirishda xatolik`,
      423: `${resourceName} vaqtincha bloklangan`,
      429: `Juda ko'p so'rov yuborildi. Iltimos, biroz kuting`,

      500: `Server xatoligi: ${lowerResourceName}ni ${operationText}da ichki xatolik`,
      501: `${operationText} funksiyasi hali ishlamaydi`,
      502: `Server bilan bog'lanishda xatolik`,
      503: `Xizmat vaqtincha ishlamayapti. Keyinroq urinib ko'ring`,
      504: `Server javob berishda kechikdi`,
      507: `Server xotirasida joy yetarli emas`,

      1001: `${resourceName}ning muddati tugagan`,
      1002: `${resourceName} faol emas`,
      1003: `${resourceName}ga ruxsat berilmagan`,
      1004: `${resourceName} limiti tugagan`,
    };
  }

  private static getOperationText(operation?: string): string {
    const operations = {
      create: "yaratish",
      update: "yangilash",
      delete: "o'chirish",
      get: "olish",
      list: "ro'yxat olish",
      search: "qidirish",
      export: "eksport qilish",
      import: "import qilish",
    };
    return operations[operation as keyof typeof operations] || "qayta ishlash";
  }

  private static getSuccessText(operation?: string): string {
    const successTexts = {
      create: "yaratildi",
      update: "yangilandi",
      delete: "o'chirildi",
      get: "olindi",
      list: "ro'yxati olindi",
      search: "qidiruv bajarildi",
      export: "eksport qilindi",
      import: "import qilindi",
    };
    return successTexts[operation as keyof typeof successTexts] || "bajarildi";
  }

  private static formatValidationErrors(
    errors?: Array<{ field: string; message: string }>,
  ): string {
    if (!errors || errors.length === 0) return "";
    return errors.map((error) => `${error.field}: ${error.message}`).join(", ");
  }

  private static logError(
    error: ApiError,
    options: HttpErrorHandlerOptions,
  ): void {
    if (options.logError !== false && process.env.NODE_ENV === "development") {
      console.group(`🚫 ${options.resourceName} Error`);
      console.error("Status:", error.response?.status || error.status);
      console.error("Operation:", options.operation);
      console.error("Context:", options.context);
      console.error("Original Error:", error);
      console.groupEnd();
    }
  }

  private static showNotification(
    message: string,
    type: "error" | "success" = "error",
  ): void {
    if (typeof window !== "undefined") {
      console.log(`${type === "error" ? "❌" : "✅"} ${message}`);
    }
  }

  public static handleError(
    error: ApiError,
    options: HttpErrorHandlerOptions,
  ): never {
    const {
      resourceName,
      operation,
      customMessages = {},
      showNotification = true,
      context,
    } = options;

    const statusCode = error.response?.status || error.status || 500;

    this.logError(error, options);

    const messages = {
      ...this.getDefaultMessages(resourceName, operation),
      ...customMessages,
    };

    const serverMessage =
      error.response?.data?.message || error.response?.data?.error;
    const validationErrors = error.response?.data?.errors;
    let validationMessage = "";

    if (validationErrors) {
      validationMessage = this.formatValidationErrors(validationErrors);
    }

    let errorMessage =
      messages[statusCode] ||
      serverMessage ||
      `${resourceName}da noma'lum xatolik yuz berdi`;

    if (validationMessage) {
      errorMessage += `. Xatoliklar: ${validationMessage}`;
    }

    if (showNotification) {
      this.showNotification(errorMessage, "error");
    }

    const processedError = new Error(errorMessage) as ApiError;
    processedError.response = error.response;
    processedError.status = statusCode;
    processedError.code = error.response?.data?.code || error.code;

    throw processedError;
  }

  public static handleSuccess<T>(
    response: ApiResponse<T>,
    options: HttpErrorHandlerOptions,
  ): ApiResponse<T> {
    const { resourceName, operation, showNotification = true } = options;
    const statusCode = response.status || 200;

    const messages = this.getDefaultMessages(resourceName, operation);
    const successMessage =
      response.message || messages[statusCode] || "Muvaffaqiyatli bajarildi";

    if (showNotification && [200, 201, 204].includes(statusCode)) {
      this.showNotification(successMessage, "success");
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`✅ ${successMessage}`);
    }

    return response;
  }

  public static async executeWithHandling<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    options: HttpErrorHandlerOptions,
  ): Promise<T> {
    try {
      const response = await apiCall();
      this.handleSuccess(response, options);
      return response.data;
    } catch (error) {
      this.handleError(error as ApiError, options);
    }
  }
}

export const createErrorHandler = (
  resourceName: string,
  defaultOptions?: Partial<HttpErrorHandlerOptions>,
) => ({
  create: (
    error: ApiError,
    customMessages?: { [key: number]: string },
    options?: Partial<HttpErrorHandlerOptions>,
  ) =>
    HttpErrorHandler.handleError(error, {
      resourceName,
      operation: "create",
      customMessages,
      ...defaultOptions,
      ...options,
    }),

  update: (
    error: ApiError,
    customMessages?: { [key: number]: string },
    options?: Partial<HttpErrorHandlerOptions>,
  ) =>
    HttpErrorHandler.handleError(error, {
      resourceName,
      operation: "update",
      customMessages,
      ...defaultOptions,
      ...options,
    }),

  delete: (
    error: ApiError,
    customMessages?: { [key: number]: string },
    options?: Partial<HttpErrorHandlerOptions>,
  ) =>
    HttpErrorHandler.handleError(error, {
      resourceName,
      operation: "delete",
      customMessages,
      ...defaultOptions,
      ...options,
    }),

  get: (
    error: ApiError,
    customMessages?: { [key: number]: string },
    options?: Partial<HttpErrorHandlerOptions>,
  ) =>
    HttpErrorHandler.handleError(error, {
      resourceName,
      operation: "get",
      customMessages,
      ...defaultOptions,
      ...options,
    }),

  list: (
    error: ApiError,
    customMessages?: { [key: number]: string },
    options?: Partial<HttpErrorHandlerOptions>,
  ) =>
    HttpErrorHandler.handleError(error, {
      resourceName,
      operation: "list",
      customMessages,
      ...defaultOptions,
      ...options,
    }),

  search: (
    error: ApiError,
    customMessages?: { [key: number]: string },
    options?: Partial<HttpErrorHandlerOptions>,
  ) =>
    HttpErrorHandler.handleError(error, {
      resourceName,
      operation: "search",
      customMessages,
      ...defaultOptions,
      ...options,
    }),

  export: (
    error: ApiError,
    customMessages?: { [key: number]: string },
    options?: Partial<HttpErrorHandlerOptions>,
  ) =>
    HttpErrorHandler.handleError(error, {
      resourceName,
      operation: "export",
      customMessages,
      ...defaultOptions,
      ...options,
    }),

  import: (
    error: ApiError,
    customMessages?: { [key: number]: string },
    options?: Partial<HttpErrorHandlerOptions>,
  ) =>
    HttpErrorHandler.handleError(error, {
      resourceName,
      operation: "import",
      customMessages,
      ...defaultOptions,
      ...options,
    }),

  executeCreate: <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    customMessages?: { [key: number]: string },
  ) =>
    HttpErrorHandler.executeWithHandling(apiCall, {
      resourceName,
      operation: "create",
      customMessages,
      ...defaultOptions,
    }),

  executeUpdate: <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    customMessages?: { [key: number]: string },
  ) =>
    HttpErrorHandler.executeWithHandling(apiCall, {
      resourceName,
      operation: "update",
      customMessages,
      ...defaultOptions,
    }),

  executeDelete: <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    customMessages?: { [key: number]: string },
  ) =>
    HttpErrorHandler.executeWithHandling(apiCall, {
      resourceName,
      operation: "delete",
      customMessages,
      ...defaultOptions,
    }),

  executeGet: <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    customMessages?: { [key: number]: string },
  ) =>
    HttpErrorHandler.executeWithHandling(apiCall, {
      resourceName,
      operation: "get",
      customMessages,
      ...defaultOptions,
    }),

  executeList: <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    customMessages?: { [key: number]: string },
  ) =>
    HttpErrorHandler.executeWithHandling(apiCall, {
      resourceName,
      operation: "list",
      customMessages,
      ...defaultOptions,
    }),
});

export const errorHandlers = {
  ruxsat: createErrorHandler("Ruxsat"),
  user: createErrorHandler("Foydalanuvchi"),
  rol: createErrorHandler("Rol"),
  auth: createErrorHandler("Kirish"),
  documentType: createErrorHandler("HujjatTuri"),
  deportament: createErrorHandler("Bo'lim"),
  document: createErrorHandler("Hujjat"),
};

export const {
  ruxsat: handlePermissionError,
  user: handleUserError,
  rol: handleRoleError,
  auth: handleAuthError,
  documentType: handleHujjatTuriError,
  deportament: handleBoLimError,
  document: handleHujjatError,
} = errorHandlers;
