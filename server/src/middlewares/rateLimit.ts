import rateLimit from "express-rate-limit";

import { sendError } from "../utils/apiResponse.js";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    sendError(res, 429, "RATE_LIMITED", "认证尝试过于频繁，请稍后再试。"),
});

export const sensitiveActionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    sendError(res, 429, "RATE_LIMITED", "敏感操作请求过于频繁，请稍后再试。"),
});
