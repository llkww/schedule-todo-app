import { Router } from "express";

import { changePassword, me, updateMe } from "../controllers/userController.js";
import { requireAuth } from "../middlewares/auth.js";
import { sensitiveActionRateLimiter } from "../middlewares/rateLimit.js";
import { validateRequest } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { updatePasswordSchema, updateProfileSchema } from "../validators/userValidators.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/me", asyncHandler(me));
userRouter.put("/me", validateRequest("body", updateProfileSchema), asyncHandler(updateMe));
userRouter.put(
  "/me/password",
  sensitiveActionRateLimiter,
  validateRequest("body", updatePasswordSchema),
  asyncHandler(changePassword),
);
