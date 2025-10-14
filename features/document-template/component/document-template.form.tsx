"use client";

import { ModalState } from "@/types/modal";
import { Button } from "@/components/ui/button";
import {
  DocumentTemplateFormType,
  documentTemplateSchema,
} from "@/features/document-template/schema/document-template.schema";
import {
  DocumentTemplateResponse,
  useCreateDocumentTemplate,
  useUpdateDocumentTemplate,
} from "@/features/document-template";
import SimpleFormGenerator, {
  Field,
} from "@/components/shared/ui/custom-form-generator";
import { useGetAllDocumentTypes } from "@/features/document-type";

interface DocumentTemplateFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  documentTemplate?: DocumentTemplateResponse;
  onSuccess?: () => void;
}

//dev-a

const DocumentTemplateFormModal = ({
                                     modal,
                                     mode,
                                     documentTemplate,
                                     onSuccess,
                                   }: DocumentTemplateFormModalProps) => {
  const createMutation = useCreateDocumentTemplate();
  const updateMutation = useUpdateDocumentTemplate();
  const { data: documentTypes } = useGetAllDocumentTypes();

  const isUpdate = mode === "update";
  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  const fields: Field[] = [
    {
      name: "name",
      label: "Shablon nomi",
      type: "text",
      placeholder: "Shablon nomini kiriting",
      colSpan: 2,
    },
    {
      name: "description",
      label: "Tavsif",
      type: "textarea",
      placeholder: "Shablon tavsifini kiriting",
      colSpan: 2,
    },
    {
      name: "documentTypeId",
      label: "Hujjat turi",
      type: "select",
      placeholder: "Hujjat turini tanlang",
      options:
        documentTypes?.data?.map((type) => ({
          value: type.id as string,
          label: type.name as string,
        })) || [],
      colSpan: 2,
    },
    {
      name: "templateFileId",
      label: "Shablon fayli",
      type: "file",
      placeholder: "Faylni yuklang",
      multiple: false,
      fileReturnShape: "id",
      accept: {
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
      },
      maxSize: 10 * 1024 * 1024,
      helperText: "PDF, DOC, DOCX (max 10MB)",
      colSpan: 2,
    },
    {
      name: "isActive",
      label: "Faol",
      type: "checkbox",
    },
    {
      name: "isPublic",
      label: "Ommaviy",
      type: "checkbox",
    },
  ];

  const defaultValues: DocumentTemplateFormType = isUpdate
    ? {
      name: documentTemplate?.name ?? "",
      description: documentTemplate?.description ?? "",
      documentTypeId: documentTemplate?.documentType?.id ?? "",
      templateFileId: "",
      isActive: documentTemplate?.isActive ?? true,
      isPublic: documentTemplate?.isPublic ?? true,
    }
    : {
      name: "",
      description: "",
      documentTypeId: "",
      templateFileId: "",
      isActive: true,
      isPublic: true,
    };

  const handleSubmit = (values: DocumentTemplateFormType) => {
    if (isUpdate && documentTemplate) {
      updateMutation.mutate(
        { id: documentTemplate.id, data: values },
        {
          onSuccess: () => {
            modal.closeModal();
            onSuccess?.();
          },
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          modal.closeModal();
          onSuccess?.();
        },
      });
    }
  };

  return (
    <SimpleFormGenerator
      schema={documentTemplateSchema}
      fields={fields}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitLabel={isUpdate ? "Yangilash" : "Qo'shish"}
      renderActions={({ isSubmitting }) => (
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={modal.closeModal}
            disabled={isSubmitting || isLoading}
          >
            Bekor qilish
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading
              ? isUpdate
                ? "Yangilanmoqda..."
                : "Qo'shilmoqda..."
              : isUpdate
                ? "Yangilash"
                : "Qo'shish"}
          </Button>
        </div>
      )}
    />
  );
};

export default DocumentTemplateFormModal;
