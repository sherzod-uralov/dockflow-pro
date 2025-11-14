import type {
  SaveAnnotationsRequest,
  SaveAnnotationsResponse,
  GetDocumentResponse,
} from "../type";
import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { handlePdfError } from "@/utils/http-error-handler";

const DEFAULT_PDF_URL =
  "https://apryse.s3.amazonaws.com/public/files/samples/WebviewerDemoDoc.pdf";

export const pdfService = {
  getDocument: async (documentId?: string): Promise<GetDocumentResponse> => {
    if (!documentId) {
      return { pdfUrl: DEFAULT_PDF_URL };
    }

    return await handlePdfError.executeGet(() =>
      axiosInstance.get<GetDocumentResponse>(endpoints.pdf.list(documentId)),
    );
  },

  saveAnnotations: async (
    data: SaveAnnotationsRequest,
  ): Promise<SaveAnnotationsResponse> => {
    return await handlePdfError.executeCreate(() =>
      axiosInstance.post<SaveAnnotationsResponse>(
        endpoints.pdf.create(data.documentId),
        {
          xfdfUrl: data.xfdf,
        },
      ),
    );
  },
};
