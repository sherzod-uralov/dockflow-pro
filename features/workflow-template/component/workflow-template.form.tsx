"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Info, Trash2, Search } from "lucide-react";
import {
  workflowTemplateSchema,
  WorkflowTemplateFormType,
} from "../schema/workflow-template.schema";
import {
  WorkflowTemplateResponse,
  WorkflowTemplateType,
  WorkflowTemplateActionType,
  WORKFLOW_TEMPLATE_TYPE_OPTIONS,
  ACTION_TYPE_OPTIONS,
} from "../type/workflow-template.type";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ModalState } from "@/types/modal";
import {
  useCreateWorkflowTemplate,
  useUpdateWorkflowTemplate,
} from "../hook/workflow-template.hook";

interface WorkflowTemplateFormProps {
  modal: ModalState;
  mode: "create" | "update";
  workflowTemplate?: WorkflowTemplateResponse;
  onSuccess?: () => void;
}

const createEmptyStep = (order: number = 0) => ({
  order,
  actionType: WorkflowTemplateActionType.APPROVAL as
    | "APPROVAL"
    | "REVIEW"
    | "SIGN"
    | "QR_CODE"
    | "ACKNOWLEDGE",
  assignedToUserId: "",
});

const WorkflowTemplateForm = ({
  modal,
  mode,
  workflowTemplate,
  onSuccess,
}: WorkflowTemplateFormProps) => {
  const createMutation = useCreateWorkflowTemplate();
  const updateMutation = useUpdateWorkflowTemplate();
  const { data: usersData, isLoading: isLoadingUsers } = useGetUserQuery();
  const { data: documentTypes } = useGetAllDocumentTypes();

  const [searchQueries, setSearchQueries] = useState<{ [key: number]: string }>(
    {},
  );

  const isUpdate = mode === "update";
  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  const form = useForm<WorkflowTemplateFormType>({
    resolver: zodResolver(workflowTemplateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      documentTypeId: "",
      type: WorkflowTemplateType.CONSECUTIVE as "CONSECUTIVE" | "PARALLEL",
      isActive: true,
      isPublic: true,
      steps: [createEmptyStep(0)],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  useEffect(() => {
    if (isUpdate && workflowTemplate) {
      form.reset({
        name: workflowTemplate.name,
        description: workflowTemplate.description,
        documentTypeId: workflowTemplate.documentType?.id || "",
        type: workflowTemplate.type as "CONSECUTIVE" | "PARALLEL",
        isActive: workflowTemplate.isActive,
        isPublic: workflowTemplate.isPublic,
        steps:
          workflowTemplate.steps?.map((step, index) => ({
            order: step.order ?? index,
            actionType: step.actionType as
              | "APPROVAL"
              | "REVIEW"
              | "SIGN"
              | "QR_CODE"
              | "ACKNOWLEDGE",
            assignedToUserId: step.assignedToUser?.id || "",
          })) || [createEmptyStep(0)],
      });
    } else if (!isUpdate) {
      form.reset({
        name: "",
        description: "",
        documentTypeId: "",
        type: WorkflowTemplateType.CONSECUTIVE as "CONSECUTIVE" | "PARALLEL",
        isActive: true,
        isPublic: true,
        steps: [createEmptyStep(0)],
      });
    }
  }, [workflowTemplate, isUpdate, form, modal.isOpen]);

  const handleSubmit = (values: WorkflowTemplateFormType) => {
    const steps = values.steps.map((step, index) => ({
      order: index,
      actionType: step.actionType as WorkflowTemplateActionType,
      assignedToUserId: step.assignedToUserId || undefined,
    }));

    if (isUpdate && workflowTemplate) {
      updateMutation.mutate(
        {
          id: workflowTemplate.id,
          data: {
            name: values.name,
            description: values.description,
            documentTypeId: values.documentTypeId,
            type: values.type as WorkflowTemplateType,
            isActive: values.isActive,
            isPublic: values.isPublic,
            steps,
          },
        },
        {
          onSuccess: () => {
            modal.closeModal();
            form.reset();
            onSuccess?.();
          },
        },
      );
    } else {
      createMutation.mutate(
        {
          name: values.name,
          description: values.description,
          documentTypeId: values.documentTypeId,
          type: values.type as WorkflowTemplateType,
          isActive: values.isActive,
          isPublic: values.isPublic,
          steps,
        },
        {
          onSuccess: () => {
            modal.closeModal();
            form.reset();
            onSuccess?.();
          },
        },
      );
    }
  };

  const handleAddStep = () => {
    append(createEmptyStep(fields.length));
  };

  const handleCancel = () => {
    modal.closeModal();
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Shablon nomi</FormLabel>
                <FormControl>
                  <Input placeholder="Shablon nomini kiriting" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Tavsif</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Shablon tavsifini kiriting"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hujjat turi</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Hujjat turini tanlang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {documentTypes?.data?.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workflow turi</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Workflow turini tanlang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {WORKFLOW_TEMPLATE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Faol</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Ommaviy</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Workflow bosqichlari ketma-ket yoki parallel bajariladi. Har bir
            bosqich uchun mas'ul shaxs, rol yoki bo'limni belgilang.
          </AlertDescription>
        </Alert>

        {/* Workflow Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Workflow bosqichlari</h3>
              <p className="text-sm text-muted-foreground">
                Har bir bosqich uchun mas'ulni tanlang
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleAddStep}
              disabled={fields.length >= 20}
            >
              <Plus className="h-4 w-4 mr-2" />
              Bosqich qo'shish
            </Button>
          </div>

          {form.formState.errors.steps?.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.steps.root.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Bosqich {index + 1}
                    </CardTitle>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {/* Assigned To User */}
                  <FormField
                    control={form.control}
                    name={`steps.${index}.assignedToUserId`}
                    render={({ field: formField }) => {
                      const searchQuery = searchQueries[index] || "";
                      const filteredUsers =
                        usersData?.data?.filter((user: any) => {
                          const query = searchQuery.toLowerCase();
                          return (
                            user.fullname?.toLowerCase().includes(query) ||
                            user.username?.toLowerCase().includes(query)
                          );
                        }) || [];

                      return (
                        <FormItem className="w-full">
                          <FormLabel>Foydalanuvchi</FormLabel>
                          <Select
                            onValueChange={formField.onChange}
                            value={formField.value || undefined}
                            disabled={isLoadingUsers}
                            onOpenChange={(open) => {
                              if (!open) {
                                setSearchQueries((prev) => ({
                                  ...prev,
                                  [index]: "",
                                }));
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Foydalanuvchini tanlang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="p-0">
                              <div className="sticky top-0 z-10 bg-background border-b">
                                <div className="flex items-center gap-2 px-2 py-2">
                                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <Input
                                    placeholder="Qidirish..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                      setSearchQueries((prev) => ({
                                        ...prev,
                                        [index]: e.target.value,
                                      }));
                                    }}
                                    className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              <div className="max-h-[200px] overflow-y-auto p-1">
                                {filteredUsers.length > 0 ? (
                                  filteredUsers.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.fullname} (@{user.username})
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-6 text-sm text-center text-muted-foreground">
                                    Foydalanuvchi topilmadi
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Action Type */}
                  <FormField
                    control={form.control}
                    name={`steps.${index}.actionType`}
                    render={({ field: formField }) => (
                      <FormItem className="w-full">
                        <FormLabel>Amal turi</FormLabel>
                        <Select
                          onValueChange={formField.onChange}
                          value={formField.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Amal turini tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ACTION_TYPE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </Card>
            ))}
          </div>

          {fields.length === 0 && (
            <Alert>
              <AlertDescription>
                Kamida bitta bosqich qo'shishingiz kerak
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
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
                : "Yaratilmoqda..."
              : isUpdate
                ? "Yangilash"
                : "Yaratish"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WorkflowTemplateForm;
