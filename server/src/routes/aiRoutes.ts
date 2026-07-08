import { Router } from "express";

import {
  conflictAdvice,
  explain,
  parseTask,
  status,
  summary,
  todayPlan,
} from "../controllers/aiController.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { aiScheduleIdSchema, parseTaskSchema, summarySchema } from "../validators/aiValidators.js";

export const aiRouter = Router();

aiRouter.use(requireAuth);

aiRouter.get("/status", asyncHandler(status));
aiRouter.post("/plan/today", asyncHandler(todayPlan));
aiRouter.post(
  "/explain/:scheduleId",
  validateRequest("params", aiScheduleIdSchema),
  asyncHandler(explain),
);
aiRouter.post("/parse-task", validateRequest("body", parseTaskSchema), asyncHandler(parseTask));
aiRouter.post("/summary", validateRequest("body", summarySchema), asyncHandler(summary));
aiRouter.post("/conflict-advice", asyncHandler(conflictAdvice));
