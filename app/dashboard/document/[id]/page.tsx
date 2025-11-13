import React, { FC } from "react";
import DocumentView from "@/features/document/component/document.view";

const Page: FC<{ params: { id: string } }> = ({ params }) => {
  return <DocumentView documentId={params.id} />;
};

export default Page;
