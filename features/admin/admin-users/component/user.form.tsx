"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { UserSchema } from "../schema/user.schema";
import { useCreateUserMutation } from "../hook/user.hook";
import { useGetRoles } from "../../roles/hook/role.hook";
import { useGetAllDeportaments } from "@/features/deportament";
import SimpleFormGenerator, {
  Field,
} from "@/components/shared/ui/custom-form-generator";
import type { UserFormProps } from "../type/user.types";

export default function UserForm({ mode, modal, userData }: UserFormProps) {
  const createUser = useCreateUserMutation();

  const { data: roles } = useGetRoles({
    pageNumber: 1,
    pageSize: 10,
    search: "",
  });

  const { data: departments } = useGetAllDeportaments({
    pageNumber: 1,
    pageSize: 10,
    search: "",
  });

  const isUpdate = mode === "edit";
  const isLoading = createUser.isLoading;

  const defaultValues = {
    fullname: userData?.fullname ?? "",
    username: userData?.username ?? "",
    password: "",
    roleId: userData?.role?.id ?? "",
    departmentId: userData?.department?.id ?? "",
    avatarUrl: userData?.avatarUrl ?? "",
    isActive: userData?.isActive ?? true,
  };

  const fields: Field[] = useMemo(
    () => [
      {
        type: "text",
        name: "fullname",
        label: "To'liq ismi",
        placeholder: "Ismni kiriting (F.I.O)",
      },
      {
        type: "text",
        name: "username",
        label: "Foydalanuvchi nomi (kirish uchun)",
        placeholder: "Username",
      },
      {
        type: "password",
        name: "password",
        label: "Parol (kirish uchun)",
        placeholder: "Password",
      },
      {
        type: "select",
        name: "roleId",
        label: "Ro'l",
        placeholder: "Ro'lni tanlang",
        options:
          roles?.data?.map((role) => ({
            label: role.name,
            value: role.id,
          })) ?? [],
      },
      {
        type: "select",
        name: "departmentId",
        label: "Bo'lim",
        placeholder: "Bo'limni tanlang",
        options:
          departments?.data?.map((dep) => ({
            label: dep.name,
            value: dep.id,
          })) ?? [],
      },
      {
        type: "text",
        name: "avatarUrl",
        label: "Profil uchun rasm",
        placeholder: "Avatar URL",
      },
      {
        type: "checkbox",
        name: "isActive",
        label: "Aktivmi?",
      },
    ],
    [roles, departments],
  );

  const handleSubmit = (values: any) => {
    if (isUpdate && userData?.id) {
      console.log("Update user:", { id: userData.id, ...values });
    } else {
      createUser.mutate(values, {
        onSuccess: () => {
          modal.closeModal();
        },
      });
    }
  };

  return (
    <SimpleFormGenerator
      schema={UserSchema}
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
}
