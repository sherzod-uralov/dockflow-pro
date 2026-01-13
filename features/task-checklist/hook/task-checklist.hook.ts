import { useMutation, useQuery, useQueryClient } from "react-query";
import { showError, showSuccess } from "@/utils/show-error";
import { taskChecklistService } from "../service/task-checklist.service";
import {
  TaskChecklistQueryParams,
  TaskChecklistCreatePayload,
  TaskChecklistUpdatePayload,
  TaskChecklistItemQueryParams,
  TaskChecklistItemCreatePayload,
  TaskChecklistItemUpdatePayload,
} from "../type/task-checklist.type";

// Checklist Hooks
export const useGetAllTaskChecklists = (params?: TaskChecklistQueryParams) => {
  return useQuery({
    queryKey: ["task-checklists", params],
    queryFn: () => taskChecklistService.getAll(params),
    keepPreviousData: true,
    enabled: !!params?.taskId,
  });
};

export const useGetTaskChecklistById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["task-checklist", id],
    queryFn: () => taskChecklistService.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useCreateTaskChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskChecklistCreatePayload) => taskChecklistService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["task-checklists"]);
      showSuccess("Checklist yaratildi");
    },
    onError: showError,
  });
};

export const useUpdateTaskChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskChecklistUpdatePayload }) =>
      taskChecklistService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["task-checklists"]);
      queryClient.invalidateQueries(["task-checklist"]);
      showSuccess("Checklist yangilandi");
    },
    onError: showError,
  });
};

export const useDeleteTaskChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskChecklistService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["task-checklists"]);
      showSuccess("Checklist o'chirildi");
    },
    onError: showError,
  });
};

// Checklist Item Hooks
export const useGetChecklistItems = (checklistId: string, params?: TaskChecklistItemQueryParams) => {
  return useQuery({
    queryKey: ["checklist-items", checklistId, params],
    queryFn: () => taskChecklistService.getItems(checklistId, params),
    keepPreviousData: true,
    enabled: !!checklistId,
  });
};

export const useCreateChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      checklistId,
      data,
    }: {
      checklistId: string;
      data: TaskChecklistItemCreatePayload;
    }) => taskChecklistService.createItem(checklistId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["task-checklists"]);
      queryClient.invalidateQueries(["checklist-items"]);
      showSuccess("Element qo'shildi");
    },
    onError: showError,
  });
};

export const useUpdateChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      checklistId,
      itemId,
      data,
    }: {
      checklistId: string;
      itemId: string;
      data: TaskChecklistItemUpdatePayload;
    }) => taskChecklistService.updateItem(checklistId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["task-checklists"]);
      queryClient.invalidateQueries(["checklist-items"]);
    },
    onError: showError,
  });
};

export const useDeleteChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, itemId }: { checklistId: string; itemId: string }) =>
      taskChecklistService.deleteItem(checklistId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries(["task-checklists"]);
      queryClient.invalidateQueries(["checklist-items"]);
      showSuccess("Element o'chirildi");
    },
    onError: showError,
  });
};
