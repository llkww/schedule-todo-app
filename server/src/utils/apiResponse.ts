import type { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "success",
  statusCode = 200,
) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}
