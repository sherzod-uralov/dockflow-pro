"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        type: "file",
        name: "avatarUrl",
        label: "Profil uchun rasm",
        multiple: false,
        fileReturnShape: "object",
        fileUrlTarget: "fileUrl",
        accept: {
          "image/*": [".jpg", ".jpeg", ".png"],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024,
        helperText: "Profil rasm faylni yuklang (≤10MB) (.jpg, .jpeg, .png)",
        colSpan: 2,
        existingFiles:
          isUpdate && userData?.avatarUrl
            ? [
                {
                  id: userData.id || "current-avatar",
                  fileName: "Avatar",
                  fileUrl: userData.avatarUrl,
                },
              ]
            : undefined,
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
    const payload = {
      ...values,
      avatarUrl: values.avatarUrl?.fileUrl || values.avatarUrl || "",
    };

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

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col gap-4">
      {isUpdate && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="changePassword"
            checked={changePassword}
            onCheckedChange={(checked) => setChangePassword(checked === true)}
          />
          <Label
            htmlFor="changePassword"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Parolni o'zgartirasizmi?
          </Label>
        </div>
      )}

      {isUpdate && userData?.avatarUrl && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src={userData.avatarUrl} alt={userData.fullname} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(userData.fullname)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Joriy avatar</p>
            <p className="text-xs text-muted-foreground">
              Yangi avatar yuklash uchun quyidagi formadan foydalaning
            </p>
          </div>
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
              className="hover:text-text-on-dark"
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
