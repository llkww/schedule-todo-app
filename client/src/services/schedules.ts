import { apiRequest } from "./api";
import type { Importance, PaginatedSchedules, Schedule, ScheduleStatus, Tag, Urgency } from "../types/domain";

export type ScheduleQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  importance?: string;
  urgency?: string;
  tagId?: string;
  completed?: string;
  overdue?: string;
  sortBy?: string;
  sortDir?: string;
};

export type SchedulePayload = {
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  dueTime?: string;
  completed?: boolean;
  importance: Importance;
  urgency: Urgency;
  status: ScheduleStatus;
  tagIds: string[];
};

function toQueryString(query: ScheduleQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export function fetchSchedules(query: ScheduleQuery) {
  const search = toQueryString(query);
  return apiRequest<PaginatedSchedules>(`/schedules${search ? `?${search}` : ""}`);
}

export function fetchSchedule(id: string) {
  return apiRequest<Schedule>(`/schedules/${id}`);
}

export function createSchedule(payload: SchedulePayload) {
  return apiRequest<Schedule>("/schedules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSchedule(id: string, payload: SchedulePayload) {
  return apiRequest<Schedule>(`/schedules/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function setScheduleCompleted(id: string, completed: boolean) {
  return apiRequest<Schedule>(`/schedules/${id}/complete`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });
}

export function deleteSchedule(id: string) {
  return apiRequest<{ id: string }>(`/schedules/${id}`, { method: "DELETE" });
}

export function fetchTags() {
  return apiRequest<Tag[]>("/tags");
}
