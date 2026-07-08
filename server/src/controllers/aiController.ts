import type { Request, Response } from "express";

import {
  explainSchedulePriority,
  generateConflictAdvice,
  generateTaskSummary,
  generateTodayPlan,
  getAiPlannerStatus,
  parseTaskDraft,
} from "../services/aiService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function status(_req: Request, res: Response) {
  return sendSuccess(res, getAiPlannerStatus());
}

export async function todayPlan(req: Request, res: Response) {
  const result = await generateTodayPlan(req.user!.id);
  return sendSuccess(res, result, "AI 今日计划已生成");
}

export async function explain(req: Request, res: Response) {
  const result = await explainSchedulePriority(req.user!.id, req.params.scheduleId as string);
  return sendSuccess(res, result, "AI 任务解释已生成");
}

export async function parseTask(req: Request, res: Response) {
  const result = await parseTaskDraft(req.user!.id, req.body.text);
  return sendSuccess(res, result, "AI 任务草稿已生成");
}

export async function summary(req: Request, res: Response) {
  const result = await generateTaskSummary(req.user!.id, req.body.range);
  return sendSuccess(res, result, "AI 总结已生成");
}

export async function conflictAdvice(req: Request, res: Response) {
  const result = await generateConflictAdvice(req.user!.id);
  return sendSuccess(res, result, "AI 冲突建议已生成");
}
