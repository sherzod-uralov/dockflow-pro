"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { SuperDoc } from "superdoc";

interface QRCodePositionerProps {
  documentContent: string;
  fileName: string;
  file: File; // Added file prop to re-render SuperDoc
}

interface QRPosition {
  x: number;
  y: number;
}

export function QRCodePositioner({
  documentContent,
  fileName,
  file,
}: QRCodePositionerProps) {
  const [qrPosition, setQrPosition] = useState<QRPosition>({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (!file) {
      console.log("[v0] File not available yet");
      setIsLoading(false);
      return;
    }

    const initEditor = async () => {
      try {
        console.log("[v0] Initializing QR SuperDoc with file:", file.name);

        const toolbarEl = document.getElementById("qr-superdoc-toolbar");
        const editorEl = document.getElementById("qr-superdoc");

        console.log("[v0] Toolbar element:", toolbarEl);
        console.log("[v0] Editor element:", editorEl);

        if (!toolbarEl || !editorEl) {
          console.log("[v0] Elements not ready, retrying...");
          setTimeout(initEditor, 100);
          return;
        }

        const editor = new SuperDoc({
          selector: "#qr-superdoc",
          toolbar: "#qr-superdoc-toolbar",
          document: file,
          documentMode: "viewing",
          pagination: true,
          rulers: false,
          width: "100%",
          height: "auto",
          onReady: () => {
            console.log("[v0] QR SuperDoc ready and loaded");
            setIsLoading(false);
          },
          onError: (error: any) => {
            console.error("[v0] SuperDoc error:", error);
            setIsLoading(false);
          },
        });

        editorRef.current = editor;
        console.log("[v0] SuperDoc instance created:", editor);
      } catch (err) {
        console.error("[v0] Error initializing QR SuperDoc:", err);
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initEditor, 100);

    return () => {
      clearTimeout(timer);
      if (editorRef.current) {
        try {
          editorRef.current.destroy?.();
        } catch (err) {
          console.error("[v0] Error destroying editor:", err);
        }
        editorRef.current = null;
      }
    };
  }, [file]);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL("https://example.com/document", {
          width: 150,
          margin: 1,
        });
        setQrDataUrl(url);
      } catch (error) {
        console.error("QR code generation error:", error);
      }
    };
    generateQR();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (qrRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setQrPosition({
        x: Math.max(0, Math.min(x, rect.width - 150)),
        y: Math.max(0, Math.min(y, rect.height - 150)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      if (!containerRef.current) {
        throw new Error("Container not found");
      }

      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc, clonedElement) => {
          const allElements = [
            clonedElement,
            ...Array.from(clonedElement.querySelectorAll("*")),
          ];

          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              const computedStyle = window.getComputedStyle(el);

              if (
                computedStyle.color &&
                computedStyle.color !== "rgba(0, 0, 0, 0)"
              ) {
                el.style.color = computedStyle.color;
              }
              if (
                computedStyle.backgroundColor &&
                computedStyle.backgroundColor !== "rgba(0, 0, 0, 0)"
              ) {
                el.style.backgroundColor = computedStyle.backgroundColor;
              }
            }
          });
        },
        windowWidth: containerRef.current.scrollWidth,
        windowHeight: containerRef.current.scrollHeight,
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? "portrait" : "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      pdf.save(fileName.replace(".docx", ".pdf"));
    } catch (error) {
      console.error("PDF generation error:", error);
      alert(
        "PDF yaratishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Hujjat tayyorlanmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              QR Code Joylashuvi
            </h2>
            <p className="text-muted-foreground">
              QR code ni kerakli joyga sudrab olib boring
            </p>
          </div>
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            size="lg"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Yaratilmoqda...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                PDF Yuklab olish
              </>
            )}
          </Button>
        </div>

        <Card className="p-8 bg-card shadow-lg">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative bg-white border-2 border-dashed border-border rounded-lg overflow-auto"
            style={{ cursor: isDragging ? "grabbing" : "default" }}
          >
            <div
              id="qr-superdoc-toolbar"
              className="border-b border-border bg-muted/50"
            />

            <div
              id="qr-superdoc"
              className="w-full"
              style={{ minHeight: "1000px" }}
            />

            {qrDataUrl && (
              <div
                ref={qrRef}
                style={{
                  position: "absolute",
                  left: `${qrPosition.x}px`,
                  top: `${qrPosition.y}px`,
                  cursor: isDragging ? "grabbing" : "grab",
                  pointerEvents: "auto",
                  zIndex: 1000,
                }}
                className="border-2 border-primary rounded-lg p-2 bg-white shadow-lg"
              >
                <img
                  src={qrDataUrl || "/placeholder.svg"}
                  alt="QR Code"
                  width={150}
                  height={150}
                  className="pointer-events-none"
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
