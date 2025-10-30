"use client";

import React, { useCallback, useMemo } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { cn } from "@/lib/utils";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Upload, FileText, File as FileIcon, X, Download } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ExistingFile {
  id: string;
  fileName: string;
  fileSize?: number;
  fileUrl: string;
}

interface FileUploadProps {
  onChange: (file: File | File[] | undefined) => void;
  value?: File | File[];
  label?: string;
  name: string;
  multiple?: boolean;
  maxFiles?: number;
  accept?: Accept;
  maxSize?: number;
  helperText?: string;
  existingFiles?: ExistingFile[];
  onDeleteExisting?: (fileId: string) => void;
}

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const isImage = (type: string) => type.startsWith("image/");
const isWord = (type: string) =>
  type === "application/msword" ||
  type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const isPdf = (type: string) => type === "application/pdf";

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText className="w-6 h-6 text-error" />;
  if (["doc", "docx"].includes(ext || ""))
    return <FileText className="w-6 h-6 text-info" />;
  if (["jpg", "jpeg", "png", "gif"].includes(ext || ""))
    return <FileIcon className="w-6 h-6 text-success" />;
  return <FileIcon className="w-6 h-6 text-muted-foreground" />;
};

type DisplayFile = {
  type: "existing" | "new";
  id?: string;
  file?: File;
  fileName: string;
  fileSize?: number;
  fileUrl?: string;
  index?: number;
};

export function FileUpload({
  onChange,
  label,
  name,
  multiple = false,
  maxFiles,
  accept,
  maxSize,
  helperText,
  value,
  existingFiles = [],
  onDeleteExisting,
}: FileUploadProps) {
  const [localFiles, setLocalFiles] = useState<File[]>(
    Array.isArray(value) ? value : value ? [value] : [],
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejections: any[]) => {
      if (rejections?.length) {
        rejections.forEach((rej) => {
          rej.errors?.forEach((err: any) => {
            toast.error(err.message || "Fayl qabul qilinmadi");
          });
        });
      }
      if (!acceptedFiles.length) return;

      if (!multiple && existingFiles.length > 0 && onDeleteExisting) {
        existingFiles.forEach((file) => onDeleteExisting(file.id));
      }

      const next = multiple
        ? [...localFiles, ...acceptedFiles]
        : [acceptedFiles[0]];
      setLocalFiles(next);
      onChange(multiple ? next : next[0]);
    },
    [localFiles, multiple, onChange, existingFiles, onDeleteExisting],
  );

  const removeNewFile = (index: number) => {
    const next = localFiles.filter((_, i) => i !== index);
    setLocalFiles(next);
    onChange(multiple ? next : next[0]);
  };

  const computedAccept: Accept = accept ?? {
    "application/pdf": [".pdf"],
    "image/*": [".jpg", ".jpeg", ".png", ".gif"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: computedAccept,
    multiple,
    maxFiles: maxFiles ?? (multiple ? 10 : 1),
    maxSize: maxSize ?? 100 * 1024 * 1024,
  });

  const allFiles = useMemo<DisplayFile[]>(() => {
    const existing: DisplayFile[] = existingFiles.map((file) => ({
      type: "existing",
      id: file.id,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileUrl: file.fileUrl,
    }));

    const newFiles: DisplayFile[] = localFiles.map((file, index) => ({
      type: "new",
      file: file,
      fileName: file.name,
      fileSize: file.size,
      index: index,
    }));

    return [...existing, ...newFiles];
  }, [existingFiles, localFiles]);

  const hasFiles = allFiles.length > 0;

  return (
    <FormItem>
      <FormControl>
        <div className="space-y-3">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer",
              isDragActive ? "border-primary bg-primary/10" : "border-border",
              "hover:border-primary hover:bg-primary/5",
            )}
          >
            <input {...getInputProps()} name={name} />
            <div className="text-center">
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragActive
                  ? "Fayl(lar)ni bu yerga tashlang"
                  : hasFiles
                    ? "Boshqa fayl yuklash"
                    : "Fayl yuklash"}
              </p>
              <p className="text-xs text-muted-foreground">
                {helperText ?? "PDF, JPG, PNG, GIF, DOC, DOCX (max 100MB)"}
              </p>
              {label && (
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              )}
            </div>
          </div>

          {hasFiles && (
            <div className="rounded-lg border border-border bg-card p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">
                Yuklangan fayllar ({allFiles.length})
              </p>
              {allFiles.map((item, idx) => (
                <div
                  key={item.type === "existing" ? item.id : `new-${idx}`}
                  className="flex items-center gap-3 p-2 rounded-md bg-muted/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded bg-muted">
                    {item.type === "new" &&
                    item.file &&
                    isImage(item.file.type) ? (
                      <img
                        src={URL.createObjectURL(item.file)}
                        alt={item.fileName}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : item.type === "new" &&
                      item.file &&
                      isPdf(item.file.type) ? (
                      <FileText className="w-6 h-6 text-error" />
                    ) : item.type === "new" &&
                      item.file &&
                      isWord(item.file.type) ? (
                      <FileText className="w-6 h-6 text-info" />
                    ) : (
                      getFileIcon(item.fileName)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.fileName}
                      </p>
                      {item.type === "new" && (
                        <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                          Yangi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.type === "new" && item.file
                        ? `${item.file.type || "unknown"} • ${formatBytes(item.fileSize)}`
                        : formatBytes(item.fileSize)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.type === "existing" && item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-muted rounded-md transition-colors"
                      >
                        <Download className="w-4 h-4 text-primary" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          item.type === "existing" &&
                          item.id &&
                          onDeleteExisting
                        ) {
                          onDeleteExisting(item.id);
                        } else if (
                          item.type === "new" &&
                          item.index !== undefined
                        ) {
                          removeNewFile(item.index);
                        }
                      }}
                      className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
