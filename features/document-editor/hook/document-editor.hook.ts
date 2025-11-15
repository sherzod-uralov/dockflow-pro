import { useQuery, useMutation } from "react-query";
import { documentEditorService } from "../service/document-editor.service";
import { WopiTokenResponse } from "../type/document-editor.type";
import { useToast } from "@/hooks/use-toast";

export const useGetWopiToken = (fileId: string, documentId: string) => {
  return useQuery<WopiTokenResponse>({
    queryKey: ["wopiToken", fileId, documentId],
    queryFn: () => documentEditorService.getWopiToken(fileId, documentId),
    enabled: !!fileId && !!documentId, // Only run if both IDs exist
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Only retry once on 401 errors
  });
};

export const useSaveAnnotations = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      documentId,
      xfdfContent,
    }: {
      documentId: string;
      xfdfContent: string;
    }) => documentEditorService.saveAnnotations(documentId, xfdfContent),
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyatli",
        description: "Izohlar va QR kodlar saqlandi",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Izohlarni saqlashda xatolik yuz berdi";
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: errorMessage,
      });
    },
  });
};