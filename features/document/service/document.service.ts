import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import { createCRUDService } from "@/lib/crud-service";
import {
  DocumentGetResponse,
  GetAllDocuments,
  DocumentQueryParams,
  CreateWithOfficePayload,
  CreateWithOfficeResponse,
} from "@/features/document/type/document.type";
import { DocumentFormType } from "@/features/document/schema/document.schema";

const baseCRUDService = createCRUDService<
  DocumentGetResponse,
  DocumentFormType,
  Partial<DocumentFormType>,
  DocumentQueryParams,
  GetAllDocuments
>(endpoints.document, {
  transformParams: (params) => ({
    search: params?.search,
    pageSize: params?.pageSize,
    pageNumber: params?.pageNumber,
    documentTypeId: params?.documentTypeId,
    journalId: params?.journalId,
    status: params?.status,
    priority: params?.priority,
    templateId: params?.templateId,
  }),
});

export const documentService = {
  ...baseCRUDService,

  createWithOffice: async (payload: CreateWithOfficePayload): Promise<CreateWithOfficeResponse> => {
    const { data } = await axiosInstance.post<CreateWithOfficeResponse>(
      endpoints.document.createWithOffice,
      payload,
    );
    return data;
  },
};

// Backwards compatible aliases
export const {
  getAll: getAllDocuments,
  getById: getDocumentById,
  create: createDocument,
  update: updateDocument,
  delete: deleteDocument,
} = baseCRUDService;
