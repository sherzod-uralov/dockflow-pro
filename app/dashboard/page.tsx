import { FileStats } from "@/components/shared/file-stats";
import { FileGrid } from "@/components/shared/file-grid";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import { Home } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Statistika"
          description="Fayllar boshqaruv paneli"
          items={[
            {
              label: "Bosh sahifa",
              href: "/dashboard",
              icon: <Home size={16} />,
            },
          ]}
        />
      </div>

      <FileStats />
      <FileGrid />
    </>
  );
}
