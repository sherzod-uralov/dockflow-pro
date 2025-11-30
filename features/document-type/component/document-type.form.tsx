"use client";

import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stack, TextInput, Textarea, Button, Group } from "@mantine/core";
import { documentTypeScheme } from "../schema/document-type.schema";
import { ModalState } from "@/types/modal";
import {
  useCreateDocumentType,
  useUpdateDocumentType,
} from "../hook/document-type.hook";
import { DocumentType as DocumentTypeModel } from "../type/document-type.type";

type DocumentTypeFormType = z.infer<typeof documentTypeScheme>;

interface DocumentTypeFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  documentType?: DocumentTypeModel;
  onSuccess?: () => void;
}

const DocumentTypeFormModal = ({
  modal,
  mode,
  documentType,
  onSuccess,
}: DocumentTypeFormModalProps) => {
  const createDocumentTypeMutation = useCreateDocumentType();
  const updateDocumentTypeMutation = useUpdateDocumentType();

  const isUpdate = mode === "update";
  const isLoading =
    createDocumentTypeMutation.isLoading ||
    updateDocumentTypeMutation.isLoading;

  const form = useForm<DocumentTypeFormType>({
    resolver: zodResolver(documentTypeScheme),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isUpdate && documentType) {
      form.reset({
        name: documentType.name || "",
        description: documentType.description || "",
      });
    } else if (!isUpdate) {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [documentType, isUpdate, form, modal.isOpen]);

  const handleSubmit = (values: DocumentTypeFormType) => {
    if (isUpdate && documentType) {
      updateDocumentTypeMutation.mutate(
        { id: documentType.id || "", data: values },
        {
          onSuccess: () => {
            modal.closeModal();
            form.reset();
            onSuccess?.();
          },
        }
      );
    } else {
      // @ts-ignore
      createDocumentTypeMutation.mutate(values, {
        onSuccess: () => {
          modal.closeModal();
          form.reset();
          onSuccess?.();
        },
      });
    }
  };

  const handleCancel = useCallback(() => {
    modal.closeModal();
    form.reset();
  }, [modal, form]);

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Hujjat turi nomi"
          placeholder="Hujjat turini nomini kiriting"
          size="sm"
          radius="sm"
          disabled={isLoading}
          error={form.formState.errors.name?.message}
          {...form.register("name")}
          styles={{
            input: {
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
              "&:focus": {
                borderColor: "#1e3a5f",
              },
            },
            label: {
              color: "#495057",
              fontWeight: 500,
              marginBottom: 4,
            },
          }}
        />

        <Textarea
          label="Hujjat tavsifi"
          placeholder="Hujjat tavsifini kiriting"
          size="sm"
          radius="sm"
          minRows={3}
          disabled={isLoading}
          error={form.formState.errors.description?.message}
          {...form.register("description")}
          styles={{
            input: {
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
              "&:focus": {
                borderColor: "#1e3a5f",
              },
            },
            label: {
              color: "#495057",
              fontWeight: 500,
              marginBottom: 4,
            },
          }}
        />

        <Group
          justify="flex-end"
          gap="xs"
          pt="md"
          style={{ borderTop: "1px solid #e9ecef" }}
        >
          <Button
            variant="outline"
            size="sm"
            radius="sm"
            onClick={handleCancel}
            disabled={isLoading}
            styles={{
              root: {
                borderColor: "#e9ecef",
                color: "#495057",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                },
              },
            }}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            size="sm"
            radius="sm"
            loading={isLoading}
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {isLoading
              ? isUpdate
                ? "Yangilanmoqda..."
                : "Qo'shilmoqda..."
              : isUpdate
              ? "Yangilash"
              : "Qo'shish"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default DocumentTypeFormModal;
