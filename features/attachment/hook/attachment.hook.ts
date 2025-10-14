import { useMutation, useQuery, useQueryClient } from "react-query";
import { attachmentService } from "../service/attachment.service";
import {
  GetAllAttachments,
  AttachmentQueryParams,
} from "../type/attachment.type";
import { toast } from "sonner";
import { AttachmentInferType } from "@/features/attachment/schema/attachment.schema";

export const useCreateAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentService.createAttachment(file),
    onSuccess: () => {
      queryClient?.invalidateQueries(["attachments"]);
      toast.success("Fayl muvaffaqiyatli yuklandi");
    },
    onError: (error: any) => {},
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
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AttachmentInferType>;
    }) => attachmentService.updateAttachment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["attachments"]);
      toast.success("Fayl ma'lumotlari muvaffaqiyatli yangilandi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attachmentService.deleteAttachment(id),
    onSuccess: () => {
      queryClient?.invalidateQueries(["attachments"]);
      toast.success("Fayl muvaffaqiyatli o'chirildi");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Faylni o'chirishda xatolik yuz berdi",
      );
    },
  });
};

export const useGetAttachmentById = (id: string) => {
  return useQuery({
    queryKey: ["attachment", id],
    queryFn: () => attachmentService.getAttachmentById(id),
    enabled: !!id,
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Fayl ma'lumotini olishda xatolik",
      );
    },
  });
};
