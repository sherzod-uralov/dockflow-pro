import React from "react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import JournalPage from "@/features/journal/page/journal.page";
import { Home } from "lucide-react";

const Page = () => {
  return (
    <>
      <PageHeader
        title={"Jurnallar"}
        description="Jurnallar yaratish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Jurnal",
            href: "/dashboard/journal",
          },
        ]}
      ></PageHeader>
      <JournalPage />
    </>
  );
};

export default Page;
