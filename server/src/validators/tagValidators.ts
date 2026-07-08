import { z } from "zod";

export const tagColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{6})$/, "Color must be a hex value such as #4F46E5");

export const createTagSchema = z.object({
  name: z.string().trim().min(1, "Tag name is required").max(40, "Tag name is too long"),
  color: tagColorSchema,
});

export const updateTagSchema = createTagSchema.partial();

export const tagIdSchema = z.object({
  id: z.string().min(1, "Tag id is required"),
});
