import WorkflowPage from "@/features/workflow/page/workflow.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Workflow"
        description="Workflowlarni boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Admin",
            href: "/dashboard/admin",
          },
          {
            label: "Workflow",
            href: "/dashboard/admin/workflow",
          },
        ]}
      />
      <WorkflowPage />
    </>
  );
};

export default Page;
