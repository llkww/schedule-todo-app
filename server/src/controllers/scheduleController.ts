import type { Request, Response } from "express";

import {
  createSchedule,
  deleteCompletedSchedules,
  deleteSchedule,
  getScheduleById,
  listSchedules,
  setScheduleCompletion,
  updateSchedule,
} from "../services/scheduleService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function list(req: Request, res: Response) {
  const result = await listSchedules(req.user!.id, req.query as never);
  return sendSuccess(res, result);
}

export async function create(req: Request, res: Response) {
  const result = await createSchedule(req.user!.id, req.body);
  return sendSuccess(res, result, "Schedule created", 201);
}

export async function detail(req: Request, res: Response) {
  const result = await getScheduleById(req.user!.id, req.params.id as string);
  return sendSuccess(res, result);
}

export async function update(req: Request, res: Response) {
  const result = await updateSchedule(req.user!.id, req.params.id as string, req.body);
  return sendSuccess(res, result, "Schedule updated");
}

export async function complete(req: Request, res: Response) {
  const result = await setScheduleCompletion(
    req.user!.id,
    req.params.id as string,
    req.body.completed,
  );
  return sendSuccess(res, result, "Schedule completion updated");
}

export async function remove(req: Request, res: Response) {
  const result = await deleteSchedule(req.user!.id, req.params.id as string);
  return sendSuccess(res, result, "Schedule deleted");
}

export async function removeCompleted(req: Request, res: Response) {
  const result = await deleteCompletedSchedules(req.user!.id);
  return sendSuccess(res, result, "Completed schedules deleted");
}
