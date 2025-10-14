import GeneratePage from "@/features/generate/page/generate.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Hujjat"
        description="Hujjatlarni boshqarish"
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
            label: "Hujjat",
            href: "/dashboard/admin/generate",
          },
        ]}
      />
      <GeneratePage />
    </>
  );
};

export default Page;
