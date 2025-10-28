import { useForm } from "react-hook-form";
import { roleSchema, RoleZodType } from "../schema/role.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetAllPermissions } from "../../permissions/hook/permission.hook";
import { Button } from "@/components/ui/button";
import PermissionSelector from "./permission-selector";
import { useRoleCreateMutation, useUpdateRole } from "../hook/role.hook";
import { RoleFormProps } from "../type/role.type";
import { useEffect } from "react";

const RoleForm = ({ modal, mode, role }: RoleFormProps) => {
  const { data: permissions, isLoading } = useGetAllPermissions({
    pageNumber: 1,
    pageSize: 1000,
  });
  const roleCreateMutation = useRoleCreateMutation();
  const roleUpdateMutation = useUpdateRole();

  const form = useForm<RoleZodType>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  useEffect(() => {
    if (mode === "edit" && role) {
      form.reset({
        name: role.name,
        description: role.description,
        permissions: role.permissions.map((permission) => permission.id),
      });
    }
  }, [mode, role]);

  const onSubmitHandler = (values: RoleZodType) => {
    if (mode === "edit" && role) {
      roleUpdateMutation.mutate(
        { data: values, id: role.id },
        {
          onSuccess: () => {
            modal.closeModal();
          },
        },
      );
    } else {
      roleCreateMutation.mutate(values, {
        onSuccess: () => {
          modal.closeModal();
        },
      });
    }
  };

  const totalPermissions =
    permissions?.data?.reduce(
      (acc, module) => acc + module.permissions.length,
      0,
    ) || 0;

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmitHandler)}
        >
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Rol nomi kiriting..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tavsif</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Rol haqida qisqacha tavsif..."
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="permissions"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Ruxsatlar</FormLabel>
                  <div className="text-xs text-muted-foreground">
                    {field.value.length}/{totalPermissions} tanlangan
                  </div>
                </div>
                <FormControl>
                  <div className="border rounded-lg p-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">
                          Yuklanmoqda...
                        </span>
                      </div>
                    ) : (
                      <PermissionSelector
                        permissions={permissions}
                        selectedPermissions={field.value}
                        onPermissionChange={(permissionIds) => {
                          field.onChange(permissionIds);
                        }}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              className="hover:text-text-on-dark"
              type="button"
              variant="destructive"
              onClick={() => {
                form.reset();
                modal.closeModal();
              }}
              size="sm"
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isLoading} size="sm">
              {isLoading ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RoleForm;
