"use client";

import { Menu, ActionIcon, Divider, Tooltip } from "@mantine/core";
import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
  IconCopy,
  IconDownload,
} from "@tabler/icons-react";
import { ComponentType } from "react";
import { usePermission } from "@/providers/permission-provider";
import { DEFAULT_DENIAL_REASON } from "@/components/shared/permission";

export interface ActionItem {
  id: string;
  label: string;
  icon: ComponentType<any>;
  onClick: () => void;
  className?: string;
  variant?: "default" | "destructive";
  disabled?: boolean;
  /** Permission key required to use this action */
  permission?: string;
  /** Hide instead of disabling when no permission */
  hideWhenDenied?: boolean;
}

export interface ActionGroup {
  items: ActionItem[];
  separator?: boolean;
}

interface CustomActionProps {
  actions: (ActionItem | ActionGroup)[];
  triggerClassName?: string;
  contentAlign?: "start" | "center" | "end";
  triggerVariant?: "ghost" | "outline" | "link";
  disabled?: boolean;
}

export const CustomAction = ({
  actions,
  contentAlign = "end",
  disabled = false,
}: CustomActionProps) => {
  const { hasPermission } = usePermission();

  const renderActionItem = (action: ActionItem) => {
    const Icon = action.icon;
    const isDestructive = action.variant === "destructive";
    const allowed = action.permission ? hasPermission(action.permission) : true;

    if (!allowed && action.hideWhenDenied) return null;

    const item = (
      <Menu.Item
        key={action.id}
        leftSection={<Icon size={16} />}
        onClick={action.onClick}
        disabled={action.disabled || !allowed}
        color={isDestructive ? "red" : undefined}
        styles={{
          item: {
            fontSize: 13,
          },
        }}
      >
        {action.label}
      </Menu.Item>
    );

    if (!allowed) {
      return (
        <Tooltip
          key={action.id}
          label={DEFAULT_DENIAL_REASON}
          withArrow
          position="left"
          withinPortal
        >
          <span style={{ display: "block", cursor: "not-allowed" }}>{item}</span>
        </Tooltip>
      );
    }

    return item;
  };

  const renderActions = () => {
    return actions.map((item, index) => {
      if ("items" in item) {
        const group = item as ActionGroup;
        return (
          <div key={`group-${index}`}>
            {group.items.map(renderActionItem)}
            {group.separator && <Divider my={4} />}
          </div>
        );
      }
      return renderActionItem(item as ActionItem);
    });
  };

  return (
    <Menu
      shadow="sm"
      position={contentAlign === "end" ? "bottom-end" : "bottom-start"}
      withArrow
      arrowPosition="center"
    >
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          size="sm"
          color="gray"
          disabled={disabled}
          styles={{
            root: {
              "&:hover": {
                backgroundColor: "#f8f9fa",
              },
            },
          }}
        >
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown
        styles={{
          dropdown: {
            border: "1px solid #e9ecef",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
      >
        {renderActions()}
      </Menu.Dropdown>
    </Menu>
  );
};

export const createViewAction = (onClick: () => void, permission?: string): ActionItem => ({
  id: "view",
  label: "To'liq ma'lumotlarni ko'rish",
  icon: IconEye,
  onClick,
  permission,
});

export const createEditAction = (onClick: () => void, permission?: string): ActionItem => ({
  id: "edit",
  label: "Tahrirlash",
  icon: IconPencil,
  onClick,
  permission,
});

export const createDeleteAction = (onClick: () => void, permission?: string): ActionItem => ({
  id: "delete",
  label: "O'chirish",
  icon: IconTrash,
  onClick,
  variant: "destructive",
  permission,
});

export const createCopyAction = (onClick: () => void, permission?: string): ActionItem => ({
  id: "copy",
  label: "Nusxalash",
  icon: IconCopy,
  onClick,
  permission,
});

export const createDownloadAction = (onClick: () => void, permission?: string): ActionItem => ({
  id: "download",
  label: "Yuklab olish",
  icon: IconDownload,
  onClick,
  permission,
});
