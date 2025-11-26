import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import RolesPage from "@/features/admin/roles/page/role.page";
import { Home } from "lucide-react";

const RolePage = () => {
  return (
    <>
      <PageHeader
        title="Ro'llar"
        description="Ro'llarni boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Boshqaruv",
            href: "/dashboard/admin",
          },
          {
            label: "Ro'llar",
            href: "/dashboard/admin/roles",
          },
        ]}
      />
      <RolesPage />
    </>
  );
};

export default RolePage;
