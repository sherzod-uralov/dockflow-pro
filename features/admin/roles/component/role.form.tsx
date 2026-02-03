"use client";

import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, TextInput, Textarea, Button, Group, Text, Box } from "@mantine/core";
import { roleSchema, RoleZodType } from "../schema/role.schema";
import { useGetAllPermissions } from "../../permissions/hook/permission.hook";
import PermissionSelector from "./permission-selector";
import { useRoleCreateMutation, useUpdateRole } from "../hook/role.hook";
import { RoleFormProps } from "../type/role.type";

const RoleForm = ({ modal, mode, role }: RoleFormProps) => {
  const { data: permissions, isLoading: permissionsLoading } = useGetAllPermissions({
    pageNumber: 1,
    pageSize: 1000,
  });
  const roleCreateMutation = useRoleCreateMutation();
  const roleUpdateMutation = useUpdateRole();

  const isUpdate = mode === "edit";
  const isLoading = roleCreateMutation.isLoading || roleUpdateMutation.isLoading;

  const form = useForm<RoleZodType>({
    resolver: zodResolver(roleSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  useEffect(() => {
    if (isUpdate && role) {
      form.reset({
        name: role.name || "",
        description: role.description || "",
        permissions: role.permissions?.map((permission) => permission.id) || [],
      });
    } else if (!isUpdate) {
      form.reset({
        name: "",
        description: "",
        permissions: [],
      });
    }
  }, [role, isUpdate, form, modal.isOpen]);

  const handleSubmit = (values: RoleZodType) => {
    if (isUpdate && role) {
      roleUpdateMutation.mutate(
        { data: values, id: role.id },
        {
          onSuccess: () => {
            modal.closeModal();
            form.reset();
          },
        }
      );
    } else {
      roleCreateMutation.mutate(values, {
        onSuccess: () => {
          modal.closeModal();
          form.reset();
        },
      });
    }
  };

  const handleCancel = useCallback(() => {
    modal.closeModal();
    form.reset();
  }, [modal, form]);

  const totalPermissions =
    permissions?.data?.reduce(
      (acc, module) => acc + module.permissions.length,
      0
    ) || 0;

  const selectedCount = form.watch("permissions")?.length || 0;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Rol nomi"
          placeholder="Rol nomini kiriting"
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
          label="Tavsif"
          placeholder="Rol haqida qisqacha tavsif"
          size="sm"
          radius="sm"
          minRows={2}
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

        <Box>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500} c="#495057">
              Ruxsatlar
            </Text>
            <Text size="xs" c="dimmed">
              {selectedCount}/{totalPermissions} tanlangan
            </Text>
          </Group>
          <Box
            p="sm"
            style={{
              border: "1px solid #e9ecef",
              borderRadius: 6,
              backgroundColor: "#f8f9fa",
            }}
          >
            <PermissionSelector
              permissions={permissions}
              selectedPermissions={form.watch("permissions") || []}
              onPermissionChange={(permissionIds) => {
                form.setValue("permissions", permissionIds, { shouldValidate: true });
              }}
              isLoading={permissionsLoading}
            />
          </Box>
          {form.formState.errors.permissions && (
            <Text size="xs" c="red" mt={4}>
              {form.formState.errors.permissions.message}
            </Text>
          )}
        </Box>

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

export default RoleForm;
