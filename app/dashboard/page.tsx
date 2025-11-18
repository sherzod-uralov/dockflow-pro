"use client";

import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import { Home } from "lucide-react";
import { StatisticsPage } from "@/features/statistics";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Bosh sahifa"
        description="Tizim ko'rsatkichlari va sizning vazifalaringiz"
        items={[
          {
            label: "Statistika",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
        ]}
      />
      <StatisticsPage />
    </>
  );
}
