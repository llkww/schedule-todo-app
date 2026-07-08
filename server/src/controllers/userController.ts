import type { Request, Response } from "express";

import {
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
} from "../services/userService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function me(req: Request, res: Response) {
  const user = await getUserProfile(req.user!.id);
  return sendSuccess(res, { user });
}

export async function updateMe(req: Request, res: Response) {
  const user = await updateUserProfile(req.user!.id, req.body);
  return sendSuccess(res, { user }, "个人资料已更新");
}

export async function changePassword(req: Request, res: Response) {
  const result = await updateUserPassword(req.user!.id, req.body);
  return sendSuccess(res, result, "密码已更新");
}
