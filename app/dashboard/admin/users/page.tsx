import UserPage from "@/features/admin/admin-users/page/user.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Foydalanuvchilar"
        description="Foydalanuvchilarni boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "admin",
            href: "/dashboard/admin",
          },
          {
            label: "foydalanuvchilar",
            href: "/dashboard/admin/users",
          },
        ]}
      />
      <UserPage />
    </>
  );
};

export default Page;
