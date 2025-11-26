import DocumentTemplatePage from "@/features/document-template/page/document-template.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Hujjat shablonlari"
        description="Hujjat shablonlarini boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Hujjat shablonlari",
            href: "/dashboard/document-template",
          },
        ]}
      />
      <DocumentTemplatePage />
    </>
  );
};

export default Page;
