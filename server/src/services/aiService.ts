import { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";
import { fromDbValue } from "../constants/scheduleEnums.js";
import { getDeepSeekStatus, callDeepSeekJson } from "./deepseekService.js";
import { notFound } from "../utils/errors.js";
import { buildUserPrompt } from "../utils/aiPromptBuilder.js";
import {
  conflictAdviceResponseSchema,
  explainResponseSchema,
  parseTaskDraftResponseSchema,
  summaryResponseSchema,
  todayPlanResponseSchema,
  type ParseTaskResponse,
} from "../utils/aiResponseParser.js";

const aiScheduleInclude = {
  tags: {
    include: {
      tag: true,
    },
  },
} satisfies Prisma.ScheduleInclude;

type AiScheduleRecord = Prisma.ScheduleGetPayload<{ include: typeof aiScheduleInclude }>;
type SummaryRange = "today" | "week";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toIso(value?: Date | null) {
  return value ? value.toISOString() : null;
}

function summarizeDescription(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.length > 320 ? `${value.slice(0, 320)}...` : value;
}

function pickPlanningSchedules(schedules: AiScheduleRecord[]) {
  const now = Date.now();

  return [...schedules]
    .sort((left, right) => {
      const leftDue = left.dueTime?.getTime() ?? Number.POSITIVE_INFINITY;
      const rightDue = right.dueTime?.getTime() ?? Number.POSITIVE_INFINITY;
      const leftUrgency = left.urgency === "HIGH" ? 0 : left.urgency === "MEDIUM" ? 1 : 2;
      const rightUrgency = right.urgency === "HIGH" ? 0 : right.urgency === "MEDIUM" ? 1 : 2;
      const leftImportance = left.importance === "HIGH" ? 0 : left.importance === "MEDIUM" ? 1 : 2;
      const rightImportance = right.importance === "HIGH" ? 0 : right.importance === "MEDIUM" ? 1 : 2;
      const leftOverdue = leftDue < now ? 0 : 1;
      const rightOverdue = rightDue < now ? 0 : 1;

      return (
        leftOverdue - rightOverdue ||
        leftDue - rightDue ||
        leftUrgency - rightUrgency ||
        leftImportance - rightImportance ||
        right.createdAt.getTime() - left.createdAt.getTime()
      );
    })
    .slice(0, 16);
}

function presentAiSchedule(schedule: AiScheduleRecord) {
  return {
    id: schedule.id,
    title: schedule.title,
    description: summarizeDescription(schedule.description),
    startTime: toIso(schedule.startTime),
    endTime: toIso(schedule.endTime),
    dueTime: toIso(schedule.dueTime),
    completed: schedule.completed,
    importance: fromDbValue<"LOW" | "MEDIUM" | "HIGH">(schedule.importance),
    urgency: fromDbValue<"LOW" | "MEDIUM" | "HIGH">(schedule.urgency),
    status: fromDbValue<"PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED">(
      schedule.status,
    ),
    tags: schedule.tags.map(({ tag }) => tag.name),
    createdAt: schedule.createdAt.toISOString(),
    updatedAt: schedule.updatedAt.toISOString(),
  };
}

async function getUserTags(userId: string) {
  return prisma.tag.findMany({
    where: { userId },
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  });
}

function countSummary(schedules: AiScheduleRecord[]) {
  const now = new Date();
  return {
    completedCount: schedules.filter((schedule) => schedule.completed).length,
    pendingCount: schedules.filter((schedule) => !schedule.completed).length,
    overdueCount: schedules.filter(
      (schedule) => !schedule.completed && schedule.dueTime && schedule.dueTime < now,
    ).length,
    highPriorityCount: schedules.filter(
      (schedule) => !schedule.completed && schedule.importance === "HIGH",
    ).length,
  };
}

function findTimeConflicts(schedules: AiScheduleRecord[]) {
  const withTime = schedules
    .filter((schedule) => schedule.startTime && schedule.endTime)
    .sort((a, b) => Number(a.startTime) - Number(b.startTime));
  const conflicts: Array<{
    taskIds: string[];
    conflictTimeRange: string;
    tasks: ReturnType<typeof presentAiSchedule>[];
  }> = [];

  for (let index = 0; index < withTime.length; index += 1) {
    const current = withTime[index];
    if (!current?.startTime || !current.endTime) continue;

    for (let nextIndex = index + 1; nextIndex < withTime.length; nextIndex += 1) {
      const next = withTime[nextIndex];
      if (!next?.startTime || !next.endTime) continue;

      if (next.startTime >= current.endTime) {
        break;
      }

      const rangeStart = new Date(Math.max(current.startTime.getTime(), next.startTime.getTime()));
      const rangeEnd = new Date(Math.min(current.endTime.getTime(), next.endTime.getTime()));
      conflicts.push({
        taskIds: [current.id, next.id],
        conflictTimeRange: `${rangeStart.toISOString()} - ${rangeEnd.toISOString()}`,
        tasks: [presentAiSchedule(current), presentAiSchedule(next)],
      });
    }
  }

  return conflicts.slice(0, 20);
}

function extractHour(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match?.[1] ? Number(match[1]) : NaN;
    if (Number.isInteger(value) && value >= 0 && value <= 23) {
      return value;
    }
  }

  return null;
}

