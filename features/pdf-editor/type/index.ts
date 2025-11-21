export interface PDFDocument {
  documentId: string;
  pdfUrl: string;
}

export interface SaveAnnotationsRequest {
  documentId: string;
  xfdf: string;
}

export interface SaveAnnotationsResponse {
  success: boolean;
  message: string;
}

export interface GetDocumentResponse {
  pdfUrl: string;
}
