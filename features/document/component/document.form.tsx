"use client";

import { useState } from "react";
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
import { toast } from "sonner";

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
  const createMutation = useCreateDocument();
  const updateMutation = useUpdateDocument();
  const { data: documentTypes } = useGetAllDocumentTypes();
  const { data: journals } = useGetAllJournals({
    pageNumber: 1,
    pageSize: 1000,
  });

  const [existingFiles, setExistingFiles] = useState(
    document?.attachments || [],
  );
  const [formInstance, setFormInstance] = useState<any>(null);

  const isUpdate = mode === "update";

  const handleDeleteFile = (fileId: string) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (formInstance) {
      const current = formInstance.getValues("attachments") || [];
      formInstance.setValue(
        "attachments",
        current.filter((id: string) => id !== fileId),
        { shouldValidate: true },
      );
    }
    toast.success("Fayl o'chirildi");
  };

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
      options:
        documentTypes?.data?.map((t) => ({ value: t.id, label: t.name })) || [],
    },
    {
      name: "journalId",
      label: "Jurnal",
      type: "select",
      options:
        journals?.data?.map((j) => ({ value: j.id, label: j.name })) || [],
      colSpan: 2,
    },
    {
      name: "attachments",
      label: "Fayl",
      type: "file",
      colSpan: 2,
      multiple: true,
      fileReturnShape: "array:id",
      existingFiles: existingFiles.map((f) => ({
        ...f,
        fileSize: f.fileSize || 0,
      })),
      onDeleteExisting: handleDeleteFile,
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
        attachments: document?.attachments?.map((a) => a.id) ?? [],
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
    const data = {
      ...values,
      attachments: [
        ...existingFiles.map((f) => f.id),
        ...(values.attachments || []),
      ],
    };

    if (isUpdate && document) {
      updateMutation.mutate(
        { id: document.id || "", data },
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
      schema={documentScheme}
      fields={fields}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onFormReady={setFormInstance}
      renderActions={({ isSubmitting }) => (
        <div className="flex justify-end gap-2 pt-4">
          <Button
            className="btn-outline-destructive"
            variant="outline"
            onClick={modal.closeModal}
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

export default DocumentFormModal;
