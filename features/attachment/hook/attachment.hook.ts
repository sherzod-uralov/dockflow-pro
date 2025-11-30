import { useMutation, useQuery, useQueryClient } from "react-query";
import { attachmentService } from "../service/attachment.service";
import {
  GetAllAttachments,
  AttachmentQueryParams,
} from "../type/attachment.type";
import { AttachmentInferType } from "@/features/attachment/schema/attachment.schema";
import { showError, showSuccess } from "@/utils/show-error";

export const useCreateAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentService.createAttachment(file),
    onSuccess: () => {
      queryClient?.invalidateQueries(["attachments"]);
      showSuccess("Fayl yuklandi");
    },
    onError: showError,
  });
};

export const useGetAllAttachments = (params?: AttachmentQueryParams) => {
  return useQuery<GetAllAttachments>({
    queryKey: ["attachments", params],
    queryFn: () => attachmentService.getAllAttachments(params),
    keepPreviousData: true,
  });
};

export const useUpdateAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AttachmentInferType> }) =>
      attachmentService.updateAttachment(id, data),
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
    mutationFn: (id: string) => attachmentService.deleteAttachment(id),
    onSuccess: () => {
      queryClient?.invalidateQueries(["attachments"]);
      showSuccess("Fayl o'chirildi");
    },
    onError: showError,
  });
};

export const useGetAttachmentById = (id: string) => {
  return useQuery({
    queryKey: ["attachment", id],
    queryFn: () => attachmentService.getAttachmentById(id),
    enabled: !!id,
  });
};
