import { Router } from "express";

import { login, logout, me, register } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";
import { authRateLimiter } from "../middlewares/rateLimit.js";
import { validateRequest } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginSchema, registerSchema } from "../validators/authValidators.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  validateRequest("body", registerSchema),
  asyncHandler(register),
);
authRouter.post("/login", authRateLimiter, validateRequest("body", loginSchema), asyncHandler(login));
authRouter.post("/logout", requireAuth, asyncHandler(logout));
authRouter.get("/me", requireAuth, asyncHandler(me));
