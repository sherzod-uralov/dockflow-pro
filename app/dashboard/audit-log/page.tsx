import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import AuditLogPage from "@/features/audit-logs/page/audit-log.page";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Audit jurnallari"
        description="Tizim harakatlari monitoringi"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Audit jurnallari",
            href: "/dashboard/audit-log",
          },
        ]}
      />
      <AuditLogPage />
    </>
  );
};

export default Page;
