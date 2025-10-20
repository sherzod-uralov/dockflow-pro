"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DocumentEditorContent() {
  const searchParams = useSearchParams();

  // Get all parameters
  const url = searchParams.get("url");
  const id = searchParams.get("id");
  const api = searchParams.get("api");
  const field = searchParams.get("field") || "templateFileId";
  const token = searchParams.get("token");
  const mode = searchParams.get("mode") || "edit";
  const qr = searchParams.get("qr") || "true";

  // Validation
  if (!url || !id || !api || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Noto'g'ri parametrlar
          </h1>
          <p className="text-muted-foreground">
            URL, ID, API yoki token parametrlari topilmadi
          </p>
        </div>
      </div>
    );
  }

  // Build microservice URL
  const microserviceUrl = new URL("http://localhost:5173");
  microserviceUrl.searchParams.set("url", url);
  microserviceUrl.searchParams.set("id", id);
  microserviceUrl.searchParams.set("api", api);
  microserviceUrl.searchParams.set("field", field);
  microserviceUrl.searchParams.set("token", token);
  microserviceUrl.searchParams.set("mode", mode);
  microserviceUrl.searchParams.set("qr", qr);

  return (
    <div className="w-full h-screen">
      <iframe
        src={microserviceUrl.toString()}
        className="w-full h-full border-0"
        title="Document Editor"
        allow="clipboard-write"
      />
    </div>
  );
}

export default function DocumentEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p>Yuklanmoqda...</p>
        </div>
      }
    >
      <DocumentEditorContent />
    </Suspense>
  );
}
