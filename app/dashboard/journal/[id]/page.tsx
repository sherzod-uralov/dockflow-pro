import React from "react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import JournalDocumentsPage from "@/features/journal/page/journal-documents.page";
import { Home, BookOpen } from "lucide-react";

const Page = () => {
  return (
    <>
      <PageHeader
        title={"Jurnal hujjatlari"}
        description="Jurnalga tegishli hujjatlar ro'yxati"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Jurnallar",
            href: "/dashboard/journal",
            icon: <BookOpen size={16} />,
          },
          {
            label: "Hujjatlar",
          },
        ]}
      />
      <JournalDocumentsPage />
    </>
  );
};

export default Page;
