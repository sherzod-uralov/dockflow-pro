import type {
  SaveAnnotationsRequest,
  SaveAnnotationsResponse,
  GetDocumentResponse,
} from "../type";
import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";

const DEFAULT_PDF_URL =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export const pdfService = {
  getDocument: async (documentId?: string): Promise<GetDocumentResponse> => {
    if (!documentId) {
      return { pdfUrl: DEFAULT_PDF_URL };
    }

    const { data } = await axiosInstance.get<GetDocumentResponse>(endpoints.pdf.list(documentId));
    return data;
  },

  saveAnnotations: async (payload: SaveAnnotationsRequest): Promise<SaveAnnotationsResponse> => {
    const { data } = await axiosInstance.post<SaveAnnotationsResponse>(
      endpoints.pdf.create(payload.documentId),
      { xfdfUrl: payload.xfdf }
    );
    return data;
  },
};
