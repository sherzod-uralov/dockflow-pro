/**
 * Universal RBAC (Role-Based Access Control) components.
 *
 * Usage:
 * - <PermissionGate permission="..."> — completely hide elements
 * - <GuardedButton permission="..."> — show but disable + tooltip
 * - <GuardedActionIcon permission="..."> — same for ActionIcon
 * - <GuardedMenuItem permission="..."> — same for Menu.Item
 * - usePermissionCheck("...") — for custom components
 *
 * Backend permission keys: "resource:action" (e.g. "document:create")
 */
export { PermissionGate } from "./permission-gate";
export { GuardedButton } from "./guarded-button";
export { GuardedActionIcon } from "./guarded-action-icon";
export { GuardedMenuItem } from "./guarded-menu-item";
export {
  usePermissionCheck,
  DEFAULT_DENIAL_REASON,
} from "./use-permission-check";
export type {
  PermissionCheckOptions,
  PermissionCheckResult,
} from "./use-permission-check";
export type { GuardedButtonProps } from "./guarded-button";
export type { GuardedActionIconProps } from "./guarded-action-icon";
export type { GuardedMenuItemProps } from "./guarded-menu-item";
