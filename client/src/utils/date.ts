import { format, isToday, isValid, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

export function formatDateTime(value?: string | null) {
  if (!value) return "未设置日期";
  const date = parseISO(value);
  return isValid(date) ? format(date, "yyyy年M月d日 HH:mm", { locale: zhCN }) : "日期无效";
}

export function formatDate(value?: string | null) {
  if (!value) return "未设置日期";
  const date = parseISO(value);
  return isValid(date) ? format(date, "yyyy年M月d日", { locale: zhCN }) : "日期无效";
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
