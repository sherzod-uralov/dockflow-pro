"use client";

import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stack, TextInput, Textarea, Button, Group, SimpleGrid } from "@mantine/core";
import { permissionScheme } from "../schema/permission.schema";
import { ModalState } from "@/types/modal";
import {
  useCreatePermission,
  useUpdatePermission,
} from "../hook/permission.hook";
import { Permission } from "../type/permission.type";
import { colors } from "@/lib/colors";

type PermissionFormType = z.infer<typeof permissionScheme>;

interface PermissionFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  permission?: Permission;
  onSuccess?: () => void;
}

const PermissionFormModal = ({
  modal,
  mode,
  permission,
  onSuccess,
}: PermissionFormModalProps) => {
  const createPermissionMutation = useCreatePermission();
  const updatePermissionMutation = useUpdatePermission();

  const isUpdate = mode === "update";
  const isLoading =
    createPermissionMutation.isLoading || updatePermissionMutation.isLoading;

  const form = useForm<PermissionFormType>({
    resolver: zodResolver(permissionScheme),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      key: "",
      module: "",
    },
  });

  useEffect(() => {
    if (isUpdate && permission) {
      form.reset({
        name: permission.name || "",
        description: permission.description || "",
        key: permission.key || "",
        module: permission.module || "",
      });
    } else if (!isUpdate) {
      form.reset({
        name: "",
        description: "",
        key: "",
        module: "",
      });
    }
  }, [permission, isUpdate, form, modal.isOpen]);

  const handleSubmit = (values: PermissionFormType) => {
    if (isUpdate && permission) {
      updatePermissionMutation.mutate(
        { id: permission.id || "", data: values },
        {
          onSuccess: () => {
            modal.closeModal();
            form.reset();
            onSuccess?.();
          },
        }
      );
    } else {
      createPermissionMutation.mutate(values, {
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
          label="Ruxsat nomi"
          placeholder="Ruxsat nomini kiriting"
          size="sm"
          radius="sm"
          disabled={isLoading}
          error={form.formState.errors.name?.message}
          {...form.register("name")}
          styles={{
            input: {
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              "&:focus": {
                borderColor: colors.primary,
              },
            },
            label: {
              color: colors.textSecondary,
              fontWeight: 500,
              marginBottom: 4,
            },
          }}
        />

        <Textarea
          label="Tavsif"
          placeholder="Ruxsat haqida qisqacha tavsif"
          size="sm"
          radius="sm"
          minRows={3}
          disabled={isLoading}
          error={form.formState.errors.description?.message}
          {...form.register("description")}
          styles={{
            input: {
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              "&:focus": {
                borderColor: colors.primary,
              },
            },
            label: {
              color: colors.textSecondary,
              fontWeight: 500,
              marginBottom: 4,
            },
          }}
        />

        <SimpleGrid cols={2}>
          <TextInput
            label="Kalit so'z"
            placeholder="permission.read"
            size="sm"
            radius="sm"
            disabled={isLoading}
            error={form.formState.errors.key?.message}
            {...form.register("key")}
            styles={{
              input: {
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                fontFamily: "monospace",
                "&:focus": {
                  borderColor: colors.primary,
                },
              },
              label: {
                color: colors.textSecondary,
                fontWeight: 500,
                marginBottom: 4,
              },
            }}
          />

          <TextInput
            label="Modul"
            placeholder="users"
            size="sm"
            radius="sm"
            disabled={isLoading}
            error={form.formState.errors.module?.message}
            {...form.register("module")}
            styles={{
              input: {
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                "&:focus": {
                  borderColor: colors.primary,
                },
              },
              label: {
                color: colors.textSecondary,
                fontWeight: 500,
                marginBottom: 4,
              },
            }}
          />
        </SimpleGrid>

        <Group
          justify="flex-end"
          gap="xs"
          pt="md"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <Button
            variant="outline"
            size="sm"
            radius="sm"
            onClick={handleCancel}
            disabled={isLoading}
            styles={{
              root: {
                borderColor: colors.border,
                color: colors.textSecondary,
                "&:hover": {
                  backgroundColor: colors.bg,
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
            style={{ backgroundColor: colors.primary }}
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

export default PermissionFormModal;
