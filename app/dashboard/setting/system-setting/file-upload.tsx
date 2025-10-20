"use client";

import type React from "react";

import { useCallback, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const docxFile = files.find(
        (file) =>
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.name.endsWith(".docx"),
      );

      if (docxFile) {
        onFileUpload(docxFile);
      } else {
        alert("Iltimos, faqat .docx formatdagi fayllarni yuklang");
      }
    },
    [onFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        onFileUpload(file);
      } else {
        alert("Iltimos, faqat .docx formatdagi fayllarni yuklang");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Word Document Editor
          </h1>
          <p className="text-muted-foreground text-lg">
            Word hujjatini yuklang va tahrirlang
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-6">
              {isDragging ? (
                <FileText className="w-12 h-12 text-primary" />
              ) : (
                <Upload className="w-12 h-12 text-primary" />
              )}
            </div>

            <div>
              <p className="text-lg font-medium mb-2 text-foreground">
                {isDragging
                  ? "Faylni bu yerga tashlang"
                  : "Word hujjatini yuklash"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Faylni sudrab olib keling yoki tanlang
              </p>
            </div>

            <input
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild size="lg">
                <span>Fayl tanlash</span>
              </Button>
            </label>

            <p className="text-xs text-muted-foreground mt-2">
              Faqat .docx formatdagi fayllar qo'llab-quvvatlanadi
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
