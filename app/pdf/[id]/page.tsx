import { PDFViewer } from '@/features/pdf-editor/component/pdf-viewer';

interface PageProps {
  params: {
    id: string;
  };
}

export default function PDFEditorPage({ params }: PageProps) {
  return <PDFViewer documentId={params.id} />;
}