function shanghaiHour(date: Date) {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return Number(hour);
}

function correctShanghaiTime(value: string | null, intendedHour: number | null) {
  if (!value || intendedHour === null) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  if (shanghaiHour(date) !== intendedHour && date.getUTCHours() === intendedHour) {
    return new Date(date.getTime() - 8 * 60 * 60 * 1000).toISOString();
  }

  return value;
}

function normalizeParsedDraftTimes(draft: ParseTaskResponse, text: string): ParseTaskResponse {
  const startHour = extractHour(text, [
    /开始时间\s*(\d{1,2})(?:[:：点时])?/,
    /(?:从|自)\s*(\d{1,2})(?:[:：点时])?/,
    /(\d{1,2})(?:[:：点时])\s*(?:到|至|-|—)\s*\d{1,2}/,
  ]);
  const endHour = extractHour(text, [
    /结束时间(?:和截止时间)?\s*(\d{1,2})(?:[:：点时])?/,
    /(?:到|至|直到)\s*(\d{1,2})(?:[:：点时])?/,
    /\d{1,2}(?:[:：点时])\s*(?:到|至|-|—)\s*(\d{1,2})/,
  ]);
  const dueHour = extractHour(text, [
    /截止时间\s*(\d{1,2})(?:[:：点时])?/,
    /结束时间和截止时间\s*(\d{1,2})(?:[:：点时])?/,
    /最晚\s*(\d{1,2})(?:[:：点时])?/,
  ]);

  return {
    ...draft,
    startTime: correctShanghaiTime(draft.startTime, startHour),
    endTime: correctShanghaiTime(draft.endTime, endHour),
    dueTime: correctShanghaiTime(draft.dueTime, dueHour ?? endHour),
  };
}

export function getAiPlannerStatus() {
  return getDeepSeekStatus();
}

export async function generateTodayPlan(userId: string) {
  const [schedules, tags] = await Promise.all([
    prisma.schedule.findMany({
      where: {
        userId,
        completed: false,
        status: { not: "CANCELLED" },
      },
      include: aiScheduleInclude,
      orderBy: [{ dueTime: "asc" }, { createdAt: "desc" }],
      take: 50,
    }),
    getUserTags(userId),
  ]);
  const planningSchedules = pickPlanningSchedules(schedules);

  return callDeepSeekJson({
    schema: todayPlanResponseSchema,
    userPrompt: buildUserPrompt(
      "基于当前用户未完成任务生成今日智能计划。只围绕 data.schedules 中存在的任务，最多推荐 5 个任务、3 条提醒。字段必须短、自然、适合直接展示给用户。",
      {
        overview: "string",
        recommendedTasks: [
          {
            taskId: "string",
            title: "string",
            suggestedTimeRange: "string",
            priorityReason: "string",
            riskLevel: "low | medium | high",
            actionSuggestion: "string",
          },
        ],
        warnings: [
          {
            type: "overdue | conflict | workload | deadline",
            message: "string",
            relatedTaskIds: ["string"],
          },
        ],
        productivityTip: "string",
      },
      {
        currentDate: new Date().toISOString(),
        schedules: planningSchedules.map(presentAiSchedule),
        tags: tags.map((tag) => ({ name: tag.name })),
      },
    ),
  });
}

export async function explainSchedulePriority(userId: string, scheduleId: string) {
  const [schedule, tags] = await Promise.all([
    prisma.schedule.findFirst({
      where: { id: scheduleId, userId },
      include: aiScheduleInclude,
    }),
    getUserTags(userId),
  ]);

  if (!schedule) {
    throw notFound("日程不存在");
  }

  return callDeepSeekJson({
    schema: explainResponseSchema,
    userPrompt: buildUserPrompt(
      "解释这个任务为什么重要、为什么应该优先处理或为什么可以延后。",
      {
        taskId: "string",
        title: "string",
        explanation: "string",
        factors: ["string"],
        suggestedAction: "string",
        riskLevel: "low | medium | high",
      },
      {
        currentDate: new Date().toISOString(),
        schedule: presentAiSchedule(schedule),
        tags: tags.map((tag) => ({ name: tag.name })),
      },
    ),
  });
}

