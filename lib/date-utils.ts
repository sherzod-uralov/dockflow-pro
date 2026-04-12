import { format } from "date-fns";
import { uz } from "date-fns/locale";

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d-MMM yyyy", { locale: uz });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d-MMM yyyy, HH:mm", { locale: uz });
}
