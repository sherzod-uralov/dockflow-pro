"use client";

import React from "react";
import { Steps, Badge, Avatar, Tag, Divider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/uz";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
  UserOutlined,
  QrcodeOutlined,
  EyeOutlined,
  EditOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Link from "next/link";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("uz");

interface WorkflowStep {
  id?: string;
  assignedToUser: {
    fullname: string;
    username?: string;
    avatarUrl?: string;
  };
  status: string;
  isRejected: boolean;
  actionType: string;
  completedAt?: string;
  startedAt?: string;
  createdAt?: string;
  rejectionReason?: string;
  actions?: Array<{
    comment?: string;
    performedBy?: { fullname: string; username?: string };
  }>;
}

const WorkflowTracker = ({ workflow }: { workflow: any }) => {
  if (!workflow || workflow.length === 0) return null;

  const workflowData = workflow[0];
  const steps: WorkflowStep[] = workflowData?.workflowSteps || [];

  const getActionTypeName = (actionType: string) => {
    switch (actionType) {
      case "QR_CODE":
        return "QR kod qo'shish";
      case "APPROVAL":
        return "Tasdiqlash";
      case "VIEW":
      case "REVIEW":
        return "Ko'rib chiqish";
      case "EDIT":
        return "Tahrirlash";
      case "SIGN":
        return "Imzolash";
      case "ACKNOWLEDGE":
        return "Tasdiqlash";
      default:
        return "Tasdiqlash";
    }
  };

  const getActionIcon = (step: WorkflowStep) => {
    const { isRejected, status, actionType } = step;

    if (isRejected) {
      return <CloseCircleFilled style={{ color: "#ef4444", fontSize: 20 }} />;
    }

    if (status !== "COMPLETED") {
      return <ClockCircleFilled style={{ color: "#f59e0b", fontSize: 20 }} />;
    }

    switch (actionType) {
      case "QR_CODE":
        return <QrcodeOutlined style={{ color: "#10b981", fontSize: 20 }} />;
      case "SIGN":
        return <EditOutlined style={{ color: "#06b6d4", fontSize: 20 }} />;
      case "ACKNOWLEDGE":
        return <CheckCircleFilled style={{ color: "#10b981", fontSize: 20 }} />;
      case "VIEW":
      case "REVIEW":
        return <EyeOutlined style={{ color: "#3b82f6", fontSize: 20 }} />;
      case "EDIT":
        return <EditOutlined style={{ color: "#a855f7", fontSize: 20 }} />;
      default:
        return <CheckCircleFilled style={{ color: "#10b981", fontSize: 20 }} />;
    }
  };

  const getStatusColor = (status: string, isRejected: boolean) => {
    if (isRejected) return "error";
    if (status === "COMPLETED") return "success";
    return "process";
  };

  const createUserTooltipContent = (step: WorkflowStep) => (
    <div className="space-y-3 w-72 bg-gray-50 text-gray-800 p-4 rounded-md">
      <div>
        <p className="text-xs font-semibold text-gray-500">Foydalanuvchi</p>
        <p className="text-sm font-medium">{step.assignedToUser.fullname}</p>
        {step.assignedToUser.username && (
          <p className="text-xs text-gray-400">
            @{step.assignedToUser.username}
          </p>
        )}
      </div>

      <div className="border-t border-gray-200 pt-3">
        <p className="text-xs font-semibold text-gray-500">Harakat turi</p>
        <p className="text-sm text-text-on-dark">{getActionTypeName(step.actionType)}</p>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <p className="text-xs font-semibold text-gray-500">Holati</p>
        <div className="flex items-center gap-2 mt-1">
          {step.isRejected ? (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-600">Rad etildi</span>
            </>
          ) : step.status === "COMPLETED" ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Tugallandi</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-yellow-600">Kutilmoqda</span>
            </>
          )}
        </div>
      </div>

      {step.startedAt && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs font-semibold text-gray-500">Boshlandi</p>
          <p className="text-sm">
            {dayjs(step.startedAt).tz("Asia/Tashkent").format("DD MMM, HH:mm")}
          </p>
        </div>
      )}

      {step.completedAt && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs font-semibold text-gray-500">Tugallandi</p>
          <p className="text-sm">
            {dayjs(step.completedAt)
              .tz("Asia/Tashkent")
              .format("DD MMM, HH:mm")}
          </p>
        </div>
      )}

      {step.isRejected && step.rejectionReason && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs font-semibold text-gray-500">
            Rad etish sababi
          </p>
          <p className="text-sm italic text-red-600">{step.rejectionReason}</p>
        </div>
      )}

      {step.actions?.[0]?.comment && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs font-semibold text-gray-500">Izoh</p>
          <p className="text-sm italic text-gray-700">
            "{step.actions[0].comment}"
          </p>
        </div>
      )}
    </div>
  );

  const items: {
    title: React.JSX.Element;
    description: React.JSX.Element;
    icon: React.JSX.Element;
    status: string;
  }[] = steps.map((step) => {
    const titleWithTooltip = (
      <Link
        href={`/dashboard/workflow/43204a7f-adb8-4e21-8e2e-fd6ead0a4da9#${step.id}`}
      >
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-2 cursor-help">
              <Avatar
                size="small"
                icon={<UserOutlined />}
                src={step.assignedToUser.avatarUrl}
                className="bg-blue-500"
              />
              <span className="font-medium text-sm">
                {step.assignedToUser.fullname.split(" ")[0]}
              </span>
              {step.isRejected && (
                <Tag color="red" className="text-xs">
                  Rad etildi
                </Tag>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-card text-text-on-light p-3 rounded-lg shadow-lg"
          >
            {createUserTooltipContent(step)}
          </TooltipContent>
        </Tooltip>
      </Link>
    );

    const description = (
      <div className="space-y-1 mt-2">
        <p className="text-xs text-text-on-dark font-medium">
          {getActionTypeName(step.actionType)}
        </p>
        {step.completedAt && (
          <p className="text-xs text-muted-foreground">
            {dayjs(step.completedAt)
              .tz("Asia/Tashkent")
              .format("DD MMM, HH:mm")}
          </p>
        )}
      </div>
    );

    return {
      title: titleWithTooltip,
      description,
      icon: getActionIcon(step),
      status: getStatusColor(step.status, step.isRejected),
    };
  });

  const totalTime = dayjs(steps[steps.length - 1]?.completedAt).diff(
    dayjs(steps[0]?.createdAt),
    "minute",
  );

  return (
    <div className="mb-5">
      <div>
        <Card className="p-6 bg-card">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TeamOutlined className="text-lg" />
                  Jarayon Tarixi
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {steps.length} bosqich • Jami {totalTime} daqiqa
                </p>
              </div>
              <Badge
                count={steps.length}
                style={{ backgroundColor: "#f0f0f0", color: "#666" }}
              />
            </div>

            <Divider className="my-4" />

            <div className="overflow-x-auto pb-4">
              <div className="min-w-max">
                <Steps
                  current={steps.length - 1}
                  //@ts-ignore
                  items={items}
                  size="small"
                  labelPlacement="vertical"
                  style={{ padding: "8px 0" }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowTracker;