export async function parseTaskDraft(userId: string, text: string) {
  const tags = await getUserTags(userId);

  const draft = await callDeepSeekJson({
    schema: parseTaskDraftResponseSchema,
    userPrompt: buildUserPrompt(
      [
        "把用户输入的自然语言解析为日程草稿。只生成草稿，不要创建、修改或删除数据库记录。",
        "用户必须一次性说明这些字段后才算完整：待办事项内容、startTime、endTime、dueTime、importance、urgency。",
        "待办事项内容写入 title。description 可为空字符串，status 固定为 pending，suggestedTags 可为空数组。",
        "未被用户明确提供的必填字段，必须放入 missingFields。",
        "不要为了通过校验而自行默认填 startTime、endTime、dueTime、importance 或 urgency；只有用户明确表达后才可视为已确认。",
        "不要继续追问用户。信息不足时 clarifyingQuestions 返回空数组，由前端提示用户重新输入。",
        "用户未说明时区时，一律按 Asia/Shanghai（UTC+08:00）理解；例如 14 点应输出 14:00+08:00 或等价 UTC 06:00Z。",
        "不确定的日期填 null，所有日期都使用 ISO 字符串。",
      ].join(" "),
      {
        title: "string",
        description: "string",
        startTime: "ISO string | null",
        endTime: "ISO string | null",
        dueTime: "ISO string | null",
        importance: "low | medium | high",
        urgency: "low | medium | high",
        status: "pending | in_progress | completed | cancelled",
        suggestedTags: ["string"],
        clarifyingQuestions: ["string"],
        missingFields: [
          "title | startTime | endTime | dueTime | importance | urgency",
        ],
      },
      {
        currentDate: new Date().toISOString(),
        userText: text,
        existingTags: tags.map((tag) => tag.name),
      },
    ),
  });

  return normalizeParsedDraftTimes(draft, text);
}

export async function generateTaskSummary(userId: string, range: SummaryRange) {
  const now = new Date();
  const from = startOfDay(now);
  const to = range === "today" ? endOfDay(now) : endOfDay(addDays(now, 6));

  const schedules = await prisma.schedule.findMany({
    where: {
      userId,
      OR: [
        { startTime: { gte: from, lte: to } },
        { dueTime: { gte: from, lte: to } },
        { updatedAt: { gte: from, lte: to } },
      ],
    },
    include: aiScheduleInclude,
    orderBy: [{ dueTime: "asc" }, { updatedAt: "desc" }],
    take: 80,
  });
  const counts = countSummary(schedules);

  const aiSummary = await callDeepSeekJson({
    schema: summaryResponseSchema,
    userPrompt: buildUserPrompt(
      "生成今日或本周任务总结，指出完成情况、标签洞察、下一步建议和下一个专注点。",
      {
        range: "today | week",
        summary: "string",
        completedCount: "number",
        pendingCount: "number",
        overdueCount: "number",
        highPriorityCount: "number",
        tagInsights: ["string"],
        suggestions: ["string"],
        nextFocus: "string",
      },
      {
        currentDate: now.toISOString(),
        range,
        computedCounts: counts,
        schedules: schedules.map(presentAiSchedule),
      },
    ),
  });

  return {
    ...aiSummary,
    range,
    ...counts,
  };
}

export async function generateConflictAdvice(userId: string) {
  const schedules = await prisma.schedule.findMany({
    where: {
      userId,
      completed: false,
      status: { not: "CANCELLED" },
      startTime: { not: null },
      endTime: { not: null },
    },
    include: aiScheduleInclude,
    orderBy: [{ startTime: "asc" }],
    take: 80,
  });
  const baseConflicts = findTimeConflicts(schedules);

  if (baseConflicts.length === 0) {
    return {
      conflictCount: 0,
      conflicts: [],
    };
  }

  const advice = await callDeepSeekJson({
    schema: conflictAdviceResponseSchema,
    userPrompt: buildUserPrompt(
      "基于检测到的时间重叠任务对，生成时间冲突调整建议。不要直接修改任务时间。",
      {
        conflictCount: "number",
        conflicts: [
          {
            taskIds: ["string"],
            conflictTimeRange: "string",
            explanation: "string",
            adjustmentSuggestion: "string",
            priorityRecommendation: "string",
          },
        ],
      },
      {
        currentDate: new Date().toISOString(),
        detectedConflicts: baseConflicts,
      },
    ),
  });

  return {
    ...advice,
    conflictCount: baseConflicts.length,
  };
}
