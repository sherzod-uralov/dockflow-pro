import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { documentScheme } from "../schema/document.schema";
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
import { useCreateDocument, useUpdateDocument } from "../hook/document.hook";
import { useEffect } from "react";
import { Document } from "../type/document.type";
import { useGetAllDeportaments } from "@/features/deportament";

type DocumentFormType = z.infer<typeof documentScheme>;

interface DocumentFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  document?: Document;
  onSuccess?: () => void;
}

const DocumentFormModal = ({
  modal,
  mode,
  document,
  onSuccess,
}: DocumentFormModalProps) => {
  const createDocumentMutation = useCreateDocument();
  const updateDocumentMutation = useUpdateDocument();
  const { data } = useGetAllDeportaments();

  const isUpdate = mode === "update";
  const isLoading =
    createDocumentMutation.isLoading || updateDocumentMutation.isLoading;

  const form = useForm<DocumentFormType>({
    resolver: zodResolver(documentScheme),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (isUpdate && document) {
      form.reset({
        name: document.name || "",
      });
    } else if (!isUpdate) {
      form.reset({
        name: "",
      });
    }
  }, [document, isUpdate, form, modal.isOpen]);

  const handleSubmit = (values: DocumentFormType) => {
    if (isUpdate && document) {
      updateDocumentMutation.mutate(
        { id: document.id || "", data: values },
        {
          onSuccess: () => {
            modal.closeModal();
            form.reset();
            onSuccess?.();
          },
        },
      );
    } else {
      createDocumentMutation.mutate(values, {
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
              <FormLabel>Document nomi</FormLabel>
              <FormControl>
                <Input
                  placeholder="Document nomini kiriting"
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

export default DocumentFormModal;
