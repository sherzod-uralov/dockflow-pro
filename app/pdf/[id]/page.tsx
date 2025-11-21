import { PDFViewer } from '@/features/pdf-editor/component/pdf-viewer';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PDFEditorPage({ params }: PageProps) {
  const { id } = await params;
  return <PDFViewer documentId={id} />;
}
