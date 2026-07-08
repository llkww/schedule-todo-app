import { apiRequest } from "./api";
import type { DashboardStats, MatrixStats } from "../types/domain";

export function fetchDashboardStats() {
  return apiRequest<DashboardStats>("/stats/dashboard");
}

export function fetchMatrixStats() {
  return apiRequest<MatrixStats>("/stats/matrix");
}
