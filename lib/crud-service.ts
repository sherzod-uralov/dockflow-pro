import axiosInstance from "@/api/axios.instance";
import { DataPagination, GlobalGetAllPaginationProps } from "@/types/global.types";

/**
 * Standard CRUD endpoints configuration
 * update and delete are optional for partial CRUD services
 */
export interface CRUDEndpoints {
  list: string;
  create: string;
  detail: ((id: string | number) => string) | ((id: string) => string);
  update?: ((id: string | number) => string) | ((id: string) => string);
  delete?: ((id: string | number) => string) | ((id: string) => string);
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends DataPagination {
  data: T[];
}

/**
 * Base CRUD service interface
 */
export interface CRUDService<
  TEntity,
  TCreatePayload,
  TUpdatePayload = Partial<TCreatePayload>,
  TQueryParams = GlobalGetAllPaginationProps,
  TListResponse = PaginatedResponse<TEntity>,
> {
  getAll: (params?: TQueryParams) => Promise<TListResponse>;
  getById: (id: string) => Promise<TEntity>;
  create: (payload: TCreatePayload) => Promise<TEntity>;
  update: (id: string, payload: TUpdatePayload) => Promise<TEntity>;
  delete: (id: string) => Promise<void>;
}

/**
 * Configuration options for CRUD service factory
 */
export interface CRUDServiceOptions<TQueryParams = GlobalGetAllPaginationProps> {
  /** Transform query params before sending to API */
  transformParams?: (params?: TQueryParams) => Record<string, unknown>;
}

/**
 * Creates a standard CRUD service with common operations
 *
 * @example
 * ```ts
 * const journalService = createCRUDService<Journal, JournalCreate>(
 *   endpoints.journal
 * );
 *
 * // With custom params transformation
 * const projectService = createCRUDService<Project, ProjectCreate, ProjectUpdate, ProjectQueryParams>(
 *   endpoints.project,
 *   {
 *     transformParams: (params) => ({
 *       search: params?.search,
 *       status: params?.status,
 *       pageSize: params?.pageSize,
 *       pageNumber: params?.pageNumber,
 *     }),
 *   }
 * );
 * ```
 */
export function createCRUDService<
  TEntity,
  TCreatePayload,
  TUpdatePayload = Partial<TCreatePayload>,
  TQueryParams = GlobalGetAllPaginationProps,
  TListResponse = PaginatedResponse<TEntity>,
>(
  endpoints: CRUDEndpoints,
  options?: CRUDServiceOptions<TQueryParams>
): CRUDService<TEntity, TCreatePayload, TUpdatePayload, TQueryParams, TListResponse> {
  const { transformParams } = options ?? {};

  return {
    getAll: async (params?: TQueryParams): Promise<TListResponse> => {
      const transformedParams = transformParams ? transformParams(params) : params;
      const { data } = await axiosInstance.get<TListResponse>(endpoints.list, {
        params: transformedParams,
      });
      return data;
    },

    getById: async (id: string): Promise<TEntity> => {
      const { data } = await axiosInstance.get<TEntity>(endpoints.detail(id));
      return data;
    },

    create: async (payload: TCreatePayload): Promise<TEntity> => {
      const { data } = await axiosInstance.post<TEntity>(endpoints.create, payload);
      return data;
    },

    update: async (id: string, payload: TUpdatePayload): Promise<TEntity> => {
      if (!endpoints.update) {
        throw new Error("Update endpoint not configured for this service");
      }
      const { data } = await axiosInstance.patch<TEntity>(endpoints.update(id), payload);
      return data;
    },

    delete: async (id: string): Promise<void> => {
      if (!endpoints.delete) {
        throw new Error("Delete endpoint not configured for this service");
      }
      await axiosInstance.delete(endpoints.delete(id));
    },
  };
}

/**
 * Extends a CRUD service with additional custom methods
 *
 * @example
 * ```ts
 * const documentService = extendCRUDService(
 *   createCRUDService<Document, DocumentCreate>(endpoints.document),
 *   {
 *     download: async (id: string) => {
 *       const { data } = await axiosInstance.get(endpoints.document.download(id));
 *       return data;
 *     },
 *   }
 * );
 * ```
 */
export function extendCRUDService<
  TEntity,
  TCreatePayload,
  TUpdatePayload,
  TQueryParams,
  TListResponse,
  TExtensions extends Record<string, (...args: never[]) => Promise<unknown>>,
>(
  baseService: CRUDService<TEntity, TCreatePayload, TUpdatePayload, TQueryParams, TListResponse>,
  extensions: TExtensions
): CRUDService<TEntity, TCreatePayload, TUpdatePayload, TQueryParams, TListResponse> & TExtensions {
  return {
    ...baseService,
    ...extensions,
  };
}
