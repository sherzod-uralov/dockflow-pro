"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserSchema } from "../schema/user.schema";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../hook/user.hook";
import { useGetRoles } from "../../roles/hook/role.hook";
import { useGetAllDeportaments } from "@/features/deportament";
import SimpleFormGenerator, {
  Field,
} from "@/components/shared/ui/custom-form-generator";
import type { UserFormProps } from "../type/user.types";
import { de } from "date-fns/locale";

export default function UserForm({ mode, modal, userData }: UserFormProps) {
  const createUser = useCreateUserMutation();
  const updateUser = useUpdateUserMutation();
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

  const [changePassword, setChangePassword] = useState(false);

  const defaultValues = useMemo(() => {
    const base = {
      fullname: userData?.fullname ?? "",
      username: userData?.username ?? "",
      roleId: userData?.role?.id ?? "",
      departmentId: userData?.department?.id ?? "",
      avatarUrl: userData?.avatarUrl ?? "",
      isActive: userData?.isActive ?? true,
    };

    if (!isUpdate || changePassword) {
      return { ...base, password: "" };
    }

    return base;
  }, [userData, isUpdate, changePassword]);

  const fields: Field[] = useMemo(() => {
    const baseFields: Field[] = [
      {
        type: "text",
        name: "fullname",
        label: "To'liq ismi",
        placeholder: "Ismni kiriting (F.I.O)",
        colSpan: 2,
      },
      {
        type: "text",
        name: "username",
        label: "Foydalanuvchi nomi (kirish uchun)",
        placeholder: "Username",
        colSpan: 2,
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
        colSpan: 2,
      },
      {
        type: "checkbox",
        name: "isActive",
        label: "Aktivmi?",
      },
    ];

    if (!isUpdate || changePassword) {
      baseFields.splice(2, 0, {
        type: "password",
        name: "password",
        label: "Parol (kirish uchun)",
        placeholder: "Password",
        colSpan: 2,
      });
    }

    return baseFields;
  }, [roles, departments, isUpdate, changePassword]);

  const handleSubmit = (values: any) => {
    const payload = { ...values };
    if (isUpdate && !changePassword) {
      delete payload.password;
    }

    if (isUpdate && userData?.id) {
      updateUser.mutate(
        { id: userData.id, data: payload },
        {
          onSuccess: () => {
            modal.closeModal();
          },
        },
      );
    } else {
      createUser.mutate(payload, {
        onSuccess: () => {
          modal.closeModal();
        },
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {isUpdate && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="changePassword"
            checked={changePassword}
            onChange={(e) => setChangePassword(e.target.checked)}
          />
          <label htmlFor="changePassword">Parolni o‘zgartirasizmi?</label>
        </div>
      )}

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
    </div>
  );
}
