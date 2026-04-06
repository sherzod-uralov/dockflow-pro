import { useMutation, useQuery, useQueryClient } from "react-query";
import { showError, showSuccess } from "@/utils/show-error";
import type { CRUDService } from "./crud-service";

export interface CRUDHooksConfig<
  TEntity,
  TCreatePayload,
  TUpdatePayload,
  TQueryParams,
  TListResponse,
> {
  service: CRUDService<TEntity, TCreatePayload, TUpdatePayload, TQueryParams, TListResponse>;
  queryKey: string;
  singleQueryKey?: string;
  /** Set to false to disable toasts entirely. By default, backend message is used. */
  messages?: false;
}

export interface CRUDHooks<
  TEntity,
  TCreatePayload,
  TUpdatePayload,
  TQueryParams,
  TListResponse,
> {
  useGetAll: (params?: TQueryParams) => ReturnType<typeof useQuery<TListResponse>>;
  useGetById: (id: string, options?: { enabled?: boolean }) => ReturnType<typeof useQuery<TEntity>>;
  useCreate: () => ReturnType<typeof useMutation<TEntity, unknown, TCreatePayload>>;
  useUpdate: () => ReturnType<typeof useMutation<TEntity, unknown, { id: string; data: TUpdatePayload }>>;
  useDelete: () => ReturnType<typeof useMutation<void, unknown, string>>;
}

/**
 * Creates standard CRUD hooks for a service
 */
export function createCRUDHooks<
  TEntity,
  TCreatePayload,
  TUpdatePayload,
  TQueryParams,
  TListResponse,
>(
  config: CRUDHooksConfig<TEntity, TCreatePayload, TUpdatePayload, TQueryParams, TListResponse>
): CRUDHooks<TEntity, TCreatePayload, TUpdatePayload, TQueryParams, TListResponse> {
  const { service, queryKey, singleQueryKey, messages } = config;
  const itemQueryKey = singleQueryKey || queryKey.replace(/s$/, "");
  const showToast = messages !== false;

  return {
    useGetAll: (params?: TQueryParams) => {
      return useQuery<TListResponse>({
        queryKey: [queryKey, params],
        queryFn: () => service.getAll(params),
        keepPreviousData: true,
      });
    },

    useGetById: (id: string, options?: { enabled?: boolean }) => {
      return useQuery<TEntity>({
        queryKey: [itemQueryKey, id],
        queryFn: () => service.getById(id),
        enabled: !!id && (options?.enabled !== false),
      });
    },

    useCreate: () => {
      const queryClient = useQueryClient();
      return useMutation<TEntity, unknown, TCreatePayload>({
        mutationFn: (payload: TCreatePayload) => service.create(payload),
        onSuccess: (data) => {
          queryClient.invalidateQueries([queryKey]);
          if (showToast) showSuccess(data);
        },
        onError: showError,
      });
    },

    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation<TEntity, unknown, { id: string; data: TUpdatePayload }>({
        mutationFn: ({ id, data }) => service.update(id, data),
        onSuccess: (data) => {
          queryClient.invalidateQueries([queryKey]);
          queryClient.invalidateQueries([itemQueryKey]);
          if (showToast) showSuccess(data);
        },
        onError: showError,
      });
    },

    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation<void, unknown, string>({
        mutationFn: (id: string) => service.delete(id),
        onSuccess: (data) => {
          queryClient.invalidateQueries([queryKey]);
          if (showToast) showSuccess(data);
        },
        onError: showError,
      });
    },
  };
}

/**
 * Type helper to extract service types from a CRUD service
 */
export type ExtractServiceTypes<T> = T extends CRUDService<
  infer TEntity,
  infer TCreatePayload,
  infer TUpdatePayload,
  infer TQueryParams,
  infer TListResponse
>
  ? {
      entity: TEntity;
      createPayload: TCreatePayload;
      updatePayload: TUpdatePayload;
      queryParams: TQueryParams;
      listResponse: TListResponse;
    }
  : never;
