"use client";

import { forwardRef, MouseEvent, ReactNode } from "react";
import { ActionIcon, ActionIconProps, Tooltip } from "@mantine/core";
import { usePermissionCheck, PermissionCheckOptions } from "./use-permission-check";

export interface GuardedActionIconProps
  extends ActionIconProps,
    Omit<PermissionCheckOptions, "denialReason"> {
  denialReason?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Tooltip when allowed (action label) */
  label?: string;
  children: ReactNode;
}

/**
 * Mantine ActionIcon with built-in RBAC support.
 *
 * - Allowed → renders with optional `label` tooltip
 * - Denied → renders disabled with denial tooltip
 *
 * @example
 * <GuardedActionIcon permission="document:delete" label="O'chirish" onClick={handleDelete}>
 *   <IconTrash size={16} />
 * </GuardedActionIcon>
 */
export const GuardedActionIcon = forwardRef<HTMLButtonElement, GuardedActionIconProps>(
  (
    { permission, allOf, anyOf, denialReason, label, disabled, children, ...rest },
    ref,
  ) => {
    const { allowed, reason } = usePermissionCheck({
      permission,
      allOf,
      anyOf,
      denialReason,
    });

    const isDisabled = disabled || !allowed;

    const icon = (
      <ActionIcon ref={ref} {...rest} disabled={isDisabled}>
        {children}
      </ActionIcon>
    );

    const tooltipLabel = !allowed ? reason : label;

    if (!tooltipLabel) return icon;

    return (
      <Tooltip label={tooltipLabel} withArrow position="top" withinPortal>
        {!allowed ? (
          <span style={{ display: "inline-flex", cursor: "not-allowed" }}>
            <span style={{ pointerEvents: "none", display: "inline-flex" }}>
              {icon}
            </span>
          </span>
        ) : (
          icon
        )}
      </Tooltip>
    );
  },
);

GuardedActionIcon.displayName = "GuardedActionIcon";
