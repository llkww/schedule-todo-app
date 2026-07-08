import { z } from "zod";

import { AppError } from "./errors.js";
import { importanceValues, statusValues, urgencyValues } from "../constants/scheduleEnums.js";

export const riskLevelSchema = z.enum(["low", "medium", "high"]);

export const draftMissingFieldValues = [
  "title",
  "description",
  "startTime",
  "endTime",
  "dueTime",
  "importance",
  "urgency",
  "status",
  "tags",
] as const;

export const draftMissingFieldSchema = z.enum(draftMissingFieldValues);

function textField(maxLength: number, fallback: string) {
  return z.preprocess((value) => {
    const raw = value === null || value === undefined ? fallback : String(value);
    const text = raw.trim() || fallback;
    return text.length > maxLength ? text.slice(0, maxLength) : text;
  }, z.string().min(1).max(maxLength));
}

function optionalTextField(maxLength: number) {
  return z.preprocess((value) => {
    if (value === null || value === undefined) return "";
    const text = String(value).trim();
    return text.length > maxLength ? text.slice(0, maxLength) : text;
  }, z.string().max(maxLength));
}

function arrayField<T extends z.ZodTypeAny>(itemSchema: T, maxLength: number) {
  return z.preprocess((value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === "") return [];
    return [value];
  }, z.array(itemSchema).max(maxLength));
}

const riskLevelInputSchema = z.preprocess((value) => {
  if (typeof value !== "string") return "medium";
  const normalized = value.trim().toLowerCase();
  const map: Record<string, "low" | "medium" | "high"> = {
    low: "low",
    medium: "medium",
    high: "high",
    moderate: "medium",
    "低": "low",
    "低风险": "low",
    "中": "medium",
    "中风险": "medium",
    "中等": "medium",
    "中等风险": "medium",
    "高": "high",
    "高风险": "high",
  };

  if (normalized.includes("高") || normalized.includes("high")) return "high";
  if (normalized.includes("中") || normalized.includes("medium") || normalized.includes("moderate")) {
    return "medium";
  }
  if (normalized.includes("低") || normalized.includes("low")) return "low";

  return map[normalized] ?? normalized;
}, riskLevelSchema);

const warningTypeSchema = z.preprocess((value) => {
  if (typeof value !== "string") return "workload";
  const normalized = value.trim().toLowerCase();
  const map: Record<string, "overdue" | "conflict" | "workload" | "deadline"> = {
    overdue: "overdue",
    conflict: "conflict",
    workload: "workload",
    deadline: "deadline",
    priority: "deadline",
    time: "deadline",
    "逾期": "overdue",
    "过期": "overdue",
    "冲突": "conflict",
    "时间冲突": "conflict",
    "负载": "workload",
    "工作量": "workload",
    "任务量": "workload",
    "截止": "deadline",
    "截止时间": "deadline",
    "提醒": "deadline",
  };

  if (normalized.includes("冲突")) return "conflict";
  if (normalized.includes("逾期") || normalized.includes("过期") || normalized.includes("overdue")) {
    return "overdue";
  }
  if (normalized.includes("截止") || normalized.includes("提醒") || normalized.includes("deadline")) {
    return "deadline";
  }
  if (normalized.includes("负载") || normalized.includes("任务量") || normalized.includes("workload")) {
    return "workload";
  }

  return map[normalized] ?? "workload";
}, z.enum(["overdue", "conflict", "workload", "deadline"]));

const importanceInputSchema = z.preprocess((value) => {
  if (typeof value !== "string") return "medium";
  const normalized = value.trim().toLowerCase();
  const map: Record<string, "low" | "medium" | "high"> = {
    low: "low",
    medium: "medium",
    high: "high",
    normal: "medium",
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    "低": "low",
    "中": "medium",
    "高": "high",
    "普通": "medium",
    "一般": "medium",
    "无": "medium",
  };
  return map[value.trim()] ?? map[normalized] ?? "medium";
}, z.enum(importanceValues));

const urgencyInputSchema = z.preprocess((value) => {
  if (typeof value !== "string") return "medium";
  const normalized = value.trim().toLowerCase();
  const map: Record<string, "low" | "medium" | "high"> = {
    low: "low",
    medium: "medium",
    high: "high",
    normal: "medium",
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    "低": "low",
    "中": "medium",
    "高": "high",
    "普通": "medium",
    "一般": "medium",
    "无": "medium",
  };
  return map[value.trim()] ?? map[normalized] ?? "medium";
}, z.enum(urgencyValues));

