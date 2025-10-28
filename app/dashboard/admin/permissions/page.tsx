import PermissionPage from "@/features/admin/permissions/page/permission.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Ruxsatlar"
        description="Ruxsatlarni boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "admin",
          },
          {
            label: "Ruxsatlar",
            href: "/dashboard/admin/permissions",
          },
        ]}
      />
      <PermissionPage />
    </>
  );
};

export default Page;
