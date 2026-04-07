import { useQuery } from "react-query";
import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { DocumentHistoryResponse } from "../type/document-history.type";

export const useGetDocumentHistory = (
  documentId: string | undefined,
  options?: { enabled?: boolean },
) => {
  return useQuery<DocumentHistoryResponse>({
    queryKey: ["document-history", documentId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<DocumentHistoryResponse>(
        endpoints.document.history(documentId!),
      );
      return data;
    },
    enabled: !!documentId && options?.enabled !== false,
  });
};
