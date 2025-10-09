import DocumentPatternPage from "@/features/document-pattern/page/document-pattern.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="S"
        description="Slarni boshqarish"
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
            label: "S",
            href: "/dashboard/admin/document-pattern",
          },
        ]}
      />
      <DocumentPatternPage />
    </>
  );
};

export default Page;
