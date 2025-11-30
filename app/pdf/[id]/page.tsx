"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Box, Loader, Stack, Text } from "@mantine/core";
import { PDFViewer } from "@/features/pdf-editor/component/pdf-viewer";

function PDFViewerWrapper() {
  const params = useParams();
  const id = params.id as string;
  return <PDFViewer documentId={id} />;
}

function LoadingFallback() {
  return (
    <Box
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Stack align="center" gap="sm">
        <Loader size="md" color="dark" />
        <Text size="sm" c="dimmed">
          Yuklanmoqda...
        </Text>
      </Stack>
    </Box>
  );
}

export default function PDFEditorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PDFViewerWrapper />
    </Suspense>
  );
}
