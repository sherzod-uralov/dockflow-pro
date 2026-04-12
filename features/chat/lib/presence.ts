import { formatDateTime } from "@/lib/date-utils";

/**
 * Foydalanuvchining onlayn holatini matn shaklida formatlash.
 *
 * Qoidalar:
 *  - isOnline === true → "Onlayn"
 *  - isOnline === false && lastSeen → "5 daqiqa oldin faol edi"
 *  - isOnline === false && !lastSeen → "Offline"
 */
export const formatPresence = (isOnline?: boolean, lastSeen?: string | null): string => {
  if (isOnline) return "Onlayn";
  if (!lastSeen) return "Offline";

  const date = new Date(lastSeen);
  const now = Date.now();
  const diff = Math.floor((now - date.getTime()) / 1000);

  if (diff < 60) return "Hozir faol edi";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin faol edi`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin faol edi`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} kun oldin faol edi`;

  return formatDateTime(date);
};
