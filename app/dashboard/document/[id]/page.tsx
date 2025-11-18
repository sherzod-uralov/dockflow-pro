import React from "react";
import DocumentView from "@/features/document/component/document.view";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <DocumentView />;
};

export default Page;
