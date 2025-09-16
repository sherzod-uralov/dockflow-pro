"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CustomModal, useModal } from "@/components/ui/custom-modal";
import { Plus, Save } from "lucide-react";
import { z } from "zod";

// Permission schema
const permissionScheme = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  key: z.string().min(1, "Key is required"),
  module: z.string().min(1, "Module is required"),
});

type Permission = z.infer<typeof permissionScheme>;

interface PermissionCreateModalProps {
  onPermissionCreated?: (permission: Permission) => void;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
}

// Self-contained modal component
export const PermissionCreateModal = ({
  onPermissionCreated,
  buttonText = "Add Permission",
  buttonVariant = "default"
}: PermissionCreateModalProps) => {
  const modal = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Permission>({
    resolver: zodResolver(permissionScheme),
    defaultValues: {
      name: "",
      description: "",
      key: "",
      module: "",
    },
  });

  const onSubmit = async (data: Permission) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Permission created:", data);

      // Call parent callback if provided
      onPermissionCreated?.(data);

      // Reset form and close modal
      form.reset();
      modal.closeModal();

    } catch (error) {
      console.error("Error creating permission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      form.reset();
      modal.closeModal();
    }
  };

  // Auto-generate key from name
  const handleNameChange = (value: string) => {
    const key = value.toLowerCase().replace(/\s+/g, '.');
    form.setValue('key', key);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={modal.openModal}
        variant={buttonVariant}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        {buttonText}
      </Button>

      {/* Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        title="Create New Permission"
        description="Add a new permission to the system"
        size="lg"
        closeOnOverlayClick={!isSubmitting}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleModalClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              form="permission-form"
              type="submit"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Permission
                </>
              )}
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <form
            id="permission-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Create User"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                        disabled={isSubmitting}
                      />
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
                    <FormLabel>Key *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. create.user"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. User Management"
                      {...field}
                      disabled={isSubmitting}
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
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this permission allows..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Preview</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Name:</strong> {form.watch("name") || "Not specified"}</p>
                <p><strong>Key:</strong> {form.watch("key") || "Auto-generated"}</p>
                <p><strong>Module:</strong> {form.watch("module") || "Not specified"}</p>
              </div>
            </div>
          </form>
        </Form>
      </CustomModal>
    </>
  );
};

// Usage example component
export const PermissionManagementExample = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const handlePermissionCreated = (newPermission: Permission) => {
    setPermissions(prev => [...prev, newPermission]);
    // You could also trigger a refetch here
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Permission Management</h2>
          <p className="text-muted-foreground">Manage system permissions</p>
        </div>

        {/* Self-contained modal - just one line! */}
        <PermissionCreateModal
          onPermissionCreated={handlePermissionCreated}
          buttonText="Add New Permission"
        />
      </div>

      {/* Different button styles */}
      <div className="flex gap-2">
        <PermissionCreateModal
          buttonText="Primary Style"
          buttonVariant="default"
        />
        <PermissionCreateModal
          buttonText="Outline Style"
          buttonVariant="outline"
        />
        <PermissionCreateModal
          buttonText="Secondary Style"
          buttonVariant="secondary"
        />
      </div>

      {/* Permissions list */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Created Permissions ({permissions.length})</h3>
        {permissions.length === 0 ? (
          <p className="text-muted-foreground">No permissions created yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {permissions.map((permission, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium">{permission.name}</h4>
                <p className="text-sm text-muted-foreground">{permission.description}</p>
                <div className="mt-2 flex gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {permission.key}
                  </span>
                  <span className="text-xs bg-secondary/50 px-2 py-1 rounded">
                    {permission.module}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
