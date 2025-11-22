import ViewPage from "@/features/view/page/view.page";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentVerifyPage({ params }: PageProps) {
  const { id } = await params;
  return <ViewPage documentId={id} />;
}
