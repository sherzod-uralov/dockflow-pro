"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";
import { Home, ArrowLeft } from "lucide-react";
import { useGetWorkflowById } from "@/features/workflow/hook/workflow.hook";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import WorkflowView from "@/features/workflow/component/workflow.view";

const WorkflowDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const { data: workflow, isLoading, isError } = useGetWorkflowById(workflowId);

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Workflow ma'lumotlari"
          description="Yuklanmoqda..."
          items={[
            {
              label: "Bosh sahifa",
              href: "/dashboard",
              icon: <Home size={16} />,
            },
            {
              label: "Workflow",
              href: "/dashboard/workflow",
            },
            {
              label: "Ma'lumotlar",
              href: "#",
            },
          ]}
        />
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (isError || !workflow) {
    return (
      <>
        <PageHeader
          title="Workflow ma'lumotlari"
          description="Xatolik yuz berdi"
          items={[
            {
              label: "Bosh sahifa",
              href: "/dashboard",
              icon: <Home size={16} />,
            },
            {
              label: "Workflow",
              href: "/dashboard/workflow",
            },
            {
              label: "Ma'lumotlar",
              href: "#",
            },
          ]}
        />
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Workflow topilmadi yoki yuklanishda xatolik yuz berdi.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/workflow")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga qaytish
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={workflow.document?.title || "Workflow ma'lumotlari"}
        description={workflow.document?.description || "Workflow haqida batafsil ma'lumotlar"}
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Workflow",
            href: "/dashboard/workflow",
          },
          {
            label: workflow.document?.title || "Ma'lumotlar",
            href: "#",
          },
        ]}
      />
      <div className="space-y-6">
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/workflow")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga qaytish
          </Button>
        </div>
        <WorkflowView workflow={workflow} />
      </div>
    </>
  );
};

export default WorkflowDetailPage;
