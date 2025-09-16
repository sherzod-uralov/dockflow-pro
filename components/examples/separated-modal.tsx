"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CustomModal } from "@/components/ui/custom-modal";
import { Plus, Save, Edit, Trash2 } from "lucide-react";
import { z } from "zod";

// Permission schema
const permissionScheme = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  key: z.string().min(1, "Key is required"),
  module: z.string().min(1, "Module is required"),
});

type Permission = z.infer<typeof permissionScheme>;

// Separated Form Component - can be reused anywhere
interface PermissionFormProps {
  onSubmit: (data: Permission) => void;
  onCancel?: () => void;
  defaultValues?: Partial<Permission>;
  isSubmitting?: boolean;
  submitText?: string;
  showCancelButton?: boolean;
}

export const PermissionForm = ({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
  submitText = "Create Permission",
  showCancelButton = true
}: PermissionFormProps) => {
  const form = useForm<Permission>({
    resolver: zodResolver(permissionScheme),
    defaultValues: {
      name: "",
      description: "",
      key: "",
      module: "",
      ...defaultValues,
    },
  });

  // Auto-generate key from name
  const handleNameChange = (value: string) => {
    if (!defaultValues?.key) { // Only auto-generate if not editing
      const key = value.toLowerCase().replace(/\s+/g, '.');
      form.setValue('key', key);
    }
  };

  const handleSubmit = (data: Permission) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        id="permission-form"
        onSubmit={form.handleSubmit(handleSubmit)}
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

        {/* Form buttons - only show if not using modal footer */}
        <div className="flex justify-end gap-2">
          {showCancelButton && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {submitText.includes("Create") ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {submitText}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Separated Modal Management Component
interface PermissionModalManagerProps {
  children: React.ReactNode;
}

export const PermissionModalManager = ({ children }: PermissionModalManagerProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Create permission handler
  const handleCreatePermission = async (data: Permission) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Permission created:", data);
      setPermissions(prev => [...prev, data]);
      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating permission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit permission handler
  const handleEditPermission = async (data: Permission) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Permission updated:", data);
      setPermissions(prev =>
        prev.map(p => p.key === editingPermission?.key ? data : p)
      );
      setEditModalOpen(false);
      setEditingPermission(null);
    } catch (error) {
      console.error("Error updating permission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (permission: Permission) => {
    setEditingPermission(permission);
    setEditModalOpen(true);
  };

  // Close modals
  const closeCreateModal = () => {
    if (!isSubmitting) {
      setCreateModalOpen(false);
    }
  };

  const closeEditModal = () => {
    if (!isSubmitting) {
      setEditModalOpen(false);
      setEditingPermission(null);
    }
  };

  // Delete permission
  const deletePermission = (key: string) => {
    setPermissions(prev => prev.filter(p => p.key !== key));
  };

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Permission Management (Separated)</h2>
          <p className="text-muted-foreground">
            Manage system permissions with separated components
          </p>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Permission
        </Button>
      </div>

      {/* Permissions list */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          Created Permissions ({permissions.length})
        </h3>
        {permissions.length === 0 ? (
          <p className="text-muted-foreground">No permissions created yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {permissions.map((permission, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{permission.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {permission.description}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {permission.key}
                      </span>
                      <span className="text-xs bg-secondary/50 px-2 py-1 rounded">
                        {permission.module}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditModal(permission)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deletePermission(permission.key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CustomModal
        isOpen={createModalOpen}
        onClose={closeCreateModal}
        title="Create New Permission"
        description="Add a new permission to the system"
        size="lg"
        closeOnOverlayClick={!isSubmitting}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeCreateModal}
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
        <PermissionForm
          onSubmit={handleCreatePermission}
          isSubmitting={isSubmitting}
          showCancelButton={false}
        />
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        title="Edit Permission"
        description="Update the permission details"
        size="lg"
        closeOnOverlayClick={!isSubmitting}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeEditModal}
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        }
      >
        {editingPermission && (
          <PermissionForm
            onSubmit={handleEditPermission}
            defaultValues={editingPermission}
            isSubmitting={isSubmitting}
            submitText="Save Changes"
            showCancelButton={false}
          />
        )}
      </CustomModal>

      {/* Custom children */}
      {children}
    </div>
  );
};

// Usage example - standalone form (no modal)
export const StandalonePermissionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Permission) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Standalone form submitted:", data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Standalone Permission Form</h2>
        <p className="text-muted-foreground">
          Same form component, but used without modal
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <PermissionForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitText="Create Permission"
        />
      </div>
    </div>
  );
};

// Main example component
export default function SeparatedModalExample() {
  return (
    <div className="container mx-auto p-6">
      <PermissionModalManager>
        <div className="mt-8 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2">Benefits of Separated Approach:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Form component can be reused in different contexts</li>
            <li>• Modal state is controlled by parent component</li>
            <li>• Easier to test form and modal logic separately</li>
            <li>• Better separation of concerns</li>
            <li>• More flexible and customizable</li>
          </ul>
        </div>
      </PermissionModalManager>
    </div>
  );
}
