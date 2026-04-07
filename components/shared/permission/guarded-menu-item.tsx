"use client";

import { ReactNode, MouseEvent } from "react";
import { Menu, MenuItemProps, Tooltip } from "@mantine/core";
import { usePermissionCheck, PermissionCheckOptions } from "./use-permission-check";

export interface GuardedMenuItemProps
  extends MenuItemProps,
    Omit<PermissionCheckOptions, "denialReason"> {
  denialReason?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** When user lacks permission, hide the item completely instead of disabling */
  hideWhenDenied?: boolean;
  children: ReactNode;
}

/**
 * Mantine Menu.Item with built-in RBAC support.
 *
 * @example
 * <Menu.Dropdown>
 *   <GuardedMenuItem permission="document:update" leftSection={<IconEdit />}>
 *     Tahrirlash
 *   </GuardedMenuItem>
 * </Menu.Dropdown>
 */
export const GuardedMenuItem = ({
  permission,
  allOf,
  anyOf,
  denialReason,
  hideWhenDenied = false,
  disabled,
  children,
  ...rest
}: GuardedMenuItemProps) => {
  const { allowed, reason } = usePermissionCheck({
    permission,
    allOf,
    anyOf,
    denialReason,
  });

  if (!allowed && hideWhenDenied) return null;

  const isDisabled = disabled || !allowed;
  const item = (
    <Menu.Item {...rest} disabled={isDisabled}>
      {children}
    </Menu.Item>
  );

  if (!allowed) {
    return (
      <Tooltip label={reason} withArrow position="left" withinPortal>
        <span style={{ display: "block", cursor: "not-allowed" }}>{item}</span>
      </Tooltip>
    );
  }

  return item;
};
