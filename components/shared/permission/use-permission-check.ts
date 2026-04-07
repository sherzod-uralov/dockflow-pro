"use client";

import { usePermission } from "@/providers/permission-provider";

export interface PermissionCheckOptions {
  /** Single permission key like "document:create" */
  permission?: string;
  /** Multiple permissions — user must have ALL of them */
  allOf?: string[];
  /** Multiple permissions — user must have ANY of them */
  anyOf?: string[];
  /** Custom denial reason (override default) */
  denialReason?: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
}

/** Default Uzbek tooltip when user lacks permission */
export const DEFAULT_DENIAL_REASON = "Bu amalni bajarish uchun ruxsat yo'q";

/**
 * Universal permission checker. Returns { allowed, reason }.
 *
 * @example
 * const { allowed, reason } = usePermissionCheck("document:create");
 * const { allowed } = usePermissionCheck({ anyOf: ["document:update", "document:delete"] });
 */
export const usePermissionCheck = (
  opts: PermissionCheckOptions | string,
): PermissionCheckResult => {
  const { hasPermission } = usePermission();

  const options: PermissionCheckOptions =
    typeof opts === "string" ? { permission: opts } : opts;

  const { permission, allOf, anyOf, denialReason } = options;

  // No permission specified — always allowed (no-op guard)
  const noConstraints = !permission && !allOf?.length && !anyOf?.length;
  if (noConstraints) {
    return { allowed: true, reason: "" };
  }

  const denied = (reason = denialReason || DEFAULT_DENIAL_REASON) => ({
    allowed: false,
    reason,
  });

  if (permission && !hasPermission(permission)) return denied();
  if (allOf && allOf.length > 0 && !allOf.every(hasPermission)) return denied();
  if (anyOf && anyOf.length > 0 && !anyOf.some(hasPermission)) return denied();

  return { allowed: true, reason: "" };
};
