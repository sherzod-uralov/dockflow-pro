"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { journalCreate } from "../scheme/journal-create";
import {
  useJournalCreateMutation,
  useUpdateJournal,
} from "../hook/journal.hook";
import { useGetAllDeportaments } from "@/features/deportament/hook/deportament.hook";
import { useGetUserQuery } from "../../admin/admin-users/hook/user.hook";
import SimpleFormGenerator, {
  Field,
} from "@/components/shared/ui/custom-form-generator";
import { JournalFormProps } from "../types/journal.types";

const journalSchema = journalCreate();

const JournalForm = ({ modal, mode, journal }: JournalFormProps) => {
  const { data: departmentsData } = useGetAllDeportaments({
    pageNumber: 1,
    pageSize: 100,
    search: "",
  });
  const { data: usersData } = useGetUserQuery({
    pageNumber: 1,
    pageSize: 100,
    search: "",
  });

  const journalCreateMutation = useJournalCreateMutation();
  const journalUpdateMutation = useUpdateJournal();

  const isUpdate = mode === "edit";
  const isLoading =
    journalCreateMutation.isLoading || journalUpdateMutation.isLoading;

  const defaultValues = useMemo(() => {
    return {
      name: journal?.name ?? "",
      prefix: journal?.prefix ?? "",
      format: journal?.format ?? "",
      departmentId: journal?.department?.id ?? "",
      responsibleUserId: journal?.responsibleUser?.id ?? "",
    };
  }, [journal]);

  const fields: Field[] = useMemo(() => {
    return [
      {
        type: "text",
        name: "name",
        label: "Jurnal nomi",
        placeholder: "Jurnal nomini kiriting...",
        colSpan: 2,
      },
      {
        type: "text",
        name: "prefix",
        label: "Prefiks",
        placeholder: "Masalan, KHM",
      },
      {
        type: "text",
        name: "format",
        label: "Format",
        placeholder: "Format kiriting...",
      },
      {
        type: "select",
        name: "departmentId",
        label: "Departament",
        placeholder: "Departamentni tanlang",
        options:
          departmentsData?.data?.map((department) => ({
            label: department.name,
            value: department.id,
          })) ?? [],
        colSpan: 2,
      },
      {
        type: "select",
        name: "responsibleUserId",
        label: "Mas'ul shaxs",
        placeholder: "Foydalanuvchini tanlang",
        options:
          usersData?.data?.map((user) => ({
            label: user.username,
            value: user.id,
          })) ?? [],
        colSpan: 2,
      },
    ];
  }, [departmentsData, usersData]);

  const handleSubmit = (values: any) => {
    if (isUpdate && journal?.id) {
      journalUpdateMutation.mutate(
        { id: journal.id, data: values },
        {
          onSuccess: () => {
            modal.closeModal();
          },
        },
      );
    } else {
      journalCreateMutation.mutate(values, {
        onSuccess: () => {
          modal.closeModal();
        },
      });
    }
  };

  return (
    <SimpleFormGenerator
      schema={journalSchema}
      fields={fields}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitLabel={isUpdate ? "Yangilash" : "Qo'shish"}
      renderActions={({ isSubmitting }) => (
        <div className="flex gap-2 justify-end">
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
};

export default JournalForm;
