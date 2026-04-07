"use client";

import { ReactNode } from "react";
import { usePermissionCheck, PermissionCheckOptions } from "./use-permission-check";

interface PermissionGateProps extends PermissionCheckOptions {
  /** Content rendered when allowed */
  children: ReactNode;
  /** Optional content rendered when not allowed (default: nothing) */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on user permissions.
 * Use this to COMPLETELY HIDE elements (sections, menu items, columns).
 *
 * For buttons that should remain visible but disabled with a tooltip,
 * use <GuardedButton /> or <GuardedActionIcon /> instead.
 *
 * @example
 * <PermissionGate permission="document:create">
 *   <CreateDocumentButton />
 * </PermissionGate>
 *
 * @example
 * <PermissionGate anyOf={["document:update", "document:delete"]}>
 *   <ActionsMenu />
 * </PermissionGate>
 */
export const PermissionGate = ({
  children,
  fallback = null,
  ...check
}: PermissionGateProps) => {
  const { allowed } = usePermissionCheck(check);
  return <>{allowed ? children : fallback}</>;
};