const statusInputSchema = z.preprocess((value) => {
  if (typeof value !== "string") return "pending";
  const normalized = value.trim().toLowerCase();
  const map: Record<string, "pending" | "in_progress" | "completed" | "cancelled"> = {
    pending: "pending",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled",
    todo: "pending",
    open: "pending",
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    "待处理": "pending",
    "待办": "pending",
    "未开始": "pending",
    "进行中": "in_progress",
    "已完成": "completed",
    "已取消": "cancelled",
  };
  return map[value.trim()] ?? map[normalized] ?? "pending";
}, z.enum(statusValues));

const relatedTaskIdsSchema = arrayField(textField(160, "未关联日程"), 20);

function normalizeMissingField(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  const map: Record<string, (typeof draftMissingFieldValues)[number]> = {
    title: "title",
    description: "description",
    startTime: "startTime",
    endTime: "endTime",
    dueTime: "dueTime",
    importance: "importance",
    urgency: "urgency",
    status: "status",
    tags: "tags",
    tag: "tags",
    labels: "tags",
    label: "tags",
    "标题": "title",
    "名称": "title",
    "任务标题": "title",
    "描述": "description",
    "备注": "description",
    "任务描述": "description",
    "开始": "startTime",
    "开始时间": "startTime",
    "结束": "endTime",
    "结束时间": "endTime",
    "截止": "dueTime",
    "截止时间": "dueTime",
    "时间": "startTime",
    "重要": "importance",
    "重要程度": "importance",
    "紧急": "urgency",
    "紧急程度": "urgency",
    "状态": "status",
    "标签": "tags",
  };

  return map[normalized] ?? null;
}

const missingFieldsSchema = z.preprocess((value) => {
  const values = Array.isArray(value) ? value : value === null || value === undefined || value === "" ? [] : [value];
  const normalized = values
    .map((item) => normalizeMissingField(item))
    .filter((item): item is (typeof draftMissingFieldValues)[number] => Boolean(item));
  return [...new Set(normalized)].slice(0, draftMissingFieldValues.length);
}, z.array(draftMissingFieldSchema).max(draftMissingFieldValues.length));

const confidenceSchema = z.preprocess((value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0.5;
  if (numeric > 1 && numeric <= 100) return numeric / 100;
  return numeric;
}, z.number().min(0).max(1));

export const todayPlanResponseSchema = z.object({
  overview: textField(2000, "我整理好了今天可以优先推进的安排。"),
  recommendedTasks: arrayField(
    z.object({
      taskId: textField(160, "未关联日程"),
      title: textField(160, "未命名日程"),
      suggestedTimeRange: textField(120, "今天"),
      priorityReason: textField(600, "这件事适合优先处理。"),
      riskLevel: riskLevelInputSchema.default("medium"),
      actionSuggestion: textField(600, "先从最清晰的一步开始。"),
    }),
    20,
  ),
  warnings: arrayField(
    z.object({
      type: warningTypeSchema,
      message: textField(600, "请留意今天的任务节奏。"),
      relatedTaskIds: relatedTaskIdsSchema,
    }),
    20,
  ),
  productivityTip: textField(800, "先完成一件最重要的小事，再继续推进下一项。"),
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
  .preprocess((value) => value ?? null, z.union([z.string().trim(), z.null()]))
  .transform((value) => {
    if (value === null || value === "") {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  });

export const parseTaskResponseSchema = z.object({
  title: optionalTextField(120),
  description: optionalTextField(2000).default(""),
  startTime: nullableIsoStringSchema,
  endTime: nullableIsoStringSchema,
  dueTime: nullableIsoStringSchema,
  importance: importanceInputSchema.default("medium"),
  urgency: urgencyInputSchema.default("medium"),
  status: statusInputSchema.default("pending"),
  suggestedTags: arrayField(z.string().trim().min(1).max(40), 10).default([]),
  confidence: confidenceSchema.default(0.5),
  clarifyingQuestions: arrayField(z.string().trim().min(1).max(240), 20).default([]),
  missingFields: missingFieldsSchema.default([]),
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
    const jsonText = extractJsonText(content).replace(/,\s*([}\]])/g, "$1");
    const parsed = JSON.parse(jsonText) as unknown;
    return schema.parse(parsed);
  } catch {
    throw new AppError(502, "AI_RESPONSE_INVALID", "这次智能规划没有整理成功，请稍后重试");
  }
}

export type TodayPlanResponse = z.infer<typeof todayPlanResponseSchema>;
export type ExplainResponse = z.infer<typeof explainResponseSchema>;
export type ParseTaskResponse = z.infer<typeof parseTaskResponseSchema>;
export type SummaryResponse = z.infer<typeof summaryResponseSchema>;
export type ConflictAdviceResponse = z.infer<typeof conflictAdviceResponseSchema>;
export type DraftMissingField = z.infer<typeof draftMissingFieldSchema>;
