import { GlobalGetAllPaginationProps } from "@/types/global.types";

export interface TaskAttachmentGetResponse {
  id: string;
  taskId: string;
  attachmentId: string;
  uploadedById: string;
  description?: string;
  attachment: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url?: string;
  };
  uploadedBy: {
    id: string;
    fullname: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAttachmentCreatePayload {
  taskId: string;
  attachmentId: string;
  description?: string;
}

export interface TaskAttachmentUpdatePayload {
  description?: string;
}

export interface TaskAttachmentQueryParams extends GlobalGetAllPaginationProps {
  taskId?: string;
}
