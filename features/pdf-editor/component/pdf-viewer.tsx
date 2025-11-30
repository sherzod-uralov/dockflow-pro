"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Group,
  Text,
  Loader,
  Stack,
  ActionIcon,
  Paper,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconQrcode,
  IconDeviceFloppy,
  IconCheck,
  IconSignature,
} from "@tabler/icons-react";
import { pdfService } from "../service/pdf.service";

interface PDFViewerProps {
  documentId?: string;
}

export function PDFViewer({ documentId }: PDFViewerProps) {
  const viewer = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get("workflowId");
  const actionType = searchParams.get("actionType") || "QR_CODE";

  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initializePDF = async () => {
      try {
        setIsLoading(true);
        const { pdfUrl } = await pdfService.getDocument(documentId);

        const WebViewerModule = await import("@pdftron/webviewer");
        const WebViewer = WebViewerModule.default;

        WebViewer(
          {
            path: "/webViewer",
            licenseKey:
              "demo:1762777177081:601eabe40300000000e42ddd407e894dff6198482ac17897bce606c4a2",
            initialDoc: pdfUrl,
          },
          viewer.current as HTMLDivElement,
        ).then((inst) => {
          // Configure based on actionType
          const { documentViewer, Tools } = inst.Core;

          // Set default tool to Pan (hand tool) for navigation
          documentViewer.addEventListener('documentLoaded', () => {
            const panTool = documentViewer.getTool(Tools.ToolNames.PAN);
            if (panTool) {
              documentViewer.setToolMode(panTool);
            }

            // Set instance and loading state only after document is fully loaded
            setInstance(inst);
            setIsLoading(false);
          });

          // Disable signature tool click for QR_CODE action
          if (actionType === "QR_CODE") {
            // Disable signature-related UI elements
            inst.UI.disableElements(['signatureToolGroupButton', 'signatureToolButton']);
          }
        });
      } catch (error) {
        console.error("PDF yuklashda xatolik:", error);
        notifications.show({
          title: "Xatolik",
          message: "PDF faylni yuklashda xatolik yuz berdi",
          color: "red",
        });
        setIsLoading(false);
      }
    };

    initializePDF();
  }, [documentId]);

  const handleAddQRCode = async () => {
    if (!instance || !documentId) {
      notifications.show({
        title: "Xatolik",
        message: "Hujjat ID topilmadi",
        color: "red",
      });
      return;
    }

    const { documentViewer, Annotations, annotationManager } = instance.Core;
    const qrUrl = `https://e-hujjat.nordicuniversity.org/view/${documentId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const stampAnnotation = new Annotations.StampAnnotation();
      stampAnnotation.PageNumber = documentViewer.getCurrentPage();
      stampAnnotation.X = 100;
      stampAnnotation.Y = 100;
      stampAnnotation.Width = 70;
      stampAnnotation.Height = 70;

      await stampAnnotation.setImageData(base64);

      annotationManager.addAnnotation(stampAnnotation);
      annotationManager.redrawAnnotation(stampAnnotation);

      notifications.show({
        title: "Muvaffaqiyatli",
        message: "QR kod PDF ga qo'shildi",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error("QR kod qo'shishda xatolik:", error);
      notifications.show({
        title: "Xatolik",
        message: "QR kod qo'shishda xatolik yuz berdi",
        color: "red",
      });
    }
  };

  const handleAddSignature = () => {
    if (!instance) {
      notifications.show({
        title: "Xatolik",
        message: "PDF yuklanmagan",
        color: "red",
      });
      return;
    }

    try {
      const { documentViewer, Tools } = instance.Core;
      const signatureTool = documentViewer.getTool(Tools.ToolNames.SIGNATURE);

      if (signatureTool) {
        // Set signature tool as active
        documentViewer.setToolMode(signatureTool);

        notifications.show({
          title: "Imzolash",
          message: "PDF ustiga bosib imzo qo'ying",
          color: "blue",
        });
      } else {
        // Fallback: open signature modal directly
        instance.UI.openElements(['signatureModal']);
      }
    } catch (error) {
      console.error("Imzolash xatolik:", error);
      // Try alternative approach
      try {
        instance.UI.openElements(['signatureModal']);
      } catch (e) {
        notifications.show({
          title: "Xatolik",
          message: "Imzolash toolini ochishda xatolik",
          color: "red",
        });
      }
    }
  };

  const handleSaveAnnotations = async () => {
    if (!instance || !documentId) {
      notifications.show({
        title: "Xatolik",
        message: "Document ID topilmadi",
        color: "red",
      });
      return;
    }

    try {
      setIsSaving(true);
      const { annotationManager } = instance.Core;
      const xfdfString = await annotationManager.exportAnnotations({
        links: false,
        widgets: false,
      });

      await pdfService.saveAnnotations({
        documentId,
        xfdf: xfdfString,
      });

      notifications.show({
        title: "Saqlandi",
        message: "O'zgarishlar muvaffaqiyatli saqlandi",
        color: "green",
        icon: <IconCheck size={16} />,
      });

      // Auto redirect after saving
      setTimeout(() => {
        if (workflowId) {
          router.push(`/dashboard/workflow/${workflowId}`);
        } else {
          router.back();
        }
      }, 1000);
    } catch (error) {
      console.error("Annotatsiyalarni saqlashda xatolik:", error);
      notifications.show({
        title: "Xatolik",
        message: "Saqlashda xatolik yuz berdi",
        color: "red",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (workflowId) {
      router.push(`/dashboard/workflow/${workflowId}`);
    } else {
      router.back();
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Header */}
      <Paper
        px="md"
        py="sm"
        radius={0}
        style={{
          borderBottom: "1px solid #e9ecef",
          flexShrink: 0,
        }}
      >
        <Group justify="space-between">
          <Group gap="sm">
            <ActionIcon
              variant="subtle"
              size="lg"
              radius="sm"
              onClick={handleBack}
              color="dark"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Text size="md" fw={600} c="#212529">
              {actionType === "SIGN" ? "Imzolash" : "PDF Editor"}
            </Text>
          </Group>

          <Group gap="xs">
            {/* QR Code button - only for QR_CODE action */}
            {actionType === "QR_CODE" && (
              <Button
                variant="outline"
                size="sm"
                radius="sm"
                leftSection={<IconQrcode size={16} />}
                onClick={handleAddQRCode}
                disabled={!documentId || isLoading || !instance}
                color="dark"
              >
                QR kod
              </Button>
            )}

            {/* Signature button - only for SIGN action */}
            {actionType === "SIGN" && (
              <Button
                variant="outline"
                size="sm"
                radius="sm"
                leftSection={<IconSignature size={16} />}
                onClick={handleAddSignature}
                disabled={!documentId || isLoading || !instance}
                color="dark"
              >
                Imzo qo'yish
              </Button>
            )}

            {documentId && (
              <Button
                size="sm"
                radius="sm"
                leftSection={
                  isSaving ? (
                    <Loader size={14} color="white" />
                  ) : (
                    <IconDeviceFloppy size={16} />
                  )
                }
                onClick={handleSaveAnnotations}
                disabled={isSaving || isLoading}
                style={{ backgroundColor: "#1e3a5f" }}
              >
                {isSaving ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            )}
          </Group>
        </Group>
      </Paper>

      {/* PDF Viewer */}
      <Box style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {isLoading && (
          <Box
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(248, 249, 250, 0.9)",
              zIndex: 50,
            }}
          >
            <Stack align="center" gap="sm">
              <Loader size="md" color="dark" />
              <Text size="sm" c="dimmed">
                PDF yuklanmoqda...
              </Text>
            </Stack>
          </Box>
        )}
        <div
          ref={viewer}
          style={{
            height: "100%",
            width: "100%",
            overflow: "hidden",
          }}
        />
      </Box>
    </Box>
  );
}
