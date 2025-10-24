/**
 * Format date to DD.MM.YYYY HH:mm format
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Format date to DD.MM.YYYY format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}.${month}.${year}`;
}

/**
 * Convert DD.MM.YYYY format to ISO string
 */
export function parseDate(dateStr: string): string {
  const [day, month, year] = dateStr.split(".");
  return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
}

/**
 * Get current date/time in ISO format
 */
export function getCurrentDateTime(): string {
  return new Date().toISOString();
}
