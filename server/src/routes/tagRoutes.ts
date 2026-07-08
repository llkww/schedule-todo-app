import { Router } from "express";

import { create, list, remove, update } from "../controllers/tagController.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createTagSchema, tagIdSchema, updateTagSchema } from "../validators/tagValidators.js";

export const tagRouter = Router();

tagRouter.use(requireAuth);

tagRouter.get("/", asyncHandler(list));
tagRouter.post("/", validateRequest("body", createTagSchema), asyncHandler(create));
tagRouter.put(
  "/:id",
  validateRequest("params", tagIdSchema),
  validateRequest("body", updateTagSchema),
  asyncHandler(update),
);
tagRouter.delete("/:id", validateRequest("params", tagIdSchema), asyncHandler(remove));
