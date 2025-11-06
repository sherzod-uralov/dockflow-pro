"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useGetWopiToken } from "@/features/document-editor";

const Page = () => {
  const searchParams = useSearchParams();
  const fileId = searchParams.get("id") || "";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { data: wopiData, isLoading, error } = useGetWopiToken(fileId);

  console.log(wopiData);
  useEffect(() => {
    if (wopiData && iframeRef.current) {
      const WOPI_SRC = `${wopiData.wopiSrc}?access_token=${wopiData.accessToken}`;
      const COLLABORA_URL = `https://office.nordicuniversity.org/browser/e808afa229/cool.html?WOPISrc=${encodeURIComponent(WOPI_SRC)}`;

      iframeRef.current.src = COLLABORA_URL;
    }
  }, [wopiData]);

  if (!fileId) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <p>Fayl ID topilmadi. URL'da id parametri bo'lishi kerak.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <p>Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ flex: 1 }}>
        <iframe
          ref={iframeRef}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Collabora Online Editor"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};

export default Page;
