import WorkflowTemplatePage from "@/features/workflow-template/page/workflow-template.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="Hujjat aylanmasi shablonlari"
        description="Hujjat aylanmasi shablonlarini boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Hujjat aylanmasi shablonlari",
            href: "/dashboard/workflow-template",
          },
        ]}
      />
      <WorkflowTemplatePage />
    </>
  );
};

export default Page;
