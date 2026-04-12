/**
 * Markazlashtirilgan rang tizimi — DockFlow Pro
 *
 * Barcha hardcoded ranglar shu fayldan import qilinishi kerak.
 * Yangi rang qo'shish kerak bo'lsa — shu yerga qo'shing.
 */

// ─── Brand / UI Colors ──────────────────────────────────────────────

export const colors = {
  // Primary
  primary: "#1e3a5f",
  primaryHover: "#162d4a",
  primaryLight: "#e7f5ff",

  // Background
  bg: "#f8f9fa",
  bgSubtle: "#f1f3f5",

  // Border
  border: "#e9ecef",
  borderLight: "#dee2e6",
  borderDark: "#ced4da",

  // Text
  textPrimary: "#212529",
  textSecondary: "#495057",
  textDimmed: "#868e96",
  textMuted: "#adb5bd",

  // Status semantic
  success: "#2ecc71",
  successDark: "#2b8a3e",
  successLight: "#ebfbee",
  successBg: "#d3f9d8",

  warning: "#f39c12",
  warningDark: "#e67700",
  warningLight: "#fff3bf",
  warningBg: "#ffe8cc",

  error: "#e74c3c",
  errorDark: "#c92a2a",
  errorLight: "#fff5f5",
  errorBg: "#ffe3e3",

  info: "#3498db",
  infoDark: "#1971c2",
  infoLight: "#e7f5ff",
  infoBg: "#d0ebff",

  // Misc
  white: "#ffffff",
  black: "#000000",

  // Stamp
  stampGreen: "#059669",
  stampBg: "#ecfdf5",
  stampText: "#1f2937",
} as const;

// ─── Document Status ────────────────────────────────────────────────

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
}

export const DOCUMENT_STATUS: Record<string, StatusConfig> = {
  DRAFT: { label: "Tayyorlanmoqda", color: "#495057", bg: "#f1f3f5" },
  PENDING: { label: "Jarayonda", color: "#e67700", bg: "#fff3bf" },
  IN_REVIEW: { label: "Tekshiruvda", color: "#1971c2", bg: "#d0ebff" },
  APPROVED: { label: "Tasdiqlangan", color: "#2b8a3e", bg: "#ebfbee" },
  REJECTED: { label: "Rad etilgan", color: "#c92a2a", bg: "#fff5f5" },
  PUBLISHED: { label: "Chop etilgan", color: "#2b8a3e", bg: "#ebfbee" },
  ARCHIVED: { label: "Arxivlangan", color: "#868e96", bg: "#f1f3f5" },
};

// ─── Workflow Status ────────────────────────────────────────────────

export const WORKFLOW_STATUS: Record<string, StatusConfig> = {
  DRAFT: { label: "Tayyorlanmoqda", color: "#868e96", bg: "#f8f9fa" },
  ACTIVE: { label: "Faol", color: "#1971c2", bg: "#e7f5ff" },
  COMPLETED: { label: "Tugallangan", color: "#2b8a3e", bg: "#ebfbee" },
  CANCELLED: { label: "Bekor qilingan", color: "#c92a2a", bg: "#fff5f5" },
  PAUSED: { label: "To'xtatilgan", color: "#e67700", bg: "#fff3bf" },
  VERIFIED: { label: "Tasdiqlangan", color: "#2b8a3e", bg: "#ebfbee" },
};

// ─── Workflow Step Status ───────────────────────────────────────────

export const WORKFLOW_STEP_STATUS: Record<string, StatusConfig> = {
  NOT_STARTED: { label: "Boshlanmagan", color: "#868e96", bg: "#f1f3f5" },
  PENDING: { label: "Kutilmoqda", color: "#868e96", bg: "#f1f3f5" },
  IN_PROGRESS: { label: "Jarayonda", color: "#1971c2", bg: "#e7f5ff" },
  COMPLETED: { label: "Bajarildi", color: "#2b8a3e", bg: "#ebfbee" },
  REJECTED: { label: "Rad etildi", color: "#c92a2a", bg: "#fff5f5" },
};

