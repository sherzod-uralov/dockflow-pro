"use client";

import { useState } from "react";
import { FileUpload } from "@/app/dashboard/setting/system-setting/file-upload";
import { WordEditor } from "@/app/dashboard/setting/system-setting/word-editor";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  return (
    <main className="min-h-screen bg-background">
      {!uploadedFile ? (
        <FileUpload onFileUpload={handleFileUpload} />
      ) : (
        <WordEditor file={uploadedFile} />
      )}
    </main>
  );
}
