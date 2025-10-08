import React from "react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import { Home } from "lucide-react";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Profil"
        description="Profil sozlamasi"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Profil",
            href: "/dashboard/profile",
          },
        ]}
      ></PageHeader>
    </>
  );
};

export default Page;
