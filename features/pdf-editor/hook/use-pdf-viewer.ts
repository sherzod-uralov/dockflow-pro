import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { pdfService } from '../service/pdf.service';

export function usePDFViewer(documentId?: string) {
  const viewer = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initializePDF = async () => {
      try {
        setIsLoading(true);
        const { pdfUrl } = await pdfService.getDocument(documentId);

        const WebViewerModule = await import('@pdftron/webviewer');
        const WebViewer = WebViewerModule.default;

        WebViewer(
          {
            path: '/lib/webViewer',
            licenseKey: 'demo:1762777177081:601eabe40300000000e42ddd407e894dff6198482ac17897bce606c4a2',
            initialDoc: pdfUrl,
          },
          viewer.current as HTMLDivElement,
        ).then((inst) => {
          setInstance(inst);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('PDF yuklashda xatolik:', error);
        toast({
          variant: 'destructive',
          title: 'Xatolik',
          description: 'PDF faylni yuklashda xatolik yuz berdi',
        });
        setIsLoading(false);
      }
    };

    initializePDF();
  }, [documentId, toast]);

  const saveAnnotations = async () => {
    if (!instance || !documentId) {
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: 'Document ID topilmadi',
      });
      return;
    }

    try {
      setIsSaving(true);
      const { annotationManager } = instance.Core;
      const xfdfString = await annotationManager.exportAnnotations({
        links: false,
        widgets: false
      });

      const result = await pdfService.saveAnnotations({
        documentId,
        xfdf: xfdfString,
      });

      if (result.success) {
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Annotatsiyalar saqlandi',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Annotatsiyalarni saqlashda xatolik:', error);
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: 'Annotatsiyalarni saqlashda xatolik yuz berdi',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addQRCode = async (qrUrl: string) => {
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

      toast({
        title: 'Muvaffaqiyatli',
        description: 'QR code PDF ga qo\'shildi',
      });
    } catch (error) {
      console.error('QR code qo\'shishda xatolik:', error);
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: 'QR code qo\'shishda xatolik yuz berdi',
      });
    }
  };

  return {
    viewer,
    instance,
    isLoading,
    isSaving,
    saveAnnotations,
    addQRCode,
  };
}
