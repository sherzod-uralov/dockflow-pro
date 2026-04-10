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
    console.log("[DocVerse] onReady - instance keys:", Object.keys(inst || {}));
    console.log("[DocVerse] Core keys:", Object.keys(inst?.Core || {}));
    console.log("[DocVerse] Annotations:", inst?.Core?.Annotations);

    const am = inst?.Core?.annotationManager;
    if (am) {
      const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(am));
      console.log("[DocVerse] annotationManager methods:", proto);
    }

    const stamp = inst?.Core?.Annotations?.StampAnnotation;
    if (stamp) {
      const testStamp = new stamp();
      console.log("[DocVerse] StampAnnotation instance keys:", Object.keys(testStamp));
      console.log("[DocVerse] StampAnnotation proto:", Object.getOwnPropertyNames(Object.getPrototypeOf(testStamp)));
    }

    setInstance(inst);
    setIsLoading(false);
  };

  const createStampImage = (fullname: string, date: Date) => {
    const canvas = document.createElement("canvas");
    const width = 600;
    const height = 200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const radius = 20;
    ctx.fillStyle = "#e0fcfc";
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, radius);
    ctx.fill();

    const randomId = Math.floor(1000000 + Math.random() * 9000000);
    const dateStr = date.toLocaleDateString("ru-RU");
    const timeStr = date.toLocaleTimeString("ru-RU");

    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#000000";
    ctx.fillText(`№ ${randomId}`, 30, 40);
    ctx.textAlign = "right";
    ctx.fillText(`${dateStr} ${timeStr}`, width - 30, 40);

    ctx.textAlign = "center";
    ctx.font = "bold 60px sans-serif";
    ctx.fillStyle = "#00a09d";
    ctx.fillText("TASDIQLANGAN", width / 2, 110);

    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#000000";
    ctx.fillText(fullname.toUpperCase(), width / 2, 160);

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
      const t0 = performance.now();
      const { documentViewer, Annotations, annotationManager } = instance.Core;
      const qrUrl = `https://e-hujjat.nordicuniversity.org/view/${documentId}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;

      const t1 = performance.now();
      console.log(`[QR] ⏱ setup: ${(t1-t0).toFixed(0)}ms`);

      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const t2 = performance.now();
      console.log(`[QR] ⏱ fetch: ${(t2-t1).toFixed(0)}ms`);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const t3 = performance.now();
      console.log(`[QR] ⏱ base64: ${(t3-t2).toFixed(0)}ms, length: ${base64.length}`);

      const stamp = new Annotations.StampAnnotation();
      stamp.PageNumber = documentViewer.getCurrentPage();
      stamp.X = 100;
      stamp.Y = 100;
      stamp.Width = 70;
      stamp.Height = 70;
      const t4 = performance.now();
      console.log(`[QR] ⏱ stamp create: ${(t4-t3).toFixed(0)}ms`);

      if (typeof stamp.setImageData === "function") {
        await stamp.setImageData(base64);
      } else {
        stamp.ImageData = base64;
      }
      const t5 = performance.now();
      console.log(`[QR] ⏱ setImageData: ${(t5-t4).toFixed(0)}ms`);

      if (typeof annotationManager.addStampDirect === "function") {
        console.log("[QR] Using addStampDirect");
        annotationManager.addStampDirect(stamp);
      } else {
        annotationManager.addAnnotation(stamp);
      }
      const t6 = performance.now();
      console.log(`[QR] ⏱ addAnnotation: ${(t6-t5).toFixed(0)}ms`);

      if (typeof annotationManager.renderStamps === "function") {
        console.log("[QR] renderStamps...");
        annotationManager.renderStamps();
      } else if (typeof annotationManager.redrawAnnotation === "function") {
        annotationManager.redrawAnnotation(stamp);
      }
      const t7 = performance.now();
      console.log(`[QR] ⏱ render: ${(t7-t6).toFixed(0)}ms`);
      console.log(`[QR] ⏱ TOTAL: ${(t7-t0).toFixed(0)}ms`);
      notifications.show({
        title: "Muvaffaqiyatli",
        message: "QR kod PDF ga qo'shildi",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error("[QR] XATOLIK:", error);
      notifications.show({
        title: "Xatolik",
        message: `QR kod: ${(error as Error)?.message}`,
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
      const t0 = performance.now();
      const { documentViewer, Annotations, annotationManager } = instance.Core;

      const stampImage = createStampImage(profileData.fullname, new Date());
      if (!stampImage) {
        throw new Error("Canvas stamp yaratib bo'lmadi");
      }
      const t1 = performance.now();
      console.log(`[Sign] ⏱ canvas: ${(t1-t0).toFixed(0)}ms, length: ${stampImage.length}`);

      const stamp = new Annotations.StampAnnotation();
      stamp.PageNumber = documentViewer.getCurrentPage();
      stamp.X = 100;
      stamp.Y = 100;
      stamp.Width = 300;
      stamp.Height = 100;
      const t2 = performance.now();
      console.log(`[Sign] ⏱ stamp create: ${(t2-t1).toFixed(0)}ms`);

      if (typeof stamp.setImageData === "function") {
        await stamp.setImageData(stampImage);
      } else {
        stamp.ImageData = stampImage;
      }
      const t3 = performance.now();
      console.log(`[Sign] ⏱ setImageData: ${(t3-t2).toFixed(0)}ms`);

      if (typeof annotationManager.addStampDirect === "function") {
        console.log("[Sign] Using addStampDirect");
        annotationManager.addStampDirect(stamp);
      } else {
        annotationManager.addAnnotation(stamp);
      }
      const t4 = performance.now();
      console.log(`[Sign] ⏱ addAnnotation: ${(t4-t3).toFixed(0)}ms`);

      if (typeof annotationManager.renderStamps === "function") {
        console.log("[Sign] renderStamps...");
        annotationManager.renderStamps();
      } else if (typeof annotationManager.redrawAnnotation === "function") {
        annotationManager.redrawAnnotation(stamp);
      }
      const t5 = performance.now();
      console.log(`[Sign] ⏱ render: ${(t5-t4).toFixed(0)}ms`);
      console.log(`[Sign] ⏱ TOTAL: ${(t5-t0).toFixed(0)}ms`);
      notifications.show({
        title: "Muvaffaqiyatli",
        message: "Tasdiqlash muhri qo'yildi",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error("[Sign] XATOLIK:", error);
      notifications.show({
        title: "Xatolik",
        message: `Imzo: ${(error as Error)?.message}`,
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
