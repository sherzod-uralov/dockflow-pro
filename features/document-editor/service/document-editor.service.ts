import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { WopiTokenResponse } from "../type/document-editor.type";

export const documentEditorService = {
  getWopiToken: async (fileId: string): Promise<WopiTokenResponse> => {
    const response = await axiosInstance.post(endpoints.wopi.token, {
      fileId,
    });
    return response.data;
  },
};
