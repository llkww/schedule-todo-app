import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { sendError } from "../utils/apiResponse.js";
import { AppError } from "../utils/errors.js";

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, 404, "NOT_FOUND", `接口 ${req.method} ${req.path} 不存在`);
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }

  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    return sendError(res, 400, "VALIDATION_ERROR", firstIssue?.message ?? "输入无效");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return sendError(res, 409, "CONFLICT", "记录已存在");
    }
  }

  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  return sendError(res, 500, "INTERNAL_SERVER_ERROR", "服务器内部错误");
}
