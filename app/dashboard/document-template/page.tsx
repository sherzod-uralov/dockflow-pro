import DocumentTemplatePage from "@/features/document-template/page/document-template.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Andoza"
        description="Andozalarni boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Admin",
            href: "/dashboard/admin",
          },
          {
            label: "Andoza",
            href: "/dashboard/admin/document-template",
          },
        ]}
      />
      <DocumentTemplatePage />
    </>
  );
};

export default Page;
