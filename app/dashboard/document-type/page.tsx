import DocumentTypePage from "@/features/document-type/page/document-type.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Hujjat turlari"
        description="Hujjat turlarini boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Hujjat turlari",
            href: "/dashboard/document-type",
          },
        ]}
      />
      <DocumentTypePage />
    </>
  );
};

export default Page;
