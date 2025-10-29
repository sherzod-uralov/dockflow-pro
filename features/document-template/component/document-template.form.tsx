"use client";

import { useState } from "react";
import { ModalState } from "@/types/modal";
import { Button } from "@/components/ui/button";
import SimpleFormGenerator, {
  Field,
} from "@/components/shared/ui/custom-form-generator";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { toast } from "sonner";
import {
  DocumentTemplateResponse,
  useCreateDocumentTemplate,
  useUpdateDocumentTemplate,
} from "@/features/document-template";
import {
  DocumentTemplateFormType,
  documentTemplateSchema,
} from "@/features/document-template/schema/document-template.schema";

interface DocumentTemplateFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  documentTemplate?: DocumentTemplateResponse;
  onSuccess?: () => void;
}

const DocumentTemplateFormModal = ({
  modal,
  mode,
  documentTemplate,
  onSuccess,
}: DocumentTemplateFormModalProps) => {
  const createMutation = useCreateDocumentTemplate();
  const updateMutation = useUpdateDocumentTemplate();
  const { data: documentTypes } = useGetAllDocumentTypes();
  const [existingFiles, setExistingFiles] = useState(
    documentTemplate?.templateFile ? [documentTemplate.templateFile] : [],
  );
  const [formInstance, setFormInstance] = useState<any>(null);

  const isUpdate = mode === "update";

  const handleDeleteFile = (fileId: string) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (formInstance) {
      formInstance.setValue("templateFileId", null, { shouldValidate: true });
    }
    toast.success("Fayl o'chirildi");
  };

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
        documentTypes?.data?.map((t) => ({
          value: t.id,
          label: t.name,
        })) || [],
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
    {
      name: "templateFileId",
      label: "Shablon fayli",
      type: "file",
      colSpan: 2,
      multiple: false,
      fileReturnShape: "id",
      accept: {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "application/msword": [".doc"],
      },
      helperText: "Faqat DOCX formatdagi fayllar (max 50MB)",
      maxSize: 50 * 1024 * 1024,
      existingFiles: existingFiles.map((f) => ({
        id: f.id,
        fileName: f.fileName,
        fileSize: f.fileSize,
        fileUrl: f.fileUrl,
      })),
      onDeleteExisting: handleDeleteFile,
    },
  ];

  const defaultValues: DocumentTemplateFormType = isUpdate
    ? {
        name: documentTemplate?.name ?? "",
        description: documentTemplate?.description ?? "",
        documentTypeId: documentTemplate?.documentType?.id ?? "",
        isActive: documentTemplate?.isActive ?? true,
        isPublic: documentTemplate?.isPublic ?? false,
        templateFileId: documentTemplate?.templateFile?.id ?? "",
      }
    : {
        name: "",
        description: "",
        documentTypeId: "",
        isActive: true,
        isPublic: false,
        templateFileId: "",
      };

  const handleSubmit = (values: DocumentTemplateFormType) => {
    const data = {
      ...values,
      templateFileId:
        existingFiles.length > 0 ? existingFiles[0].id : values.templateFileId,
    };

    if (isUpdate && documentTemplate) {
      updateMutation.mutate(
        { id: documentTemplate.id, data },
        {
          onSuccess: () => {
            modal.closeModal();
            onSuccess?.();
          },
        },
      );
    } else {
      createMutation.mutate(data, {
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
      onFormReady={setFormInstance}
      renderActions={({ isSubmitting }) => (
        <div className="flex justify-end gap-2 pt-4">
          <Button
            className="btn-outline-destructive"
            variant="outline"
            onClick={() => modal.closeModal()}
          >
            Bekor qilish
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
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
