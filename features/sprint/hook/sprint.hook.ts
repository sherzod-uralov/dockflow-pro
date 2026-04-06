import { useMutation, useQueryClient } from "react-query";
import { showError, showSuccess } from "@/utils/show-error";
import { createCRUDHooks } from "@/lib/crud-hooks";
import { sprintService } from "../service/sprint.service";
import {
  SprintQueryParams,
  GetAllSprints,
  SprintCreatePayload,
  SprintUpdatePayload,
  SprintGetResponse,
} from "../type/sprint.type";

const sprintHooks = createCRUDHooks<
  SprintGetResponse,
  SprintCreatePayload,
  SprintUpdatePayload,
  SprintQueryParams,
  GetAllSprints
>({
  service: sprintService,
  queryKey: "sprints",
  singleQueryKey: "sprint",
});

export const useGetAllSprints = (params?: SprintQueryParams) =>
  sprintHooks.useGetAll(params);

export const useGetSprintById = (id: string, options?: { enabled?: boolean }) =>
  sprintHooks.useGetById(id, options);

export const useCreateSprint = sprintHooks.useCreate;

export const useUpdateSprint = sprintHooks.useUpdate;

export const useDeleteSprint = sprintHooks.useDelete;

export const useStartSprint = () => {
  const queryClient = useQueryClient();
  return useMutation<SprintGetResponse, unknown, string>({
    mutationFn: (id) => sprintService.start(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["sprints"]);
      queryClient.invalidateQueries(["sprint"]);
      showSuccess(data);
    },
    onError: showError,
  });
};

export const useCompleteSprint = () => {
  const queryClient = useQueryClient();
  return useMutation<SprintGetResponse, unknown, string>({
    mutationFn: (id) => sprintService.complete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["sprints"]);
      queryClient.invalidateQueries(["sprint"]);
      showSuccess(data);
    },
    onError: showError,
  });
};

export const useCancelSprint = () => {
  const queryClient = useQueryClient();
  return useMutation<SprintGetResponse, unknown, string>({
    mutationFn: (id) => sprintService.cancel(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["sprints"]);
      queryClient.invalidateQueries(["sprint"]);
      showSuccess(data);
    },
    onError: showError,
  });
};
