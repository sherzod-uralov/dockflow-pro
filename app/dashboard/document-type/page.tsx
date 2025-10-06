import DocumentTypePage from "@/features/document-type/page/document-type.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Hujjat turi"
        description="Hujjat turilarni boshqarish"
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
            label: "Hujjat turi",
            href: "/dashboard/admin/document-type",
          },
        ]}
      />
      <DocumentTypePage />
    </>
  );
};

export default Page;
