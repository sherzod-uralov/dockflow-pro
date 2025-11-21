import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import AuditLogPage from "@/features/audit-logs/page/audit-log.page";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Audit Loglar"
        description="Tizim harakatlari monitoringi"
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
            label: "Audit Loglar",
            href: "/dashboard/admin/audit-logs",
          },
        ]}
      />
      <AuditLogPage />
    </>
  );
};

export default Page;
