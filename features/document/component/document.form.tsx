"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalState } from "@/types/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/shared/ui/custom-file-upload";
import {
  DocumentFormType,
  documentScheme,
} from "@/features/document/schema/document.schema";
import {
  DocumentGetResponse,
  useCreateDocument,
  useUpdateDocument,
} from "@/features/document";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { useGetAllJournals } from "@/features/journal/hook/journal.hook";
import {
  useGetAllDocumentTemplates,
  useGetDocumentTemplateById,
  RequiredTags,
} from "@/features/document-template";
import { useCreateAttachment } from "@/features/attachment/hook/attachment.hook";
import { toast } from "sonner";
import { Tag, Loader2 } from "lucide-react";

interface DocumentFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  document?: DocumentGetResponse;
  onSuccess?: () => void;
}

const DocumentFormModal = ({
  modal,
  mode,
  document,
  onSuccess,
}: DocumentFormModalProps) => {
  const createMutation = useCreateDocument();
  const updateMutation = useUpdateDocument();
  const { data: documentTypes } = useGetAllDocumentTypes();
  const { data: journals } = useGetAllJournals({
    pageNumber: 1,
    pageSize: 1000,
  });
  const { data: templates, isLoading: isLoadingTemplates } = useGetAllDocumentTemplates();

  const { mutateAsync: uploadFile, isLoading: isUploading } = useCreateAttachment();

  const [existingFiles, setExistingFiles] = useState(
    document?.attachments || []
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    document?.template?.id || ""
  );
  const [tagValues, setTagValues] = useState<Record<string, string>>(
    document?.tags || {}
  );

  const { data: selectedTemplate, isLoading: isLoadingTemplate } =
    useGetDocumentTemplateById(selectedTemplateId);

  const isUpdate = mode === "update";

  const form = useForm<DocumentFormType>({
    resolver: zodResolver(documentScheme),
    defaultValues: isUpdate
      ? {
          title: document?.title ?? "",
          description: document?.description ?? "",
          documentNumber: document?.documentNumber ?? "",
          priority: document?.priority ?? "LOW",
          status: document?.status ?? "DRAFT",
          documentTypeId: document?.documentType?.id ?? "",
          journalId: document?.journal?.id ?? "",
          templateId: document?.template?.id ?? "",
          tags: document?.tags ?? {},
          attachments: document?.attachments?.map((a) => a.id) ?? [],
        }
      : {
          title: "",
          description: "",
          documentNumber: "",
          priority: "LOW",
          status: "DRAFT",
          documentTypeId: "",
          journalId: "",
          templateId: "",
          tags: {},
          attachments: [],
        },
    mode: "onChange",
  });

  // Initialize tag values when template is selected or changed
  useEffect(() => {
    if (selectedTemplate?.requiredTags) {
      const requiredTags = selectedTemplate.requiredTags as RequiredTags;
      const initialTags: Record<string, string> = {};

      Object.keys(requiredTags).forEach((tagName) => {
        // Preserve existing values or use empty string
        initialTags[tagName] = tagValues[tagName] || "";
      });

      setTagValues(initialTags);
      form.setValue("tags", initialTags);
    }
  }, [selectedTemplate]);

  const handleDeleteFile = (fileId: string) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    const current = form.getValues("attachments") || [];
    form.setValue(
      "attachments",
      current.filter((id: string) => id !== fileId),
      { shouldValidate: true }
    );
    toast.success("Fayl o'chirildi");
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    try {
      const response = await uploadFile(file);
      const current = form.getValues("attachments") || [];
      form.setValue("attachments", [...current, response.id], {
        shouldValidate: true,
      });
    } catch (error: any) {
      toast.error(error.message || "Fayl yuklashda xatolik");
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    form.setValue("templateId", templateId, { shouldValidate: true });

    // Reset tag values when template changes
    if (!templateId) {
      setTagValues({});
      form.setValue("tags", {});
    }
  };

  const handleTagChange = (tagName: string, value: string) => {
    const newTags = { ...tagValues, [tagName]: value };
    setTagValues(newTags);
    form.setValue("tags", newTags, { shouldValidate: true });
  };

  const handleSubmit = (values: DocumentFormType) => {
    const data = {
      ...values,
      templateId: selectedTemplateId || undefined,
      tags: Object.keys(tagValues).length > 0 ? tagValues : undefined,
      attachments: values.attachments || [],
    };

    if (isUpdate && document) {
      updateMutation.mutate(
        { id: document.id || "", data },
        {
          onSuccess: () => {
            modal.closeModal();
            onSuccess?.();
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          modal.closeModal();
          onSuccess?.();
        },
      });
    }
  };

  const requiredTags = selectedTemplate?.requiredTags as RequiredTags | undefined;
  const hasRequiredTags = requiredTags && Object.keys(requiredTags).length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Hujjat nomi</FormLabel>
                <FormControl>
                  <Input placeholder="Hujjat nomini kiriting" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Hujjat tavsifi</FormLabel>
                <FormControl>
                  <Textarea placeholder="Hujjat tavsifini kiriting" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Document Number */}
          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hujjat raqami</FormLabel>
                <FormControl>
                  <Input placeholder="DOC-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Priority */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Muhimlik darajasi</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LOW">Past</SelectItem>
                    <SelectItem value="MEDIUM">O'rta</SelectItem>
                    <SelectItem value="HIGH">Yuqori</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Holati</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">Qoralama</SelectItem>
                    <SelectItem value="PUBLISHED">E'lon qilingan</SelectItem>
                    <SelectItem value="ARCHIVED">Arxivlangan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Document Type */}
          <FormField
            control={form.control}
            name="documentTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hujjat turi</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {documentTypes?.data?.map((t) => (
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

          {/* Journal */}
          <FormField
            control={form.control}
            name="journalId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Jurnal</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {journals?.data?.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Template Selection */}
          <FormField
            control={form.control}
            name="templateId"
            render={() => (
              <FormItem className="col-span-2">
                <FormLabel>Shablon</FormLabel>
                <Select
                  value={selectedTemplateId || "none"}
                  onValueChange={(value) => handleTemplateChange(value === "none" ? "" : value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingTemplates ? "Yuklanmoqda..." : "Shablon tanlang (ixtiyoriy)"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Shablonsiz</SelectItem>
                    {templates?.data && templates.data.length > 0 ? (
                      templates.data.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))
                    ) : !isLoadingTemplates ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Shablonlar topilmadi
                      </div>
                    ) : null}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dynamic Tag Fields */}
        {isLoadingTemplate && selectedTemplateId && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Shablon yuklanmoqda...</span>
          </div>
        )}

        {hasRequiredTags && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" />
                Shablon maydonlari
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(requiredTags).map(([tagName, tagType]) => (
                  <FormItem key={tagName}>
                    <FormLabel className="capitalize">
                      {tagName.replace(/([A-Z])/g, " $1").trim()}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`${tagName} kiriting`}
                        value={tagValues[tagName] || ""}
                        onChange={(e) => handleTagChange(tagName, e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Upload */}
        <FormField
          control={form.control}
          name="attachments"
          render={() => (
            <FormItem>
              <FormLabel>Fayllar</FormLabel>
              <FormControl>
                <FileUpload
                  name="attachments"
                  multiple={true}
                  existingFiles={existingFiles.map((f) => ({
                    ...f,
                    fileSize: f.fileSize || 0,
                  }))}
                  onDeleteExisting={handleDeleteFile}
                  onChange={async (files) => {
                    if (!files) return;
                    if (Array.isArray(files)) {
                      for (const file of files) {
                        await handleFileUpload(file);
                      }
                    } else {
                      await handleFileUpload(files);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={modal.closeModal}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting ||
              isUploading ||
              createMutation.isLoading ||
              updateMutation.isLoading
            }
          >
            {form.formState.isSubmitting ||
            createMutation.isLoading ||
            updateMutation.isLoading
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
