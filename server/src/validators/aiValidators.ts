import { z } from "zod";

export const aiScheduleIdSchema = z.object({
  scheduleId: z.string().min(1, "缺少日程 ID"),
});

export const parseTaskSchema = z.object({
  text: z.string().trim().min(2, "请输入要解析的任务内容").max(1000, "任务描述过长"),
});

export const summarySchema = z.object({
  range: z.enum(["today", "week"]).default("today"),
});

export type ParseTaskInput = z.infer<typeof parseTaskSchema>;
export type SummaryInput = z.infer<typeof summarySchema>;
