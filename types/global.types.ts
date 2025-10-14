export interface DataPagination {
  count: number;
  pageNumber: number;
  pageSize: number;
  pageCount: number;
}

export interface GlobalGetAllPaginationProps {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
}

// types/api-error.types.ts

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: ValidationError[];
  code?: string;
  statusCode?: number;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * API Error type (Axios error bilan mos keladi)
 */
export interface ApiError extends Error {
  response?: {
    status: number;
    statusText?: string;
    data?: ApiErrorResponse;
  };
  status?: number;
  code?: string;
  config?: any;
  request?: any;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as ApiError).response === "object"
  );
}

export function isError(error: unknown): error is Error {
  return (
    typeof error === "object" && error !== null && "message" in error && true
  );
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "API xatolik yuz berdi"
    );
  }
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }

  return "Noma'lum xatolik yuz berdi";
}

export function formatValidationErrors(
  errors?: ValidationError[],
): string | null {
  if (!errors || errors.length === 0) return null;

  return errors.map((error) => `${error.field}: ${error.message}`).join(", ");
}

export function getFullErrorDetails(error: unknown): {
  message: string;
  statusCode?: number;
  validationErrors?: string;
} {
  if (isApiError(error)) {
    return {
      message: getErrorMessage(error),
      statusCode: error.response?.status,
      validationErrors:
        formatValidationErrors(error.response?.data?.errors) || undefined,
    };
  }

  return {
    message: getErrorMessage(error),
  };
}
