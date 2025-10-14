"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { cn } from "@/lib/utils";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import {
  Upload,
  Image as ImageIcon,
  FileText,
  File as FileIcon,
} from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onChange: (file: File | File[] | undefined) => void;
  value?: File | File[];
  label?: string;
  name: string;
  multiple?: boolean;
  maxFiles?: number;
  // Dinamik ruxsat etilgan turlar (react-dropzone Accept)
  accept?: Accept;
  // Maksimal hajm (baytda). Masalan: 100 * 1024 * 1024 (100MB)
  maxSize?: number;
  // Ko'rsatiladigan matnlar (ixtiyoriy)
  helperText?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
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

      const next = multiple
        ? [...localFiles, ...acceptedFiles]
        : [acceptedFiles[0]];
      setLocalFiles(next);
      onChange(multiple ? next : next[0]);
    },
    [localFiles, multiple, onChange],
  );

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
    maxSize: maxSize ?? 100 * 1024 * 1024, // default 100MB
  });

  const filesToShow = useMemo(() => localFiles, [localFiles]);

  return (
    <FormItem>
      <FormControl>
        <div className="space-y-2">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center transition-colors",
              isDragActive ? "border-primary bg-primary/10" : "border-gray-300",
              "hover:border-primary hover:bg-primary/5",
            )}
          >
            <input {...getInputProps()} name={name} />
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {isDragActive
                  ? "Fayl(lar)ni bu yerga tashlang"
                  : "Fayl(lar)ni tanlash uchun bosing yoki sudrab keling"}
              </p>
              <p className="text-xs text-gray-400">
                {helperText ??
                  "(PDF, JPG, PNG, GIF, DOC, DOCX; max 100MB; ko‘p fayl uchun bir necha marta tanlang yoki birdan tashlang)"}
              </p>
              {label && (
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              )}
            </div>
          </div>

          {filesToShow.length > 0 && (
            <div className="rounded-md border p-3 space-y-2">
              {filesToShow.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded bg-muted">
                    {isImage(f.type) ? (
                      // Image preview
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : isPdf(f.type) ? (
                      <FileText className="w-6 h-6 text-red-600" />
                    ) : isWord(f.type) ? (
                      <FileText className="w-6 h-6 text-blue-600" />
                    ) : (
                      <FileIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.type || "unknown"} • {formatBytes(f.size)}
                    </p>
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
