import type { Importance, ScheduleStatus, Urgency } from "../types/domain";

export const importanceLabels: Record<Importance, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export const urgencyLabels: Record<Urgency, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export const statusLabels: Record<ScheduleStatus, string> = {
  pending: "待处理",
  in_progress: "进行中",
  completed: "已完成",
  cancelled: "已取消",
};
