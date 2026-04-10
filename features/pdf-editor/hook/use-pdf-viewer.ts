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

        const DocVerse = (await import('@docverse-pdf/viewer')).default;

        const inst = await DocVerse(
          {
            path: '/wasm/',
            licenseKey: process.env.NEXT_PUBLIC_DOCVERSE_LICENSE_KEY || '',
            initialDoc: pdfUrl,
          },
          viewer.current as HTMLDivElement,
        );

        setInstance(inst);
        setIsLoading(false);
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

    return () => {
      if (instance) {
        instance.dispose();
      }
    };
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
      const xfdfString = await instance.Core.annotationManager.exportAnnotations();

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

    try {
      const currentPage = instance.Core.documentViewer.getCurrentPage() - 1;
      await instance.UI.addQRCode(qrUrl, currentPage, 100, 100, 70);

      toast({
        title: 'Muvaffaqiyatli',
        description: "QR code PDF ga qo'shildi",
      });
    } catch (error) {
      console.error("QR code qo'shishda xatolik:", error);
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: "QR code qo'shishda xatolik yuz berdi",
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
