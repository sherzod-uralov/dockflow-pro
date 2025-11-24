import React from "react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import DepartmentUsersPage from "@/features/deportament/page/department-users.page";
import { Home, Building } from "lucide-react";

const Page = () => {
  return (
    <>
      <PageHeader
        title={"Departament foydalanuvchilari"}
        description="Departamentga tegishli foydalanuvchilar ro'yxati"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Departamentlar",
            href: "/dashboard/department",
            icon: <Building size={16} />,
          },
          {
            label: "Foydalanuvchilar",
          },
        ]}
      />
      <DepartmentUsersPage />
    </>
  );
};

export default Page;
