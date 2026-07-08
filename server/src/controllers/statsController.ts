import type { Request, Response } from "express";

import { getDashboardStats, getMatrixStats, getTagStats } from "../services/statsService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function dashboard(req: Request, res: Response) {
  const result = await getDashboardStats(req.user!.id);
  return sendSuccess(res, result);
}

export async function matrix(req: Request, res: Response) {
  const result = await getMatrixStats(req.user!.id);
  return sendSuccess(res, result);
}

export async function tags(req: Request, res: Response) {
  const result = await getTagStats(req.user!.id);
  return sendSuccess(res, result);
}
