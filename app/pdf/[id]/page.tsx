"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Box, Loader, Stack, Text } from "@mantine/core";
import { colors } from "@/lib/colors";
import { PDFViewer } from "@/features/pdf-editor/component/pdf-viewer";

function PDFViewerWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const action = (searchParams.get("action") as "read" | "edit") || "edit";
  return <PDFViewer documentId={id} action={action} />;
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
        backgroundColor: colors.bg,
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
