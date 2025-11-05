"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const id = useSearchParams().get("id");

  const [selectedFile, setSelectedFile] = useState("");
  const iframeRef = useRef<any>(null);

  const handleFileClick = (fileName: string) => {
    setSelectedFile(fileName);
  };

  useEffect(() => {
    const WOPI_SRC = `https://docflow-back.nordicuniversity.org/api/v1/wopi/files/${id}?access_token=secret`;
    const COLLABORA_URL = `https://office.nordicuniversity.org/browser/e808afa229/cool.html?WOPISrc=${encodeURIComponent(WOPI_SRC)}`;

    console.log("🚀 Загружаем Collabora:", COLLABORA_URL);
    iframeRef.current.src = COLLABORA_URL;
  }, [selectedFile]);

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
