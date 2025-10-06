"use client";

import { deportamentScheme } from "../schema/deportament.schema";
import { z } from "zod";
import { ModalState } from "@/types/modal";
import {
  useCreateDeportament,
  useGetAllDeportaments,
  useUpdateDeportament,
} from "../hook/deportament.hook";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { DepartmentResponse } from "../type/deportament.type";

import { Button } from "@/components/ui/button";
import SimpleFormGenerator, {
  Field,
} from "@/components/shared/ui/custom-form-generator";

type DeportamentFormType = z.infer<typeof deportamentScheme>;

interface DeportamentFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  deportament?: DepartmentResponse;
  onSuccess?: () => void;
}

const DeportamentFormModal = ({
  modal,
  mode,
  deportament,
  onSuccess,
}: DeportamentFormModalProps) => {
  const createDeportamentMutation = useCreateDeportament();
  const updateDeportamentMutation = useUpdateDeportament();
  const { data: departments } = useGetAllDeportaments();
  const { data: users } = useGetUserQuery();

  const isUpdate = mode === "update";
  const isLoading =
    createDeportamentMutation.isLoading || updateDeportamentMutation.isLoading;

  const fields: Field[] = [
    {
      name: "name",
      label: "Deportament nomi",
      type: "text",
      placeholder: "Deportament nomini kiriting",
      colSpan: 2,
    },
    {
      name: "description",
      label: "Deportament tavsifi",
      type: "textarea",
      placeholder: "Deportament tavsifini kiriting",
      colSpan: 2,
    },
    {
      name: "code",
      label: "Deportament kodi",
      type: "text",
      placeholder: "ITD",
    },
    {
      name: "location",
      label: "Deportament joylashuvi",
      type: "text",
      placeholder: "Joyni kiriting",
    },
    {
      name: "directorId",
      label: "Deportament direktori",
      type: "select",
      placeholder: "Direktorni tanlang",
      options:
        users?.data?.map((u) => ({
          value: u.id,
          label: u.fullname,
        })) || [],
    },
    {
      name: "parentId",
      label: "Deportament biriktirish",
      type: "select",
      placeholder: "Deportamentni tanlang",
      options:
        departments?.data?.map((d) => ({
          value: d.id,
          label: d.name,
        })) || [],
    },
  ];

  // 🔹 defaultValues
  const defaultValues: DeportamentFormType = isUpdate
    ? {
        name: deportament?.name ?? "",
        description: deportament?.description ?? "",
        code: deportament?.code ?? "",
        location: deportament?.location ?? "",
        directorId: deportament?.director?.id ?? "",
        parentId: deportament?.parent?.id ?? "",
      }
    : {
        name: "",
        description: "",
        code: "",
        location: "",
        directorId: "",
        parentId: "",
      };

  const handleSubmit = (values: DeportamentFormType) => {
    if (isUpdate && deportament) {
      updateDeportamentMutation.mutate(
        { id: deportament.id, data: values },
        {
          onSuccess: () => {
            modal.closeModal();
            onSuccess?.();
          },
        },
      );
    } else {
      createDeportamentMutation.mutate(values, {
        onSuccess: () => {
          modal.closeModal();
          onSuccess?.();
        },
      });
    }
  };

  return (
    <SimpleFormGenerator
      schema={deportamentScheme}
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

export default DeportamentFormModal;
