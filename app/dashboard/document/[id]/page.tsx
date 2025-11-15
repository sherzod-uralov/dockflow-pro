import React, { FC } from "react";
import DocumentView from "@/features/document/component/document.view";

const Page: FC<{ params: { id: string } }> = ({ params }) => {
  return <DocumentView />;
};

export default Page;
