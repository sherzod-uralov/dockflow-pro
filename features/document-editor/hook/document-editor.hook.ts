import { useQuery } from "react-query";
import { documentEditorService } from "../service/document-editor.service";
import { WopiTokenResponse } from "../type/document-editor.type";

export const useGetWopiToken = (fileId: string) => {
  return useQuery<WopiTokenResponse>({
    queryKey: ["wopiToken", fileId],
    queryFn: () => documentEditorService.getWopiToken(fileId),
    enabled: !!fileId, // Only run if fileId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};