import { format, isToday, isValid, parseISO } from "date-fns";

export function formatDateTime(value?: string | null) {
  if (!value) return "No date";
  const date = parseISO(value);
  return isValid(date) ? format(date, "MMM d, yyyy HH:mm") : "Invalid date";
}

export function formatDate(value?: string | null) {
  if (!value) return "No date";
  const date = parseISO(value);
  return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid date";
}

export function isOverdue(value?: string | null, completed = false) {
  if (!value || completed) return false;
  const date = parseISO(value);
  return isValid(date) && date.getTime() < Date.now() && !isToday(date);
}

export function toDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = parseISO(value);
  if (!isValid(date)) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}
