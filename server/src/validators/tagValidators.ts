import { z } from "zod";

export const tagColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{6})$/, "颜色必须是类似 #4F46E5 的十六进制值");

export const createTagSchema = z.object({
  name: z.string().trim().min(1, "请输入标签名称").max(40, "标签名称过长"),
  color: tagColorSchema,
});

export const updateTagSchema = createTagSchema.partial();

export const tagIdSchema = z.object({
  id: z.string().min(1, "缺少标签 ID"),
});
