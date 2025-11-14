"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, QrCode, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { pdfService } from "../service/pdf.service";

interface PDFViewerProps {
  documentId?: string;
}

export function PDFViewer({ documentId }: PDFViewerProps) {
  const viewer = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [instance, setInstance] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("https://example.com");
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
          setInstance(inst);
          setIsLoading(false);
        });
      } catch (error) {
        console.error("PDF yuklashda xatolik:", error);
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: "PDF faylni yuklashda xatolik yuz berdi",
        });
        setIsLoading(false);
      }
    };

    initializePDF();
  }, [documentId, toast]);

  const handleAddQRCode = async () => {
    if (!instance) return;

    const { documentViewer, Annotations, annotationManager } = instance.Core;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

        const stampAnnotation = new Annotations.StampAnnotation();
        stampAnnotation.PageNumber = documentViewer.getCurrentPage();
        stampAnnotation.X = 100;
        stampAnnotation.Y = 100;
        stampAnnotation.Width = 70;
        stampAnnotation.Height = 70;
        stampAnnotation.setImageData(base64);

        annotationManager.addAnnotation(stampAnnotation);
        annotationManager.redrawAnnotation(stampAnnotation);
      };

      reader.readAsDataURL(blob);
      setShowQRModal(false);

      toast({
        title: "Muvaffaqiyatli",
        description: "QR code PDF ga qo'shildi",
      });
    } catch (error) {
      console.error("QR code qo'shishda xatolik:", error);
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "QR code qo'shishda xatolik yuz berdi",
      });
    }
  };

  const handleSaveAnnotations = async () => {
    if (!instance || !documentId) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Document ID topilmadi",
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

      const result = await pdfService.saveAnnotations({
        documentId,
        xfdf: xfdfString,
      });

      if (result.success) {
        toast({
          title: "Muvaffaqiyatli",
          description: "Annotatsiyalar saqlandi",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Annotatsiyalarni saqlashda xatolik:", error);
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Annotatsiyalarni saqlashda xatolik yuz berdi",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b bg-card px-6 py-4 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <h1 className="text-xl font-semibold text-foreground">PDF Editor</h1>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQRModal(true)}
            className="gap-2"
          >
            <QrCode className="h-4 w-4" />
            QR Code
          </Button>

          {documentId && (
            <Button
              size="sm"
              onClick={handleSaveAnnotations}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Saqlash
                </>
              )}
            </Button>
          )}
        </div>
      </header>

      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                PDF yuklanmoqda...
              </p>
            </div>
          </div>
        )}
        <div ref={viewer} className="h-full w-full" />
      </div>

      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code qo'shish</DialogTitle>
            <DialogDescription>
              QR code uchun link kiriting va PDF ga qo'shing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="qr-url">Link</Label>
              <Input
                id="qr-url"
                type="url"
                value={qrUrl}
                onChange={(e) => setQrUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Ko'rinish:</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`}
                alt="QR Code Preview"
                className="rounded border bg-white p-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRModal(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleAddQRCode}>PDF ga qo'shish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
