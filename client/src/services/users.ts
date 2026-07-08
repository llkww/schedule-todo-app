import { apiRequest } from "./api";
import type { User } from "../types/domain";

export function updateProfile(payload: { username: string }) {
  return apiRequest<{ user: User }>("/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updatePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return apiRequest<{ changed: boolean }>("/users/me/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
