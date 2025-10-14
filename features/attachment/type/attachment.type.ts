export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  document: {
    id: string;
    title: string;
  };
  uploadedBy: {
    id: string;
    fullname: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface GetAllAttachments {
  count: number;
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  data: Attachment[];
}

export interface AttachmentQueryParams {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  documentId?: string;
  uploadedById?: string;
}
