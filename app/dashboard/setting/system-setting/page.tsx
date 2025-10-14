import React from "react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import { Home } from "lucide-react";
import SystemSettingPage from "@/features/setting/system-setting/page/system-setting.page";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Tizim sozlamalari"
        description="Tizim sozlamalarini boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Tizim sozlamalari",
            href: "/dashboard/system-setting",
          },
        ]}
      ></PageHeader>
      <SystemSettingPage />
    </>
  );
};

export default Page;
