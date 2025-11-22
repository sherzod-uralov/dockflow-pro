import { useQuery } from "react-query";
import { viewService } from "../service/view.service";
import { DocumentVerifyResponse } from "../type/view.type";

export const useVerifyDocument = (id: string) => {
  return useQuery<DocumentVerifyResponse, Error>({
    queryKey: ["document-verify", id],
    queryFn: () => viewService.verifyDocument(id),
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
