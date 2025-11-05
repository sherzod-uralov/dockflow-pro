"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodTypeAny } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileUpload } from "@/components/shared/ui/custom-file-upload";
import { useCreateAttachment } from "@/features/attachment/hook/attachment.hook";
import { Accept } from "react-dropzone";

export type FieldOption = { label: string; value: string | number };
export type Field = {
  name: string;
  label?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "file"
    | "tel"
    | "url";
  placeholder?: string;
  options?: FieldOption[];
  colSpan?: number;
  fileReturnShape?: "id" | "object" | "array:id" | "array:object";
  multiple?: boolean;
  fileUrlTarget?: string;
  accept?: Accept;
  maxFiles?: number;
  maxSize?: number;
  helperText?: string;
  existingFiles?: Array<{
    id: string;
    fileName: string;
    fileSize?: number;
    fileUrl: string;
  }>;
  onDeleteExisting?: (fileId: string) => void;
};

interface Props {
  schema: ZodTypeAny;
  fields: Field[];
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => void | Promise<void>;
  submitLabel?: string;
  className?: string;
  renderActions?: (formState: {
    isSubmitting: boolean;
    isValid: boolean;
  }) => React.ReactNode;
  onFormReady?: (form: any) => void;
  children?: React.ReactNode;
}

export default function SimpleFormGenerator({
  schema,
  fields,
  defaultValues = {},
  onSubmit,
  submitLabel = "Saqlash",
  className = "",
  renderActions,
  onFormReady,
  children,
}: Props) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  React.useEffect(() => {
    onFormReady?.(form);
  }, [form, onFormReady]);

  const { mutateAsync: uploadFile, isLoading: isUploading } =
    useCreateAttachment();

  const handleFileUpload = async (
    file: File | undefined,
    fieldName: string,
    fileReturnShape: Field["fileReturnShape"] = "array:id",
    multiple: boolean = true,
    fileUrlTarget?: string,
  ) => {
    if (!file) return;

    try {
      const response = await uploadFile(file);
      const shape = fileReturnShape ?? "array:id";
      const prev = form.getValues(fieldName);

      const pickValue = (() => {
        switch (shape) {
          case "id":
          case "array:id":
            return response.id;
          case "object":
          case "array:object":
            return response;
          default:
            return response.id;
        }
      })();

      const shouldBeArray = shape.startsWith("array:");
      const nextValue = shouldBeArray
        ? [...(Array.isArray(prev) ? prev : []), pickValue]
        : pickValue;

      form.setValue(fieldName, nextValue, { shouldValidate: true });

      if (fileUrlTarget) {
        const prevUrls = form.getValues(fileUrlTarget);
        const urlValue = response.fileUrl;

        if (multiple) {
          const urls = Array.isArray(prevUrls)
            ? prevUrls
            : prevUrls
              ? [prevUrls]
              : [];
          form.setValue(fileUrlTarget, [...urls, urlValue], {
            shouldValidate: true,
          });
        } else {
          form.setValue(fileUrlTarget, urlValue, { shouldValidate: true });
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className + " grid grid-cols-2 gap-4"}
      >
        {fields.map((f) => (
          <div
            key={f.name}
            className={f.colSpan ? `col-span-${f.colSpan}` : "col-span-1"}
          >
            <FormField
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem>
                  {f.label && <FormLabel>{f.label}</FormLabel>}
                  <FormControl>
                    {(() => {
                      switch (f.type) {
                        case "textarea":
                          return (
                            <Textarea placeholder={f.placeholder} {...field} />
                          );

                        case "select":
                          return (
                            <Select
                              value={field.value ?? ""}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={f.placeholder ?? "Tanlang"}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {f.options?.map((opt) => (
                                  <SelectItem
                                    key={String(opt.value)}
                                    value={String(opt.value)}
                                  >
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          );

                        case "checkbox":
                          return (
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          );

                        case "radio":
                          return (
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              {f.options?.map((opt) => (
                                <div
                                  key={String(opt.value)}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={String(opt.value)}
                                    id={`${f.name}-${opt.value}`}
                                  />
                                  <FormLabel htmlFor={`${f.name}-${opt.value}`}>
                                    {opt.label}
                                  </FormLabel>
                                </div>
                              ))}
                            </RadioGroup>
                          );

                        case "number":
                          return (
                            <Input
                              type="number"
                              placeholder={f.placeholder}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                )
                              }
                            />
                          );

                        case "file":
                          return (
                            <FileUpload
                              name={f.name}
                              label={f.label}
                              multiple={!!f.multiple}
                              maxFiles={f.maxFiles}
                              maxSize={f.maxSize}
                              accept={f.accept}
                              helperText={f.helperText}
                              existingFiles={f.existingFiles}
                              onDeleteExisting={f.onDeleteExisting}
                              onChange={async (files) => {
                                if (!files) return;
                                if (Array.isArray(files)) {
                                  files.forEach((file) =>
                                    handleFileUpload(
                                      file,
                                      f.name,
                                      f.fileReturnShape,
                                      !!f.multiple,
                                      f.fileUrlTarget,
                                    ),
                                  );
                                } else {
                                  await handleFileUpload(
                                    files,
                                    f.name,
                                    f.fileReturnShape,
                                    !!f.multiple,
                                    f.fileUrlTarget,
                                  );
                                }
                              }}
                            />
                          );

                        default:
                          return (
                            <Input
                              type={f.type ?? "text"}
                              placeholder={f.placeholder}
                              {...field}
                            />
                          );
                      }
                    })()}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        {children}

        <div className="flex justify-end col-span-2 gap-2">
          {renderActions ? (
            renderActions({
              isSubmitting: form.formState.isSubmitting || isUploading,
              isValid: form.formState.isValid,
            })
          ) : (
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isUploading}
            >
              {form.formState.isSubmitting || isUploading
                ? "Saqlanmoqda..."
                : submitLabel}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
