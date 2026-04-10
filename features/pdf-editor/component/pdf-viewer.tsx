"use client";

import { useEffect, useState } from "react";
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
  Modal,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconQrcode,
  IconDeviceFloppy,
  IconCheck,
  IconSignature,
} from "@tabler/icons-react";
import QRCode from "qrcode";
// @ts-ignore
import { DocVerseViewer } from "@docverse-pdf/next";
import { pdfService } from "../service/pdf.service";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";

interface PDFViewerProps {
  documentId?: string;
  action?: "read" | "edit";
}

export function PDFViewer({ documentId, action = "edit" }: PDFViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get("workflowId");
  const actionType = searchParams.get("actionType") || "QR_CODE";
  const showTips = searchParams.get("showTips") === "true";
  const { data: profileData } = useGetProfileQuery();
  const [tipsOpen, setTipsOpen] = useState(showTips);
  const [instance, setInstance] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const { pdfUrl } = await pdfService.getDocument(documentId);
        setPdfUrl(pdfUrl);
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
    loadPdf();
  }, [documentId]);

  const handleReady = (inst: any) => {
    setInstance(inst);
    setIsLoading(false);
  };

  const createStampImage = (fullname: string, date: Date) => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fon
    ctx.fillStyle = "#ecfdf5";
    ctx.beginPath();
    ctx.roundRect(0, 0, 600, 200, 16);
    ctx.fill();
    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(2, 2, 596, 196, 14);
    ctx.stroke();

    // Raqam va sana
    const randomId = Math.floor(1000000 + Math.random() * 9000000);
    const dateStr = date.toLocaleDateString("ru-RU");
    const timeStr = date.toLocaleTimeString("ru-RU");

    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#1f2937";
    ctx.textAlign = "left";
    ctx.fillText(`№ ${randomId}`, 20, 35);
    ctx.textAlign = "right";
    ctx.fillText(`${dateStr} ${timeStr}`, 580, 35);

    // TASDIQLANGAN
    ctx.textAlign = "center";
    ctx.font = "bold 52px Arial";
    ctx.fillStyle = "#059669";
    ctx.fillText("TASDIQLANGAN", 300, 110);

    // Ism
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#1f2937";
    ctx.fillText(fullname.toUpperCase(), 300, 160);

    return canvas.toDataURL("image/png");
  };

  const handleAddQRCode = async () => {
    if (!instance || !documentId) {
      notifications.show({
        title: "Xatolik",
        message: "Hujjat ID topilmadi",
        color: "red",
      });
      return;
    }

    try {
      const { annotationManager } = instance.Core;
      const qrUrl = `https://e-hujjat.nordicuniversity.org/view/${documentId}`;

      const dataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      });

      await annotationManager.placeStamp(dataUrl, 80, 80);

      notifications.show({
        title: "Muvaffaqiyatli",
        message: "QR kod PDF ga qo'shildi",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error("[QR] Xatolik:", error);
      notifications.show({
        title: "Xatolik",
        message: "QR kod qo'shishda xatolik yuz berdi",
        color: "red",
      });
    }
  };

  const handleAddSignature = async () => {
    if (!instance || !documentId) {
      notifications.show({
        title: "Xatolik",
        message: "PDF yuklanmagan yoki ID topilmadi",
        color: "red",
      });
      return;
    }

    if (!profileData?.fullname) {
      notifications.show({
        title: "Xatolik",
        message: "Foydalanuvchi ma'lumotlari yuklanmagan",
        color: "red",
      });
      return;
    }

    try {
      const { annotationManager } = instance.Core;

      const dataUrl = createStampImage(profileData.fullname, new Date());
      if (!dataUrl) {
        throw new Error("Canvas stamp yaratib bo'lmadi");
      }

      await annotationManager.placeStamp(dataUrl, 280, 95);

      notifications.show({
        title: "Muvaffaqiyatli",
        message: "Tasdiqlash muhri qo'yildi",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error("[Sign] Xatolik:", error);
      notifications.show({
        title: "Xatolik",
        message: "Muhr qo'yishda xatolik yuz berdi",
        color: "red",
      });
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
      const xfdfString = await instance.Core.annotationManager.exportAnnotations();
      console.log("[Save] XFDF length:", xfdfString?.length);

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

  const isReadOnly = action === "read";

  const disabledFeatures = isReadOnly ? ["annotations", "download"] : [];
  const disabledElements = isReadOnly
    ? [
        "header",
        "toolsHeader",
        "annotationPopup",
        "contextMenuPopup",
        "toolStylePopup",
        "signatureModal",
        "printModal",
        "leftPanel",
        "leftPanelButton",
        "searchButton",
        "notesPanel",
        "notesPanelButton",
        "menuButton",
        "viewControlsButton",
        "selectToolButton",
        "annotationToolButton",
        "toolsButton",
        "searchPanel",
      ]
    : action === "edit" && actionType === "QR_CODE"
      ? ["signatureToolGroupButton", "signatureToolButton"]
      : [];

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
              {isReadOnly
                ? "PDF Ko'rish"
                : actionType === "SIGN"
                  ? "Imzolash"
                  : "PDF Editor"}
            </Text>
          </Group>

          <Group gap="xs">
            {action === "edit" && (
              <>
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
              </>
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
        {pdfUrl && (
          <DocVerseViewer
            style={{ height: "100%", width: "100%" }}
            path="/wasm/"
            licenseKey={process.env.NEXT_PUBLIC_DOCVERSE_LICENSE_KEY || ""}
            initialDoc={pdfUrl}
            readOnly={isReadOnly}
            locale="uz"
            disabledFeatures={disabledFeatures}
            disabledElements={disabledElements}
            onReady={handleReady}
          />
        )}
      </Box>

      <Modal
        opened={tipsOpen}
        onClose={() => setTipsOpen(false)}
        title="QR kod joylashtirish"
        centered
      >
        <Stack>
          <Text size="sm">
            Hujjat aylanmasi yaratildi. Endi hujjatning istalgan joyiga QR
            kodni joylashtiring. Bu QR kod orqali hujjatni tekshirish mumkin
            bo'ladi.
          </Text>
          <Button
            onClick={() => setTipsOpen(false)}
            fullWidth
            style={{ backgroundColor: "#1e3a5f" }}
          >
            Tushunarli
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
}
