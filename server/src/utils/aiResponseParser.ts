import { z } from "zod";

import { AppError } from "./errors.js";
import { importanceValues, statusValues, urgencyValues } from "../constants/scheduleEnums.js";

export const riskLevelSchema = z.enum(["low", "medium", "high"]);

const riskLevelInputSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();
  const map: Record<string, "low" | "medium" | "high"> = {
    low: "low",
    medium: "medium",
    high: "high",
    "低": "low",
    "低风险": "low",
    "中": "medium",
    "中风险": "medium",
    "高": "high",
    "高风险": "high",
  };
  return map[normalized] ?? normalized;
}, riskLevelSchema);

const warningTypeSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();
  const map: Record<string, "overdue" | "conflict" | "workload" | "deadline"> = {
    overdue: "overdue",
    conflict: "conflict",
    workload: "workload",
    deadline: "deadline",
    "逾期": "overdue",
    "过期": "overdue",
    "冲突": "conflict",
    "负载": "workload",
    "工作量": "workload",
    "截止": "deadline",
    "截止时间": "deadline",
  };
  return map[normalized] ?? normalized;
}, z.enum(["overdue", "conflict", "workload", "deadline"]));

const importanceInputSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();
  const map: Record<string, "low" | "medium" | "high"> = {
    low: "low",
    medium: "medium",
    high: "high",
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    "低": "low",
    "中": "medium",
    "高": "high",
  };
  return map[value.trim()] ?? map[normalized] ?? normalized;
}, z.enum(importanceValues));

const urgencyInputSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();
  const map: Record<string, "low" | "medium" | "high"> = {
    low: "low",
    medium: "medium",
    high: "high",
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    "低": "low",
    "中": "medium",
    "高": "high",
  };
  return map[value.trim()] ?? map[normalized] ?? normalized;
}, z.enum(urgencyValues));

const statusInputSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();
  const map: Record<string, "pending" | "in_progress" | "completed" | "cancelled"> = {
    pending: "pending",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled",
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    "待处理": "pending",
    "进行中": "in_progress",
    "已完成": "completed",
    "已取消": "cancelled",
  };
  return map[value.trim()] ?? map[normalized] ?? normalized;
}, z.enum(statusValues));

export const todayPlanResponseSchema = z.object({
  overview: z.string().min(1).max(2000),
  recommendedTasks: z
    .array(
      z.object({
        taskId: z.string().min(1).max(160),
        title: z.string().min(1).max(160),
        suggestedTimeRange: z.string().min(1).max(120),
        priorityReason: z.string().min(1).max(600),
        riskLevel: riskLevelInputSchema,
        actionSuggestion: z.string().min(1).max(600),
      }),
    )
    .max(20),
  warnings: z
    .array(
      z.object({
        type: warningTypeSchema,
        message: z.string().min(1).max(600),
        relatedTaskIds: z.array(z.string().min(1).max(160)).max(20),
      }),
    )
    .max(20),
  productivityTip: z.string().min(1).max(800),
});

export const explainResponseSchema = z.object({
  taskId: z.string().min(1).max(160),
  title: z.string().min(1).max(160),
  explanation: z.string().min(1).max(2000),
  factors: z.array(z.string().min(1).max(260)).min(1).max(12),
  suggestedAction: z.string().min(1).max(800),
  riskLevel: riskLevelInputSchema,
});

const nullableIsoStringSchema = z
  .union([z.string().trim(), z.null()])
  .transform((value, ctx) => {
    if (value === null || value === "") {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: "custom", message: "日期格式无效" });
      return z.NEVER;
    }

    return date.toISOString();
  });

export const parseTaskResponseSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  startTime: nullableIsoStringSchema,
  endTime: nullableIsoStringSchema,
  dueTime: nullableIsoStringSchema,
  importance: importanceInputSchema,
  urgency: urgencyInputSchema,
  status: statusInputSchema,
  suggestedTags: z.array(z.string().trim().min(1).max(40)).max(10),
  confidence: z.number().min(0).max(1),
  clarifyingQuestions: z.array(z.string().trim().min(1).max(240)).max(6),
});

export const summaryResponseSchema = z.object({
  range: z.enum(["today", "week"]),
  summary: z.string().min(1).max(2000),
  completedCount: z.number().int().min(0),
  pendingCount: z.number().int().min(0),
  overdueCount: z.number().int().min(0),
  highPriorityCount: z.number().int().min(0),
  tagInsights: z.array(z.string().min(1).max(500)).max(12),
  suggestions: z.array(z.string().min(1).max(500)).max(12),
  nextFocus: z.string().min(1).max(800),
});

export const conflictAdviceResponseSchema = z.object({
  conflictCount: z.number().int().min(0),
  conflicts: z
    .array(
      z.object({
        taskIds: z.array(z.string().min(1).max(160)).min(2).max(6),
        conflictTimeRange: z.string().min(1).max(120),
        explanation: z.string().min(1).max(800),
        adjustmentSuggestion: z.string().min(1).max(800),
        priorityRecommendation: z.string().min(1).max(800),
      }),
    )
    .max(30),
});

function extractJsonText(content: string) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const withoutFence = fenced?.[1]?.trim() ?? trimmed;
  const firstObject = withoutFence.indexOf("{");
  const lastObject = withoutFence.lastIndexOf("}");

  if (firstObject >= 0 && lastObject > firstObject) {
    return withoutFence.slice(firstObject, lastObject + 1);
  }

  return withoutFence;
}

export function parseJsonSafely<T>(content: string, schema: z.ZodSchema<T>): T {
  try {
    const parsed = JSON.parse(extractJsonText(content)) as unknown;
    return schema.parse(parsed);
  } catch {
    throw new AppError(502, "AI_RESPONSE_INVALID", "AI 返回格式无效，请稍后重试");
  }
}

export type TodayPlanResponse = z.infer<typeof todayPlanResponseSchema>;
export type ExplainResponse = z.infer<typeof explainResponseSchema>;
export type ParseTaskResponse = z.infer<typeof parseTaskResponseSchema>;
export type SummaryResponse = z.infer<typeof summaryResponseSchema>;
export type ConflictAdviceResponse = z.infer<typeof conflictAdviceResponseSchema>;
