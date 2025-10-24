"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, QrCode, Plus, Minus } from "lucide-react";
import QRCode from "qrcode";
import { SuperDoc } from "superdoc";
import "superdoc/style.css";

interface WordEditorProps {
  documentUrl: string;
  onDocumentChange?: (content: any) => void;
  onPdfGenerated?: (
    pdfBlob: Blob,
    qrPosition: { x: number; y: number; size: number } | null,
  ) => void;
}

interface QRPosition {
  x: number;
  y: number;
}

export default function WordEditor({
  documentUrl,
  onDocumentChange,
  onPdfGenerated,
}: WordEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrPosition, setQrPosition] = useState<QRPosition>({ x: 100, y: 100 });
  const [qrSize, setQrSize] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const initializingRef = useRef(false);
  const resizeStartRef = useRef({ x: 0, y: 0, size: 0 });

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    console.log("[v0] Starting SuperDoc with URL:", documentUrl);

    const initEditor = async () => {
      try {
        const toolbarEl = document.getElementById("superdoc-toolbar");
        const editorEl = document.getElementById("superdoc");

        if (!toolbarEl || !editorEl) {
          console.log("[v0] DOM elements not ready, retrying...");
          setTimeout(initEditor, 100);
          return;
        }

        console.log("[v0] Creating SuperDoc instance...");

        const editor = new SuperDoc({
          selector: "#superdoc",
          toolbar: "#superdoc-toolbar",
          document: documentUrl,
          documentMode: "editing",
          pagination: true,
          rulers: true,
          onReady: (event: any) => {
            console.log("[v0] SuperDoc ready:", event);
            setIsLoading(false);
            setError(null);
          },
          onEditorCreate: (event: any) => {
            console.log("[v0] Editor created:", event);
          },
          onChange: (event: any) => {
            console.log("[v0] Document changed:", event);
            if (onDocumentChange) {
              onDocumentChange(event);
            }
          },
        });

        editorRef.current = editor;
        console.log("[v0] SuperDoc instance created successfully");
      } catch (err) {
        console.error("[v0] Error initializing SuperDoc:", err);
        setIsLoading(false);
        setError("Hujjat yuklanishida xatolik: " + (err as Error).message);
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
      initializingRef.current = false;
    };
  }, [documentUrl, onDocumentChange]);

  useEffect(() => {
    if (showQR) {
      handleGenerateQR();
    }
  }, [qrSize]);

  const handleGenerateQR = async () => {
    try {
      const url = await QRCode.toDataURL(documentUrl, {
        width: qrSize,
        margin: 1,
      });
      setQrDataUrl(url);
      setShowQR(true);
    } catch (error) {
      console.error("[v0] QR code generation error:", error);
      alert("QR code yaratishda xatolik yuz berdi");
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (qrRef.current?.contains(e.target as Node)) {
      const target = e.target as HTMLElement;
      if (target.classList.contains("resize-handle")) {
        setIsResizing(true);
        resizeStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          size: qrSize,
        };
      } else {
        setIsDragging(true);
      }
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      const delta = Math.max(deltaX, deltaY);
      const newSize = Math.max(
        100,
        Math.min(500, resizeStartRef.current.size + delta),
      );
      setQrSize(newSize);
    } else if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      // Get scroll position
      const scrollLeft = containerRef.current.scrollLeft;
      const scrollTop = containerRef.current.scrollTop;

      // Calculate position including scroll
      const x = e.clientX - rect.left + scrollLeft - qrSize / 2;
      const y = e.clientY - rect.top + scrollTop - qrSize / 2;

      setQrPosition({
        x: Math.max(0, x),
        y: Math.max(0, y),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const increaseSize = () => {
    setQrSize((prev) => Math.min(500, prev + 20));
  };

  const decreaseSize = () => {
    setQrSize((prev) => Math.max(100, prev - 20));
  };

  const handleGeneratePDF = async () => {
    if (!containerRef.current) return;

    setIsGeneratingPDF(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas-pro")).default;

      console.log("[v0] Starting PDF generation...");

      const superdocElement = document.getElementById("superdoc");
      if (!superdocElement) {
        throw new Error("SuperDoc element not found");
      }

      console.log("[v0] SuperDoc structure:", superdocElement);

      const possibleSelectors = [
        ".superdoc-page-content",
        ".superdoc-page",
        ".page-content",
        ".document-content",
        "[data-page-content]",
        ".editor-content",
        ".ProseMirror",
      ];

      let pageElement: HTMLElement | null = null;
      for (const selector of possibleSelectors) {
        pageElement = superdocElement.querySelector(selector) as HTMLElement;
        if (pageElement) {
          console.log("[v0] Found page element with selector:", selector);
          break;
        }
      }

      if (!pageElement) {
        const children = Array.from(superdocElement.children) as HTMLElement[];
        if (children.length > 0) {
          pageElement = children.reduce((largest, current) => {
            const largestArea = largest.offsetWidth * largest.offsetHeight;
            const currentArea = current.offsetWidth * current.offsetHeight;
            return currentArea > largestArea ? current : largest;
          });
          console.log("[v0] Using largest child element:", pageElement);
        }
      }

      const elementToCapture = pageElement || superdocElement;

      const canvas = await html2canvas(elementToCapture, {
        scale: 3,
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
        ignoreElements: (element) => {
          const classList = Array.from(element.classList);
          const id = element.id || "";

          const shouldIgnore =
            id === "superdoc-toolbar" ||
            element.tagName === "BUTTON" ||
            classList.some(
              (cls) =>
                cls.includes("ruler") ||
                cls.includes("toolbar") ||
                cls.includes("scrollbar") ||
                cls.includes("resize-handle"),
            );

          return shouldIgnore;
        },
      });

      console.log("[v0] Canvas size:", canvas.width, "x", canvas.height);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvasRatio = canvas.width / canvas.height;
      const a4Ratio = pdfWidth / pdfHeight;

      let imgWidth = pdfWidth;
      let imgHeight = pdfHeight;
      let xOffset = 0;
      let yOffset = 0;

      if (canvasRatio > a4Ratio) {
        imgHeight = pdfWidth / canvasRatio;
        yOffset = (pdfHeight - imgHeight) / 2;
      } else {
        imgWidth = pdfHeight * canvasRatio;
        xOffset = (pdfWidth - imgWidth) / 2;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      pdf.addImage(
        imgData,
        "JPEG",
        xOffset,
        yOffset,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
      );

      // Add QR code if visible
      if (showQR && qrDataUrl) {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const capturedRect = elementToCapture.getBoundingClientRect();

        const offsetX =
          capturedRect.left -
          containerRect.left +
          containerRef.current!.scrollLeft;
        const offsetY =
          capturedRect.top -
          containerRect.top +
          containerRef.current!.scrollTop;

        const relativeX = qrPosition.x - offsetX;
        const relativeY = qrPosition.y - offsetY;

        const qrPdfX = xOffset + (relativeX / capturedRect.width) * imgWidth;
        const qrPdfY = yOffset + (relativeY / capturedRect.height) * imgHeight;
        const qrPdfSize = (qrSize / capturedRect.width) * imgWidth;

        console.log(
          "[v0] PDF QR position:",
          qrPdfX,
          qrPdfY,
          "size:",
          qrPdfSize,
        );

        pdf.addImage(
          qrDataUrl,
          "PNG",
          qrPdfX,
          qrPdfY,
          qrPdfSize,
          qrPdfSize,
          undefined,
          "FAST",
        );
      }

      // Convert PDF to Blob
      const pdfBlob = pdf.output("blob");

      // Call callback with PDF data
      if (onPdfGenerated) {
        const qrData = showQR
          ? { x: qrPosition.x, y: qrPosition.y, size: qrSize }
          : null;
        onPdfGenerated(pdfBlob, qrData);
      }

      console.log("[v0] PDF generated successfully");
    } catch (error) {
      console.error("[v0] PDF generation error:", error);
      alert("PDF yaratishda xatolik yuz berdi: " + (error as Error).message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Document Editor
          </h2>
          <div className="flex gap-2">
            {!showQR ? (
              <Button
                onClick={handleGenerateQR}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <QrCode className="w-4 h-4" />
                QR Code Qo'shish
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-1 border border-border rounded-md">
                  <Button
                    onClick={decreaseSize}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-2 min-w-[60px] text-center">
                    {qrSize}px
                  </span>
                  <Button
                    onClick={increaseSize}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => setShowQR(false)}
                  variant="outline"
                  className="gap-2"
                >
                  QR Code Yashirish
                </Button>
              </>
            )}
            {showQR && (
              <Button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className="gap-2"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Yaratilmoqda...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    PDF Yaratish
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* SuperDoc Toolbar */}
      <div
        id="superdoc-toolbar"
        className="border-b border-border bg-background"
      />

      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/30 relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isDragging
            ? "grabbing"
            : isResizing
              ? "nwse-resize"
              : "default",
        }}
      >
        <div className="flex justify-center items-start min-h-full py-8">
          <div id="superdoc" className="w-full max-w-[210mm]" />
        </div>

        {showQR && qrDataUrl && (
          <div
            ref={qrRef}
            style={{
              position: "absolute",
              left: `${qrPosition.x}px`,
              top: `${qrPosition.y}px`,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: 1000,
              width: `${qrSize}px`,
              height: `${qrSize}px`,
              border: "1px solid #000",
              backgroundColor: "#fff",
              padding: "8px",
            }}
          >
            <img
              src={qrDataUrl || "/placeholder.svg"}
              alt="QR Code"
              width={qrSize - 16}
              height={qrSize - 16}
              className="pointer-events-none"
            />
            <div
              className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-nwse-resize"
              style={{ cursor: "nwse-resize" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
