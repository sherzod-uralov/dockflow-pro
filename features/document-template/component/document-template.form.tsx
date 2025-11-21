"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalState } from "@/types/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/shared/ui/custom-file-upload";
import { useGetAllDocumentTypes } from "@/features/document-type";
import { useCreateAttachment } from "@/features/attachment/hook/attachment.hook";
import { toast } from "sonner";
import {
  DocumentTemplateResponse,
  useCreateDocumentTemplate,
  useUpdateDocumentTemplate,
  RequiredTags,
} from "@/features/document-template";
import {
  DocumentTemplateFormType,
  documentTemplateSchema,
} from "@/features/document-template/schema/document-template.schema";
import { parseWordFile, ExtractedTags } from "../utils/word-parser";
import { Loader2, Tag, X, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentTemplateFormModalProps {
  modal: ModalState;
  mode: "create" | "update";
  documentTemplate?: DocumentTemplateResponse;
  onSuccess?: () => void;
}

const DocumentTemplateFormModal = ({
  modal,
  mode,
  documentTemplate,
  onSuccess,
}: DocumentTemplateFormModalProps) => {
  const createMutation = useCreateDocumentTemplate();
  const updateMutation = useUpdateDocumentTemplate();
  const { data: documentTypes } = useGetAllDocumentTypes();
  const { mutateAsync: uploadFile, isLoading: isUploading } = useCreateAttachment();

  const [existingFiles, setExistingFiles] = useState(
    documentTemplate?.templateFile ? [documentTemplate.templateFile] : []
  );
  const [extractedTags, setExtractedTags] = useState<ExtractedTags>(
    documentTemplate?.requiredTags || {}
  );
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const isUpdate = mode === "update";

  const form = useForm<DocumentTemplateFormType>({
    resolver: zodResolver(documentTemplateSchema),
    defaultValues: isUpdate
      ? {
          name: documentTemplate?.name ?? "",
          description: documentTemplate?.description ?? "",
          documentTypeId: documentTemplate?.documentType?.id ?? "",
          isActive: documentTemplate?.isActive ?? true,
          isPublic: documentTemplate?.isPublic ?? false,
          templateFileId: documentTemplate?.templateFile?.id ?? "",
          requiredTags: documentTemplate?.requiredTags ?? {},
        }
      : {
          name: "",
          description: "",
          documentTypeId: "",
          isActive: true,
          isPublic: false,
          templateFileId: "",
          requiredTags: {},
        },
    mode: "onChange",
  });

  const handleDeleteFile = () => {
    setExistingFiles([]);
    form.setValue("templateFileId", "", { shouldValidate: true });
    setExtractedTags({});
    form.setValue("requiredTags", {}, { shouldValidate: true });
    toast.success("Fayl o'chirildi");
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      setIsParsingFile(true);
      setParseError(null);

      try {
        // First, parse the Word file to extract tags
        const tags = await parseWordFile(file);
        setExtractedTags(tags);
        form.setValue("requiredTags", tags, { shouldValidate: true });

        if (Object.keys(tags).length > 0) {
          toast.success(`${Object.keys(tags).length} ta tag topildi`);
        } else {
          toast.info("Faylda tag topilmadi. {tagName} formatida yozing.");
        }

        // Then upload the file
        const response = await uploadFile(file);
        form.setValue("templateFileId", response.id, { shouldValidate: true });
        setExistingFiles([]);
      } catch (error: any) {
        setParseError(error.message || "Faylni o'qishda xatolik yuz berdi");
        toast.error(error.message || "Faylni o'qishda xatolik yuz berdi");
      } finally {
        setIsParsingFile(false);
      }
    },
    [form, uploadFile]
  );

  const handleRemoveTag = (tagName: string) => {
    const newTags = { ...extractedTags };
    delete newTags[tagName];
    setExtractedTags(newTags);
    form.setValue("requiredTags", newTags, { shouldValidate: true });
  };

  const handleSubmit = (values: DocumentTemplateFormType) => {
    const data = {
      ...values,
      templateFileId:
        existingFiles.length > 0 ? existingFiles[0].id : values.templateFileId,
      requiredTags: extractedTags,
    };

    if (isUpdate && documentTemplate) {
      updateMutation.mutate(
        { id: documentTemplate.id, data },
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

  const tagCount = Object.keys(extractedTags).length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
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

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Tavsif</FormLabel>
                <FormControl>
                  <Textarea placeholder="Shablon tavsifini kiriting" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Document Type */}
          <FormField
            control={form.control}
            name="documentTypeId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Hujjat turi</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Hujjat turini tanlang" />
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

          {/* Checkboxes */}
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

          {/* File Upload */}
          <FormField
            control={form.control}
            name="templateFileId"
            render={() => (
              <FormItem className="col-span-2">
                <FormLabel>Shablon fayli (Word)</FormLabel>
                <FormControl>
                  <FileUpload
                    name="templateFileId"
                    multiple={false}
                    accept={{
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        [".docx"],
                      "application/msword": [".doc"],
                    }}
                    helperText="Faqat DOCX formatdagi fayllar. Taglar uchun {tagName} formatidan foydalaning."
                    maxSize={50 * 1024 * 1024}
                    existingFiles={existingFiles.map((f) => ({
                      id: f.id,
                      fileName: f.fileName,
                      fileSize: f.fileSize,
                      fileUrl: f.fileUrl,
                    }))}
                    onDeleteExisting={handleDeleteFile}
                    onChange={async (files) => {
                      if (!files) return;
                      const file = Array.isArray(files) ? files[0] : files;
                      if (file) {
                        await handleFileUpload(file);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Parsing indicator */}
        {isParsingFile && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Fayl tahlil qilinmoqda...</span>
          </div>
        )}

        {/* Parse error */}
        {parseError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        {/* Extracted Tags Display */}
        {tagCount > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" />
                Topilgan taglar ({tagCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Quyidagi taglar Word fayldan topildi. Ular hujjat yaratishda
                  avtomatik to'ldiriladi.
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(extractedTags).map(([tagName, tagType]) => (
                    <Badge
                      key={tagName}
                      variant="secondary"
                      className="flex items-center gap-2 py-1.5 px-3"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="font-mono">{`{${tagName}}`}</span>
                      <span className="text-xs text-muted-foreground">
                        ({tagType})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tagName)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No tags info when file is uploaded but no tags found */}
        {!isParsingFile &&
          form.getValues("templateFileId") &&
          tagCount === 0 &&
          existingFiles.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Faylda tag topilmadi. Taglarni {`{tagName}`} formatida yozing,
                masalan: {`{employeeName}`}, {`{salary}`}
              </AlertDescription>
            </Alert>
          )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => modal.closeModal()}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting ||
              isUploading ||
              isParsingFile ||
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

export default DocumentTemplateFormModal;
