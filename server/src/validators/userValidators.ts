import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "密码至少需要 8 个字符")
  .max(128, "密码过长")
  .regex(/[A-Za-z]/, "密码至少需要包含一个字母")
  .regex(/\d/, "密码至少需要包含一个数字");

export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "请输入用户名")
    .max(60, "用户名最多 60 个字符"),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码").max(128),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });
