"use client";

import React, { useMemo } from "react";

import { documentScheme } from "../schema/document.schema";
import { z } from "zod";
import { useCreateDocument, useUpdateDocument } from "../hook/document.hook";
import { useGetAllDeportaments } from "@/features/deportament";
import { Button } from "@/components/ui/button";
import type { ModalState } from "@/types/modal";
import SimpleFormGenerator, {
  Field,
} from "@/components/shared/ui/custom-form-generator";

type DocumentFormType = z.infer<typeof documentScheme>;

interface Props {
  modal: ModalState;
  mode: "create" | "update";
  document?: Partial<DocumentFormType> & { id?: string };
  onSuccess?: () => void;
}

export default function DocumentFormModal({
  modal,
  mode,
  document,
  onSuccess,
}: Props) {
  const createDoc = useCreateDocument();
  const updateDoc = useUpdateDocument();
  const { data: deportaments } = useGetAllDeportaments();

  const isUpdate = mode === "update";
  const isLoading = createDoc.isLoading || updateDoc.isLoading;

  const defaultValues: Partial<DocumentFormType> = {
    name: document?.name ?? "",
    deportamentId: document?.deportamentId ?? "",
  };

  const fields: Field[] = useMemo(
    () => [
      {
        type: "text",
        name: "name",
        label: "Document nomi",
        placeholder: "Document nomini kiriting",
      },
      {
        type: "select",
        name: "deportamentId",
        label: "Deportament",
        placeholder: "Deportament tanlang",
        options: (deportaments?.data ?? []).map((d: any) => ({
          label: d.name,
          value: d.id,
        })),
      },
    ],
    [deportaments],
  );

  const handleSubmit = (values: DocumentFormType) => {
    if (isUpdate && document?.id) {
      updateDoc.mutate(
        { id: document.id, data: values },
        {
          onSuccess: () => {
            modal.closeModal();
            onSuccess?.();
          },
        },
      );
    } else {
      createDoc.mutate(values, {
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => modal.closeModal()}
            disabled={isLoading}
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
}
