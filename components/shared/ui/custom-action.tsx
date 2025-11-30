"use client";

import { Menu, ActionIcon, Divider } from "@mantine/core";
import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
  IconCopy,
  IconDownload,
} from "@tabler/icons-react";
import { ComponentType } from "react";

export interface ActionItem {
  id: string;
  label: string;
  icon: ComponentType<any>;
  onClick: () => void;
  className?: string;
  variant?: "default" | "destructive";
  disabled?: boolean;
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
  const renderActionItem = (action: ActionItem) => {
    const Icon = action.icon;
    const isDestructive = action.variant === "destructive";

    return (
      <Menu.Item
        key={action.id}
        leftSection={<Icon size={16} />}
        onClick={action.onClick}
        disabled={action.disabled}
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

export const createViewAction = (onClick: () => void): ActionItem => ({
  id: "view",
  label: "To'liq ma'lumotlarni ko'rish",
  icon: IconEye,
  onClick,
});

export const createEditAction = (onClick: () => void): ActionItem => ({
  id: "edit",
  label: "Tahrirlash",
  icon: IconPencil,
  onClick,
});

export const createDeleteAction = (onClick: () => void): ActionItem => ({
  id: "delete",
  label: "O'chirish",
  icon: IconTrash,
  onClick,
  variant: "destructive",
});

export const createCopyAction = (onClick: () => void): ActionItem => ({
  id: "copy",
  label: "Nusxalash",
  icon: IconCopy,
  onClick,
});

export const createDownloadAction = (onClick: () => void): ActionItem => ({
  id: "download",
  label: "Yuklab olish",
  icon: IconDownload,
  onClick,
});
