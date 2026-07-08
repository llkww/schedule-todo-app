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
  return sendSuccess(res, result, "日程创建成功", 201);
}

export async function detail(req: Request, res: Response) {
  const result = await getScheduleById(req.user!.id, req.params.id as string);
  return sendSuccess(res, result);
}

export async function update(req: Request, res: Response) {
  const result = await updateSchedule(req.user!.id, req.params.id as string, req.body);
  return sendSuccess(res, result, "日程更新成功");
}

export async function complete(req: Request, res: Response) {
  const result = await setScheduleCompletion(
    req.user!.id,
    req.params.id as string,
    req.body.completed,
  );
  return sendSuccess(res, result, "日程完成状态已更新");
}

export async function remove(req: Request, res: Response) {
  const result = await deleteSchedule(req.user!.id, req.params.id as string);
  return sendSuccess(res, result, "日程已删除");
}

export async function removeCompleted(req: Request, res: Response) {
  const result = await deleteCompletedSchedules(req.user!.id);
  return sendSuccess(res, result, "已删除完成日程");
}
