import type { Request, Response } from "express";

import { sendSuccess } from "../utils/apiResponse.js";
import { getCurrentUser, loginUser, registerUser } from "../services/authService.js";

export async function register(req: Request, res: Response) {
  const result = await registerUser(req.body);
  return sendSuccess(res, result, "Registered successfully", 201);
}

export async function login(req: Request, res: Response) {
  const result = await loginUser(req.body);
  return sendSuccess(res, result, "Logged in successfully");
}

export async function logout(_req: Request, res: Response) {
  return sendSuccess(res, { loggedOut: true }, "Logged out successfully");
}

export async function me(req: Request, res: Response) {
  const user = await getCurrentUser(req.user!.id);
  return sendSuccess(res, { user });
}
