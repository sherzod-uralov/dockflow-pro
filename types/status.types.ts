/**
 * Shared status types and utilities
 * DRY principle: Common status patterns used across features
 */

// Generic status option type
export interface StatusOption<T extends string = string> {
    value: T;
    label: string;
    color: string;
}

// Common status values shared across entities
export enum CommonStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    ARCHIVED = "ARCHIVED",
}

// Status color palette - consistent colors across the app
export const STATUS_COLORS = {
    // State colors
    planning: "#9b59b6",
    notStarted: "#95a5a6",
    active: "#3498db",
    inReview: "#f39c12",
    onHold: "#f39c12",
    completed: "#2ecc71",
    cancelled: "#e74c3c",
    archived: "#6c757d",
} as const;

// Helper to create type-safe status options
export function createStatusOptions<T extends string>(
    options: StatusOption<T>[]
): readonly StatusOption<T>[] {
    return options as readonly StatusOption<T>[];
}

// Helper to get status option by value
export function getStatusOption<T extends string>(
    options: readonly StatusOption<T>[],
    value: T
): StatusOption<T> | undefined {
    return options.find((opt) => opt.value === value);
}

// Helper to get status label
export function getStatusLabel<T extends string>(
    options: readonly StatusOption<T>[],
    value: T
): string {
    return getStatusOption(options, value)?.label ?? value;
}

// Helper to get status color
export function getStatusColor<T extends string>(
    options: readonly StatusOption<T>[],
    value: T
): string {
    return getStatusOption(options, value)?.color ?? STATUS_COLORS.notStarted;
}
