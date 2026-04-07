"use client";

import { forwardRef, MouseEvent } from "react";
import { Button, ButtonProps, Tooltip } from "@mantine/core";
import { usePermissionCheck, PermissionCheckOptions } from "./use-permission-check";

export interface GuardedButtonProps
  extends ButtonProps,
    Omit<PermissionCheckOptions, "denialReason"> {
  /** Override default denial tooltip */
  denialReason?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  /** Loading state from upstream (e.g. mutation.isLoading) */
  loading?: boolean;
}

/**
 * Mantine Button with built-in RBAC support.
 *
 * - When user has permission → renders normally
 * - When user lacks permission → renders disabled with tooltip
 *
 * @example
 * <GuardedButton permission="document:create" onClick={handleCreate}>
 *   Yangi hujjat
 * </GuardedButton>
 *
 * @example
 * <GuardedButton anyOf={["document:update", "document:delete"]} ...>
 *   Boshqarish
 * </GuardedButton>
 */
export const GuardedButton = forwardRef<HTMLButtonElement, GuardedButtonProps>(
  (
    { permission, allOf, anyOf, denialReason, disabled, ...rest },
    ref,
  ) => {
    const { allowed, reason } = usePermissionCheck({
      permission,
      allOf,
      anyOf,
      denialReason,
    });

    const isDisabled = disabled || !allowed;
    const button = <Button ref={ref} {...rest} disabled={isDisabled} />;

    if (!allowed) {
      // Wrap in span so disabled button still receives hover events
      return (
        <Tooltip label={reason} withArrow position="top" withinPortal>
          <span style={{ display: "inline-flex", cursor: "not-allowed" }}>
            <span style={{ pointerEvents: "none", display: "inline-flex" }}>
              {button}
            </span>
          </span>
        </Tooltip>
      );
    }

    return button;
  },
);

GuardedButton.displayName = "GuardedButton";
