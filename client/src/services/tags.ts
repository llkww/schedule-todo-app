import { apiRequest } from "./api";
import type { Tag } from "../types/domain";

export type TagPayload = {
  name: string;
  color: string;
};

export function fetchTags() {
  return apiRequest<Tag[]>("/tags");
}

export function createTag(payload: TagPayload) {
  return apiRequest<Tag>("/tags", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTag(id: string, payload: TagPayload) {
  return apiRequest<Tag>(`/tags/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTag(id: string) {
  return apiRequest<{ id: string }>(`/tags/${id}`, { method: "DELETE" });
}
