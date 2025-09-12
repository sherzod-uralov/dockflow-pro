import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EllipsisVertical,
  LucideIcon,
  Eye,
  Pencil,
  Trash,
  Copy,
  Download,
} from "lucide-react";

export interface ActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
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
  triggerClassName = "h-8 w-8 p-0",
  contentAlign = "end",
  triggerVariant = "ghost",
  disabled = false,
}: CustomActionProps) => {
  const renderActionItem = (action: ActionItem) => {
    const Icon = action.icon;
    const baseClassName =
      "group cursor-pointer hover:text-white focus:text-white";
    const variantClassName =
      action.variant === "destructive"
        ? "text-red-600 hover:bg-red-600 focus:bg-red-600"
        : "";

    return (
      <DropdownMenuItem
        key={action.id}
        className={`${baseClassName} ${variantClassName} ${action.className || ""}`}
        onClick={action.onClick}
        disabled={action.disabled}
      >
        <Icon className="mr-2 h-4 w-4 group-hover:text-text-on-dark" />
        {action.label}
      </DropdownMenuItem>
    );
  };

  const renderActions = () => {
    return actions.map((item, index) => {
      if ("items" in item) {
        const group = item as ActionGroup;
        return (
          <div key={`group-${index}`}>
            {group.items.map(renderActionItem)}
            {group.separator && <DropdownMenuSeparator />}
          </div>
        );
      }
      return renderActionItem(item as ActionItem);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={triggerVariant}
          className={triggerClassName}
          disabled={disabled}
        >
          <span className="sr-only">Amallar menyusini ochish</span>
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={contentAlign}>
        {renderActions()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createViewAction = (onClick: () => void): ActionItem => ({
  id: "view",
  label: "To'liq ma'lumotlarni ko'rish",
  icon: Eye,
  onClick,
});

export const createEditAction = (onClick: () => void): ActionItem => ({
  id: "edit",
  label: "Tahrirlash",
  icon: Pencil,
  onClick,
});

export const createDeleteAction = (onClick: () => void): ActionItem => ({
  id: "delete",
  label: "O'chirish",
  icon: Trash,
  onClick,
  variant: "destructive",
});

export const createCopyAction = (onClick: () => void): ActionItem => ({
  id: "copy",
  label: "Nusxalash",
  icon: Copy,
  onClick,
});

export const createDownloadAction = (onClick: () => void): ActionItem => ({
  id: "download",
  label: "Yuklab olish",
  icon: Download,
  onClick,
});
