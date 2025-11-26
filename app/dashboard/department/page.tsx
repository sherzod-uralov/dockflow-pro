import DeportamentPage from "@/features/deportament/page/deportament.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Bo'limlar"
        description="Bo'limlarni boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Bo'limlar",
            href: "/dashboard/department",
          },
        ]}
      />
      <DeportamentPage />
    </>
  );
};

export default Page;
