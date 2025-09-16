import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { permissionScheme } from "../scheme/permission.scheme";
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
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ModalState } from "@/types/modal";
import {
  useCreatePermission,
  useUpdatePermission,
} from "../hook/permission.hook";
import { useEffect } from "react";
import { Permission } from "../type/permission.type";

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
        },
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

  const handleCancel = () => {
    modal.closeModal();
    form.reset();
  };

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ruxsat nomi</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ruxsat nomi"
                  disabled={isLoading}
                  {...field}
                />
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
              <FormLabel>Ruxsat tavsifi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ruxsat tavsifi"
                  disabled={isLoading}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-start gap-4">
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Ruxsat kalit so'zi</FormLabel>
                <FormControl>
                  <Input
                    placeholder="permission.read"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="module"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Ruxsat modul nomi</FormLabel>
                <FormControl>
                  <Input placeholder="users" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            className="hover:text-text-on-dark"
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Bekor qilish
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isUpdate
                ? "Yangilanmoqda..."
                : "Qo'shilmoqda..."
              : isUpdate
                ? "Yangilash"
                : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PermissionFormModal;
