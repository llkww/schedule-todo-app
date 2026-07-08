import { Router } from "express";

import {
  complete,
  create,
  detail,
  list,
  remove,
  removeCompleted,
  update,
} from "../controllers/scheduleController.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  completeScheduleSchema,
  createScheduleSchema,
  listScheduleQuerySchema,
  scheduleIdSchema,
  updateScheduleSchema,
} from "../validators/scheduleValidators.js";

export const scheduleRouter = Router();

scheduleRouter.use(requireAuth);

scheduleRouter.get("/", validateRequest("query", listScheduleQuerySchema), asyncHandler(list));
scheduleRouter.post("/", validateRequest("body", createScheduleSchema), asyncHandler(create));
scheduleRouter.delete("/completed", asyncHandler(removeCompleted));
scheduleRouter.get("/:id", validateRequest("params", scheduleIdSchema), asyncHandler(detail));
scheduleRouter.put(
  "/:id",
  validateRequest("params", scheduleIdSchema),
  validateRequest("body", updateScheduleSchema),
  asyncHandler(update),
);
scheduleRouter.patch(
  "/:id/complete",
  validateRequest("params", scheduleIdSchema),
  validateRequest("body", completeScheduleSchema),
  asyncHandler(complete),
);
scheduleRouter.delete("/:id", validateRequest("params", scheduleIdSchema), asyncHandler(remove));
