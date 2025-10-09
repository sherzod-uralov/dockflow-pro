import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { documentTemplateScheme } from "../schema/document-template.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ModalState } from "@/types/modal";
import {
  useCreateDocumentTemplate,
  useUpdateDocumentTemplate,
} from "../hook/document-template.hook";
import { useEffect } from "react";
import { DocumentTemplate } from "../type/document-template.type";

type DocumentTemplateFormType = z.infer<typeof documentTemplateScheme>;

interface DocumentTemplateFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  documentTemplate?: DocumentTemplate;
  onSuccess?: () => void;
}

const DocumentTemplateFormModal = ({
  modal,
  mode,
  documentTemplate,
  onSuccess,
}: DocumentTemplateFormModalProps) => {
  const createDocumentTemplateMutation = useCreateDocumentTemplate();
  const updateDocumentTemplateMutation = useUpdateDocumentTemplate();

  const isUpdate = mode === "update";
  const isLoading =
    createDocumentTemplateMutation.isLoading ||
    updateDocumentTemplateMutation.isLoading;

  const form = useForm<DocumentTemplateFormType>({
    resolver: zodResolver(documentTemplateScheme),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (isUpdate && documentTemplate) {
      form.reset({
        name: documentTemplate.name || "",
      });
    } else if (!isUpdate) {
      form.reset({
        name: "",
      });
    }
  }, [documentTemplate, isUpdate, form, modal.isOpen]);

  const handleSubmit = (values: DocumentTemplateFormType) => {
    if (isUpdate && documentTemplate) {
      updateDocumentTemplateMutation.mutate(
        { id: documentTemplate.id || "", data: values },
        {
          onSuccess: () => {
            modal.closeModal();
            form.reset();
            onSuccess?.();
          },
        },
      );
    } else {
      createDocumentTemplateMutation.mutate(values, {
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
              <FormLabel>Template nomi</FormLabel>
              <FormControl>
                <Input
                  placeholder="Template nomini kiriting"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

export default DocumentTemplateFormModal;
