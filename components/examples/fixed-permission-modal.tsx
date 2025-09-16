"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { permissionScheme } from "../scheme/permission.scheme";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Permission } from "../type/permission.type";
import { CustomModal, useModal } from "@/components/ui/custom-modal";

export const PermissionCreateModal = () => {
  const modal = useModal();

  const form = useForm<Permission>({
    resolver: zodResolver(permissionScheme),
    defaultValues: {
      name: "",
      description: "",
      key: "",
      module: "",
    },
  });

  // Form submit handler - bu yerda type error hal qilingan
  const onSubmit = (data: Permission) => {
    console.log("Permission data:", data);
    // Bu yerda API call qilish mumkin
    // await createPermission(data);

    // Formni reset qilish
    form.reset();

    // Modalni yopish
    modal.closeModal();
  };

  const handleModalClose = () => {
    form.reset(); // Modal yopilganda formni reset qilish
    modal.closeModal();
  };

  return (
    <>
      <Button onClick={modal.openModal}>
        Add Permission
      </Button>

      <CustomModal
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        title="Create New Permission"
        description="Add a new permission to the system"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              form="permission-form"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating..." : "Create Permission"}
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <form
            id="permission-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Permission name" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Permission description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input placeholder="permission.key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module</FormLabel>
                  <FormControl>
                    <Input placeholder="Module name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CustomModal>
    </>
  );
};
