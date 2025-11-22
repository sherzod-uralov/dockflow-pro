"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { ModalState } from "@/types/modal";
import { useGetAllDocuments } from "@/features/document";
import { useGetAllWorkflowTemplates } from "@/features/workflow-template";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { useCreateWorkflowFromTemplate } from "../hook/workflow.hook";

const workflowFromTemplateSchema = z.object({
  documentTypeId: z.string().min(1, "Hujjat turini tanlang"),
  documentId: z.string().min(1, "Hujjatni tanlang"),
  workflowTemplateId: z.string().min(1, "Workflow shablonini tanlang"),
});

type WorkflowFromTemplateFormType = z.infer<typeof workflowFromTemplateSchema>;

interface WorkflowFromTemplateFormProps {
  modal: ModalState;
  onSuccess?: () => void;
}

const WorkflowFromTemplateForm = ({
  modal,
  onSuccess,
}: WorkflowFromTemplateFormProps) => {
  const createMutation = useCreateWorkflowFromTemplate();
  const { data: documentTypesData, isLoading: isLoadingDocumentTypes } =
    useGetAllDocumentTypes();

  const form = useForm<WorkflowFromTemplateFormType>({
    resolver: zodResolver(workflowFromTemplateSchema),
    defaultValues: {
      documentTypeId: "",
      documentId: "",
      workflowTemplateId: "",
    },
  });

  const selectedDocumentTypeId = useWatch({
    control: form.control,
    name: "documentTypeId",
  });

  // Fetch documents filtered by document type
  const { data: documentsData, isLoading: isLoadingDocuments } =
    useGetAllDocuments({
      documentTypeId: selectedDocumentTypeId || undefined,
    });

  // Fetch templates filtered by document type
  const { data: templatesData, isLoading: isLoadingTemplates } =
    useGetAllWorkflowTemplates({
      isActive: true,
      documentTypeId: selectedDocumentTypeId || undefined,
    });

  // Reset dependent fields when document type changes
  useEffect(() => {
    if (selectedDocumentTypeId) {
      form.setValue("documentId", "");
      form.setValue("workflowTemplateId", "");
    }
  }, [selectedDocumentTypeId, form]);

  const handleSubmit = (values: WorkflowFromTemplateFormType) => {
    // Only send documentId and workflowTemplateId to API
    createMutation.mutate(
      {
        documentId: values.documentId,
        workflowTemplateId: values.workflowTemplateId,
      },
      {
        onSuccess: () => {
          modal.closeModal();
          form.reset();
          onSuccess?.();
        },
      },
    );
  };

  const handleCancel = () => {
    modal.closeModal();
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="documentTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hujjat turi</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingDocumentTypes}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Hujjat turini tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentTypesData?.data?.map((type: any) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
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
          name="documentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hujjat</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingDocuments || !selectedDocumentTypeId}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedDocumentTypeId ? "Hujjatni tanlang" : "Avval hujjat turini tanlang"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentsData?.data?.map((doc: any) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title} - {doc.documentNumber}
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
          name="workflowTemplateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workflow shabloni</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingTemplates || !selectedDocumentTypeId}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedDocumentTypeId ? "Shablonni tanlang" : "Avval hujjat turini tanlang"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templatesData?.data?.map((template: any) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {template.steps?.length || 0} ta bosqich
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={createMutation.isLoading}
          >
            Bekor qilish
          </Button>
          <Button type="submit" disabled={createMutation.isLoading}>
            {createMutation.isLoading ? "Yaratilmoqda..." : "Yaratish"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WorkflowFromTemplateForm;
