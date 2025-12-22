"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextInput,
  PasswordInput,
  Select,
  Switch,
  Button,
  Group,
  Stack,
  FileInput,
  Text,
  Avatar,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { IconUpload, IconX } from "@tabler/icons-react";
import { UserSchema } from "../schema/user.schema";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../hook/user.hook";
import { useGetRoles } from "../../roles/hook/role.hook";
import { useGetAllDeportaments } from "@/features/deportament";
import type { UserFormProps } from "../type/user.types";
import { z } from "zod";
import { useCreateAttachment } from "@/features/attachment/hook/attachment.hook";

type UserFormValues = z.infer<typeof UserSchema>;

export default function UserForm({ mode, modal, userData }: UserFormProps) {
  const createUser = useCreateUserMutation();
  const updateUser = useUpdateUserMutation();
  const { mutateAsync: uploadFile, isLoading: isUploading } = useCreateAttachment();

  const { data: roles, isLoading: isLoadingRoles } = useGetRoles({
    pageNumber: 1,
    pageSize: 100,
    search: "",
  });

  const { data: departments, isLoading: isLoadingDepartments } = useGetAllDeportaments({
    pageNumber: 1,
    pageSize: 100,
    search: "",
  });

  const isUpdate = mode === "edit";
  const isLoading = createUser.isLoading || updateUser.isLoading;
  const [changePassword, setChangePassword] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(userData?.avatarUrl || null);

  const defaultValues = useMemo(() => ({
    fullname: userData?.fullname ?? "",
    username: userData?.username ?? "",
    roleId: userData?.role?.id ?? "",
    departmentId: userData?.department?.id ?? "",
    avatarUrl: userData?.avatarUrl ?? "",
    isActive: userData?.isActive ?? true,
    password: "",
  }), [userData]);

  // Dynamic Schema for Validation
  const FormSchema = useMemo(() => {
    if (isUpdate && !changePassword) {
      return UserSchema;
    }
    // For Create Mode OR Update with Password Change, make password required
    return UserSchema.extend({
      password: z.string()
        .min(8, { message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak" })
        .regex(/[A-Z]/, { message: "Parolda kamida bitta katta harf bo'lishi kerak" })
        .regex(/[a-z]/, { message: "Parolda kamida bitta kichik harf bo'lishi kerak" })
        .regex(/[0-9]/, { message: "Parolda kamida bitta raqam bo'lishi kerak" })
    });
  }, [isUpdate, changePassword]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  // Reset form when userData changes
  useEffect(() => {
    if (userData) {
      reset(defaultValues);
      setPreviewUrl(userData.avatarUrl || null);
    }
  }, [userData, reset, defaultValues]);

  const onSubmit = async (values: UserFormValues) => {
    const payload: any = { ...values };

    // Handle file upload if avatarUrl is a File object
    if (values.avatarUrl instanceof File) {
      try {
        const response = await uploadFile(values.avatarUrl);
        payload.avatarUrl = response.fileUrl; // Use the URL from response
      } catch (error) {
        console.error("File upload failed", error);
        return; // Stop submission on upload error
      }
    } else {
      // If not a File (i.e. string or empty), check if it's empty
      if (!values.avatarUrl || values.avatarUrl === "") {
        delete payload.avatarUrl;
      }
    }

    // Password logic
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
        }
      );
    } else {
      createUser.mutate(payload, {
        onSuccess: () => {
          modal.closeModal();
        },
      });
    }
  };

  const roleOptions = useMemo(() =>
    roles?.data?.map((role) => ({
      label: role.name,
      value: role.id,
    })) ?? [],
    [roles]);

  const departmentOptions = useMemo(() =>
    departments?.data?.map((dep) => ({
      label: dep.name,
      value: dep.id,
    })) ?? [],
    [departments]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setValue("avatarUrl", file as any);
    } else {
      setPreviewUrl(null);
      setValue("avatarUrl", "");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md" pos="relative">
        <LoadingOverlay visible={isLoading || isLoadingRoles || isLoadingDepartments || isUploading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

        <Group grow align="flex-start">
          <Controller
            name="fullname"
            control={control}
            render={({ field }) => (
              <TextInput
                label="To'liq ismi"
                placeholder="F.I.O"
                error={errors.fullname?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Foydalanuvchi nomi"
                placeholder="Username"
                error={errors.username?.message}
                {...field}
              />
            )}
          />
        </Group>

        <Group grow align="flex-start">
          <Controller
            name="roleId"
            control={control}
            render={({ field }) => (
              <Select
                label="Ro'l"
                placeholder="Ro'lni tanlang"
                data={roleOptions}
                error={errors.roleId?.message}
                {...field}
                value={field.value?.toString()}
              />
            )}
          />
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Select
                label="Bo'lim"
                placeholder="Bo'limni tanlang"
                data={departmentOptions}
                error={errors.departmentId?.message}
                {...field}
                value={field.value?.toString()}
              />
            )}
          />
        </Group>

        {/* Password Section */}
        {(mode === 'create' || changePassword) && (
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                label="Parol"
                withAsterisk
                placeholder="Parol kiriting"
                error={errors.password?.message}
                {...field}
              />
            )}
          />
        )}

        {isUpdate && (
          <Switch
            label="Parolni o'zgartirasizmi?"
            checked={changePassword}
            onChange={(event) => setChangePassword(event.currentTarget.checked)}
            style={{ cursor: "pointer" }}
          />
        )}

        {/* Avatar Section */}
        <Group align="center">
          <Avatar src={previewUrl} size="lg" radius="xl" color="blue">
            {userData?.fullname?.charAt(0) || "?"}
          </Avatar>
          <Box style={{ flex: 1 }}>
            <FileInput
              label="Profil rasmi"
              placeholder="Rasm yuklash"
              leftSection={<IconUpload size={14} />}
              clearable
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              error={errors.avatarUrl?.message as string}
            />
            <Text size="xs" c="dimmed" mt={4}>
              Maksimal hajmi: 10MB. Formatlar: .jpg, .png
            </Text>
          </Box>
        </Group>

        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Switch
              label="Aktivmi?"
              checked={field.value}
              onChange={(event) => field.onChange(event.currentTarget.checked)}
              error={errors.isActive?.message}
              style={{ cursor: "pointer" }}
            />
          )}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => modal.closeModal()}>
            Bekor qilish
          </Button>
          <Button type="submit" loading={isSubmitting || isLoading || isUploading}>
            {isUpdate ? "Saqlash" : "Qo'shish"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
