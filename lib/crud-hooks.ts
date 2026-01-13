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
  /** Optional success messages. If not provided, no success toast will be shown */
  messages?: {
    created?: string;
    updated?: string;
    deleted?: string;
  };
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
        onSuccess: () => {
          queryClient.invalidateQueries([queryKey]);
          if (messages?.created) showSuccess(messages.created);
        },
        onError: showError,
      });
    },

    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation<TEntity, unknown, { id: string; data: TUpdatePayload }>({
        mutationFn: ({ id, data }) => service.update(id, data),
        onSuccess: () => {
          queryClient.invalidateQueries([queryKey]);
          queryClient.invalidateQueries([itemQueryKey]);
          if (messages?.updated) showSuccess(messages.updated);
        },
        onError: showError,
      });
    },

    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation<void, unknown, string>({
        mutationFn: (id: string) => service.delete(id),
        onSuccess: () => {
          queryClient.invalidateQueries([queryKey]);
          if (messages?.deleted) showSuccess(messages.deleted);
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