// ─── Project Status ─────────────────────────────────────────────────

export const PROJECT_STATUS: Record<string, StatusConfig> = {
  PLANNING: { label: "Rejalashtirish", color: "#9b59b6", bg: "#f3f0ff" },
  ACTIVE: { label: "Faol", color: "#1971c2", bg: "#e7f5ff" },
  ON_HOLD: { label: "To'xtatilgan", color: "#e67700", bg: "#fff3bf" },
  COMPLETED: { label: "Yakunlangan", color: "#2b8a3e", bg: "#ebfbee" },
  CANCELLED: { label: "Bekor qilingan", color: "#c92a2a", bg: "#fff5f5" },
  ARCHIVED: { label: "Arxivlangan", color: "#868e96", bg: "#f1f3f5" },
};

// ─── Task Priority ──────────────────────────────────────────────────

export const TASK_PRIORITY: Record<string, StatusConfig> = {
  LOW: { label: "Past", color: "#95a5a6", bg: "#f1f3f5" },
  MEDIUM: { label: "O'rta", color: "#3498db", bg: "#e7f5ff" },
  HIGH: { label: "Yuqori", color: "#f39c12", bg: "#fff3bf" },
  URGENT: { label: "Shoshilinch", color: "#e74c3c", bg: "#fff5f5" },
  CRITICAL: { label: "Juda muhim", color: "#c0392b", bg: "#ffe3e3" },
};

// ─── KPI Reward Status ──────────────────────────────────────────────

export const KPI_REWARD_STATUS: Record<string, StatusConfig> = {
  PENDING: { label: "Kutilmoqda", color: "#e67700", bg: "#fff3bf" },
  APPROVED: { label: "Tasdiqlangan", color: "#2b8a3e", bg: "#ebfbee" },
  PAID: { label: "To'langan", color: "#1971c2", bg: "#e7f5ff" },
  REJECTED: { label: "Rad etilgan", color: "#c92a2a", bg: "#fff5f5" },
};

// ─── Board Column Default Colors ────────────────────────────────────

export const BOARD_COLUMN_COLORS = {
  new: "#3B82F6",
  inProgress: "#F59E0B",
  inReview: "#8B5CF6",
  done: "#10B981",
} as const;

// ─── Chart Colors ───────────────────────────────────────────────────

export const CHART_COLORS = [
  "#3498db",
  "#2ecc71",
  "#f39c12",
  "#e74c3c",
  "#9b59b6",
  "#1abc9c",
  "#e67e22",
  "#2c3e50",
  "#27ae60",
  "#c0392b",
] as const;

// ─── Helpers ────────────────────────────────────────────────────────

/** Status konfiguratsiyasini olish — topilmasa default qaytaradi */
export function getStatusConfig(
  map: Record<string, StatusConfig>,
  key: string | undefined | null
): StatusConfig {
  if (!key) return { label: "Noma'lum", color: "#868e96", bg: "#f1f3f5" };
  return map[key] || { label: key, color: "#868e96", bg: "#f1f3f5" };
}

/** Mantine Badge uchun color nomi qaytaradi */
export function getStatusMantineColor(
  map: Record<string, StatusConfig>,
  key: string | undefined | null
): string {
  const config = getStatusConfig(map, key);
  // Mantine semantic color mapping
  if (config.color === "#2b8a3e" || config.color === "#2ecc71") return "green";
  if (config.color === "#c92a2a" || config.color === "#e74c3c") return "red";
  if (config.color === "#1971c2" || config.color === "#3498db") return "blue";
  if (config.color === "#e67700" || config.color === "#f39c12") return "yellow";
  if (config.color === "#9b59b6") return "violet";
  if (config.color === "#868e96" || config.color === "#495057") return "gray";
  if (config.color === "#c0392b") return "red";
  if (config.color === "#95a5a6") return "gray";
  return "gray";
}
