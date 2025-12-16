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
import { pdfService } from "../service/pdf.service";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";

interface PDFViewerProps {
  documentId?: string;
}

export function PDFViewer({ documentId }: PDFViewerProps) {
  const viewer = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get("workflowId");
  const actionType = searchParams.get("actionType") || "QR_CODE";
  const showTips = searchParams.get("showTips") === "true";
  const { data } = useGetProfileQuery();
  const [tipsOpen, setTipsOpen] = useState(showTips);
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  console.log(data)
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
              "demo:1765863910116:60cf415b030000000072a110bb28641e048069f32c1cb555766a944152",
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

  const createStampImage = (fullname: string, date: Date) => {
    const canvas = document.createElement('canvas');
    const width = 600;
    const height = 200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const radius = 20;
    ctx.fillStyle = '#e0fcfc';
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, radius);
    ctx.fill();


    const randomId = Math.floor(1000000 + Math.random() * 9000000);
    const dateStr = date.toLocaleDateString('ru-RU');
    const timeStr = date.toLocaleTimeString('ru-RU');

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(`№ ${randomId}`, 30, 40);
    ctx.textAlign = 'right';
    ctx.fillText(`${dateStr} ${timeStr}`, width - 30, 40);

    ctx.textAlign = 'center';
    ctx.font = 'bold 60px sans-serif';
    ctx.fillStyle = '#00a09d';
    ctx.fillText('ТАСДИҚЛАНГАН', width / 2, 110);

    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(fullname.toUpperCase(), width / 2, 160);

    return canvas.toDataURL('image/png');
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

    if (!data?.fullname) {
      notifications.show({
        title: "Xatolik",
        message: "Foydalanuvchi ma'lumotlari yuklanmagan",
        color: "red",
      });
      return;
    }

    try {
      const { documentViewer, Annotations, annotationManager } = instance.Core;

      const stampImage = createStampImage(data.fullname, new Date());

      if (!stampImage) {
        throw new Error("Stamp creation failed");
      }

      const stampAnnotation = new Annotations.StampAnnotation();
      stampAnnotation.PageNumber = documentViewer.getCurrentPage();
      stampAnnotation.X = 100;
      stampAnnotation.Y = 100;
      stampAnnotation.Width = 300;
      stampAnnotation.Height = 100;

      await stampAnnotation.setImageData(stampImage);

      annotationManager.addAnnotation(stampAnnotation);
      annotationManager.redrawAnnotation(stampAnnotation);

      // Select the annotation so the user can move it immediately
      annotationManager.selectAnnotation(stampAnnotation);

      notifications.show({
        title: "Muvaffaqiyatli",
        message: "Tasdiqlash muhri qo'yildi",
        color: "green",
        icon: <IconCheck size={16} />,
      });

    } catch (error) {
      console.error("Muhr qo'yishda xatolik:", error);
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
      <Modal
        opened={tipsOpen}
        onClose={() => setTipsOpen(false)}
        title="QR kod joylashtirish"
        centered
      >
        <Stack>
          <Text size="sm">
            Hujjat aylanmasi yaratildi. Endi hujjatning istalgan joyiga QR kodni joylashtiring.
            Bu QR kod orqali hujjatni tekshirish mumkin bo'ladi.
          </Text>
          <Button onClick={() => setTipsOpen(false)} fullWidth style={{ backgroundColor: "#1e3a5f" }}>
            Tushunarli
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
}
