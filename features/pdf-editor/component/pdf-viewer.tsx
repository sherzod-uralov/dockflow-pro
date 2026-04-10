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
    console.log("[DocVerse] onReady fired, instance:", inst);
    console.log("[DocVerse] instance keys:", Object.keys(inst || {}));
    console.log("[DocVerse] instance.Core:", inst?.Core);
    console.log("[DocVerse] instance.Core keys:", Object.keys(inst?.Core || {}));
    console.log("[DocVerse] instance.UI:", inst?.UI);
    console.log("[DocVerse] instance.UI keys:", Object.keys(inst?.UI || {}));
    console.log("[DocVerse] UI.addQRCode:", typeof inst?.UI?.addQRCode);
    console.log("[DocVerse] UI.addSignatureStamp:", typeof inst?.UI?.addSignatureStamp);
    console.log("[DocVerse] Core.documentViewer:", inst?.Core?.documentViewer);
    console.log("[DocVerse] Core.annotationManager:", inst?.Core?.annotationManager);
    console.log("[DocVerse] Core.Annotations:", inst?.Core?.Annotations);
    setInstance(inst);
    setIsLoading(false);
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
      const qrUrl = `https://e-hujjat.nordicuniversity.org/view/${documentId}`;

      console.log("[DocVerse QR] instance:", instance);
      console.log("[DocVerse QR] instance.UI methods:", Object.keys(instance.UI || {}));
      console.log("[DocVerse QR] addQRCode type:", typeof instance.UI?.addQRCode);
      console.log("[DocVerse QR] Core.documentViewer:", instance.Core?.documentViewer);
      console.log("[DocVerse QR] getCurrentPage type:", typeof instance.Core?.documentViewer?.getCurrentPage);

      const currentPage = instance.Core?.documentViewer?.getCurrentPage?.();
      console.log("[DocVerse QR] currentPage:", currentPage);

      if (typeof instance.UI?.addQRCode === "function") {
        console.log("[DocVerse QR] Calling addQRCode...");
        const result = await instance.UI.addQRCode(qrUrl, currentPage ? currentPage - 1 : 0, 100, 100, 70);
        console.log("[DocVerse QR] addQRCode result:", result);
      } else {
        console.warn("[DocVerse QR] addQRCode not available! Trying fallback...");
        console.log("[DocVerse QR] Core.Annotations:", instance.Core?.Annotations);
        console.log("[DocVerse QR] Core.Annotations keys:", Object.keys(instance.Core?.Annotations || {}));
        console.log("[DocVerse QR] annotationManager:", instance.Core?.annotationManager);
        console.log("[DocVerse QR] annotationManager keys:", Object.keys(instance.Core?.annotationManager || {}));

        notifications.show({
          title: "Debug",
          message: "addQRCode metodi topilmadi. Console loglarni tekshiring.",
          color: "yellow",
        });
        return;
      }

      notifications.show({
        title: "Muvaffaqiyatli",
        message: "QR kod PDF ga qo'shildi",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error("[DocVerse QR] XATOLIK:", error);
      console.error("[DocVerse QR] Error stack:", (error as Error)?.stack);
      notifications.show({
        title: "Xatolik",
        message: `QR kod: ${(error as Error)?.message || "Noma'lum xatolik"}`,
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
      console.log("[DocVerse Sign] instance:", instance);
      console.log("[DocVerse Sign] UI methods:", Object.keys(instance.UI || {}));
      console.log("[DocVerse Sign] addSignatureStamp type:", typeof instance.UI?.addSignatureStamp);
      console.log("[DocVerse Sign] Core.documentViewer:", instance.Core?.documentViewer);

      const currentPage = instance.Core?.documentViewer?.getCurrentPage?.();
      console.log("[DocVerse Sign] currentPage:", currentPage);

      if (typeof instance.UI?.addSignatureStamp === "function") {
        console.log("[DocVerse Sign] Calling addSignatureStamp...");
        const result = await instance.UI.addSignatureStamp(
          profileData.fullname,
          new Date(),
          currentPage ? currentPage - 1 : 0,
          100,
          100
        );
        console.log("[DocVerse Sign] addSignatureStamp result:", result);
      } else {
        console.warn("[DocVerse Sign] addSignatureStamp not available!");
        console.log("[DocVerse Sign] Core.Annotations:", instance.Core?.Annotations);
        console.log("[DocVerse Sign] annotationManager:", instance.Core?.annotationManager);

        notifications.show({
          title: "Debug",
          message: "addSignatureStamp metodi topilmadi. Console loglarni tekshiring.",
          color: "yellow",
        });
        return;
      }

      notifications.show({
        title: "Muvaffaqiyatli",
        message: "Tasdiqlash muhri qo'yildi",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error("[DocVerse Sign] XATOLIK:", error);
      console.error("[DocVerse Sign] Error stack:", (error as Error)?.stack);
      notifications.show({
        title: "Xatolik",
        message: `Imzo: ${(error as Error)?.message || "Noma'lum xatolik"}`,
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
