import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(date: string | Date, formatStr: string = "dd MMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: fr });
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd MMM yyyy HH:mm");
}
