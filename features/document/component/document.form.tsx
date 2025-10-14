"use client";

import { ModalState } from "@/types/modal";
import { Button } from "@/components/ui/button";
import {
  DocumentFormType,
  documentScheme,
} from "@/features/document/schema/document.schema";
import {
  DocumentGetResponse,
  useCreateDocument,
  useUpdateDocument,
} from "@/features/document";
import SimpleFormGenerator, {
  Field,
} from "@/components/shared/ui/custom-form-generator";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { useGetAllJournals } from "@/features/journal/hook/journal.hook";
import { useFormContext } from "react-hook-form";

interface DocumentFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  document?: DocumentGetResponse;
  onSuccess?: () => void;
}

const DocumentFormModal = ({
  modal,
  mode,
  document,
  onSuccess,
}: DocumentFormModalProps) => {
  const createDocumentMutation = useCreateDocument();
  const updateDocumentMutation = useUpdateDocument();
  const { data: documentTypes } = useGetAllDocumentTypes();
  const { data: journals } = useGetAllJournals({
    pageNumber: 1,
    pageSize: 1000,
  });

  const isUpdate = mode === "update";
  const isLoading =
    createDocumentMutation.isLoading || updateDocumentMutation.isLoading;

  const fields: Field[] = [
    {
      name: "title",
      label: "Hujjat nomi",
      type: "text",
      placeholder: "Hujjat nomini kiriting",
      colSpan: 2,
    },
    {
      name: "description",
      label: "Hujjat tavsifi",
      type: "textarea",
      placeholder: "Hujjat tavsifini kiriting",
      colSpan: 2,
    },
    {
      name: "documentNumber",
      label: "Hujjat raqami",
      type: "text",
      placeholder: "DOC-001",
    },
    {
      name: "priority",
      label: "Muhimlik darajasi",
      type: "select",
      placeholder: "Muhimlikni tanlang",
      options: [
        { value: "LOW", label: "Past" },
        { value: "MEDIUM", label: "O'rta" },
        { value: "HIGH", label: "Yuqori" },
      ],
    },
    {
      name: "status",
      label: "Holati",
      type: "select",
      placeholder: "Holatni tanlang",
      options: [
        { value: "DRAFT", label: "Qoralama" },
        { value: "PUBLISHED", label: "E'lon qilingan" },
        { value: "ARCHIVED", label: "Arxivlangan" },
      ],
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
    },
    {
      name: "journalId",
      label: "Jurnal",
      type: "select",
      placeholder: "Jurnalni tanlang",
      options:
        journals?.data?.map((journal) => ({
          value: journal.id,
          label: journal.name,
        })) || [],
      colSpan: 2,
    },
    {
      name: "attachments",
      label: "Fayl",
      type: "file",
      placeholder: "Faylni tanlang",
      colSpan: 2,
    },
  ];

  const defaultValues: DocumentFormType = isUpdate
    ? {
        title: document?.title ?? "",
        description: document?.description ?? "",
        documentNumber: document?.documentNumber ?? "",
        priority: document?.priority ?? "LOW",
        status: document?.status ?? "DRAFT",
        documentTypeId: document?.documentType?.id ?? "",
        journalId: document?.journal?.id ?? "",
        attachments: document?.attachments?.map((att) => att.id) ?? [],
      }
    : {
        title: "",
        description: "",
        documentNumber: "",
        priority: "LOW",
        status: "DRAFT",
        documentTypeId: "",
        journalId: "",
        attachments: [],
      };

  const handleSubmit = (values: DocumentFormType) => {
    if (isUpdate && document) {
      updateDocumentMutation.mutate(
        { id: document.id || "", data: values },
        {
          onSuccess: () => {
            modal.closeModal();
            onSuccess?.();
          },
        },
      );
    } else {
      createDocumentMutation.mutate(values, {
        onSuccess: () => {
          modal.closeModal();
          onSuccess?.();
        },
      });
    }
  };

  return (
    <SimpleFormGenerator
      schema={documentScheme}
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

export default DocumentFormModal;
