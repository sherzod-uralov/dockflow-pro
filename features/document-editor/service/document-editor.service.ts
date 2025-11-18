import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import {
  WopiTokenResponse,
  WopiTokenRequest,
  SaveAnnotationsRequest,
} from "../type/document-editor.type";

export const documentEditorService = {
  getWopiToken: async (
    fileId: string,
    documentId: string,
  ): Promise<WopiTokenResponse> => {
    const response = await axiosInstance.post<WopiTokenResponse>(
      endpoints.wopi.token,
      {
        fileId,
      } as WopiTokenRequest,
    );
    return response.data;
  },

  saveAnnotations: async (
    documentId: string,
    xfdfContent: string,
  ): Promise<void> => {
    const response = await axiosInstance.post(
      endpoints.document.savePdfAnnotations(documentId),
      {
        xfdfContent,
      } as SaveAnnotationsRequest,
    );
    return response.data;
  },
};
