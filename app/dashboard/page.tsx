"use client";

import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import { Home } from "lucide-react";
import { StatisticsPage } from "@/features/statistics";

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Statistika"
          description="Tizim ko'rsatkichlari va hisobotlar"
          items={[
            {
              label: "Bosh sahifa",
              href: "/dashboard",
              icon: <Home size={16} />,
            },
          ]}
        />
      </div>

      <StatisticsPage />
    </>
  );
}
