import { apiRequest } from "./api";
import type { AiConflictAdvice, AiStatus, AiSummary, AiTaskDraft, AiTodayPlan } from "../types/domain";

export function fetchAiStatus() {
  return apiRequest<AiStatus>("/ai/status");
}

export function generateTodayPlan() {
  return apiRequest<AiTodayPlan>("/ai/plan/today", { method: "POST" });
}

export function explainSchedule(scheduleId: string) {
  return apiRequest(`/ai/explain/${scheduleId}`, { method: "POST" });
}

export function parseTask(text: string) {
  return apiRequest<AiTaskDraft>("/ai/parse-task", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function generateSummary(range: "today" | "week") {
  return apiRequest<AiSummary>("/ai/summary", {
    method: "POST",
    body: JSON.stringify({ range }),
  });
}

export function generateConflictAdvice() {
  return apiRequest<AiConflictAdvice>("/ai/conflict-advice", { method: "POST" });
}
