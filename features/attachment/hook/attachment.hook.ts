import { useMutation, useQuery, useQueryClient } from "react-query";
import { attachmentService } from "../service/attachment.service";
import {
  Attachment,
  AttachmentQueryParams,
} from "../type/attachment.type";
import { AttachmentInferType } from "@/features/attachment/schema/attachment.schema";
import { showError, showSuccess } from "@/utils/show-error";

// Note: Attachment service has non-standard create (file upload),
// so we don't use createCRUDHooks here

export const useGetAllAttachments = (params?: AttachmentQueryParams) => {
  return useQuery({
    queryKey: ["attachments", params],
    queryFn: () => attachmentService.getAll(params),
  });
};

export const useGetAttachmentById = (id: string) => {
  return useQuery<Attachment>({
    queryKey: ["attachment", id],
    queryFn: () => attachmentService.getById(id),
    enabled: !!id,
  });
};

export const useUpdateAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AttachmentInferType> }) =>
      attachmentService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["attachments"]);
      showSuccess("Fayl yangilandi");
    },
    onError: showError,
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attachmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["attachments"]);
      showSuccess("Fayl o'chirildi");
    },
    onError: showError,
  });
};

// Custom hook for file upload (uses FormData, not standard CRUD)
export const useCreateAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentService.create(file),
    onSuccess: () => {
      queryClient.invalidateQueries(["attachments"]);
      showSuccess("Fayl yuklandi");
    },
    onError: showError,
  });
};

export const useRepairFilenames = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => attachmentService.repairFilenames(),
    onSuccess: () => {
      queryClient.invalidateQueries(["attachments"]);
      showSuccess("Fayl nomlari tuzatildi");
    },
    onError: showError,
  });
};
