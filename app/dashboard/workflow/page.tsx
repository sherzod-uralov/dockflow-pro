import WorkflowPage from "@/features/workflow/page/workflow.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Hujjat aylanmasi"
        description="Hujjat aylanmalarini boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Hujjat aylanmasi",
            href: "/dashboard/workflow",
          },
        ]}
      />
      <WorkflowPage />
    </>
  );
};

export default Page;
