import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { documentTypeScheme } from "../schema/document-type.schema";
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
  useCreateDocumentType,
  useUpdateDocumentType,
} from "../hook/document-type.hook";
import { useEffect } from "react";
import { DocumentType } from "../type/document-type.type";

type DocumentTypeFormType = z.infer<typeof documentTypeScheme>;

interface DocumentTypeFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  documentType?: DocumentType;
  onSuccess?: () => void;
}

const DocumentTypeFormModal = ({
  modal,
  mode,
  documentType,
  onSuccess,
}: DocumentTypeFormModalProps) => {
  const createDocumentTypeMutation = useCreateDocumentType();
  const updateDocumentTypeMutation = useUpdateDocumentType();

  const isUpdate = mode === "update";
  const isLoading =
    createDocumentTypeMutation.isLoading ||
    updateDocumentTypeMutation.isLoading;

  const form = useForm<DocumentTypeFormType>({
    resolver: zodResolver(documentTypeScheme),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (isUpdate && documentType) {
      form.reset({
        name: documentType.name || "",
      });
    } else if (!isUpdate) {
      form.reset({
        name: "",
      });
    }
  }, [documentType, isUpdate, form, modal.isOpen]);

  const handleSubmit = (values: DocumentTypeFormType) => {
    if (isUpdate && documentType) {
      updateDocumentTypeMutation.mutate(
        { id: documentType.id || "", data: values },
        {
          onSuccess: () => {
            modal.closeModal();
            form.reset();
            onSuccess?.();
          },
        },
      );
    } else {
      createDocumentTypeMutation.mutate(values, {
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
              <FormLabel>DocumentType nomi</FormLabel>
              <FormControl>
                <Input
                  placeholder="DocumentType nomini kiriting"
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

export default DocumentTypeFormModal;
