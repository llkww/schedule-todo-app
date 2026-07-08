import { z } from "zod";

import { importanceValues, statusValues, urgencyValues } from "../constants/scheduleEnums.js";

const optionalDateSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? value : date;
}, z.date({ message: "Invalid date" }).optional());

const idArraySchema = z.array(z.string().min(1)).max(20, "At most 20 tags can be attached").optional();

const scheduleBaseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  description: z.string().trim().max(2000, "Description is too long").optional().or(z.literal("")),
  startTime: optionalDateSchema,
  endTime: optionalDateSchema,
  dueTime: optionalDateSchema,
  completed: z.boolean().optional(),
  importance: z.enum(importanceValues).default("medium"),
  urgency: z.enum(urgencyValues).default("medium"),
  status: z.enum(statusValues).default("pending"),
  tagIds: idArraySchema.default([]),
});

function validateDateOrder<T extends { startTime?: Date; endTime?: Date }>(data: T) {
  if (data.startTime && data.endTime && data.endTime < data.startTime) {
    return false;
  }
  return true;
}

export const createScheduleSchema = scheduleBaseSchema.refine(validateDateOrder, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const updateScheduleSchema = scheduleBaseSchema
  .partial()
  .refine(validateDateOrder, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const scheduleIdSchema = z.object({
  id: z.string().min(1, "Schedule id is required"),
});

const queryBoolean = z.preprocess((value) => {
  if (value === undefined || value === "") {
    return undefined;
  }
  if (value === "true" || value === true) {
    return true;
  }
  if (value === "false" || value === false) {
    return false;
  }
  return value;
}, z.boolean().optional());

const queryNumber = (defaultValue: number, max: number) =>
  z.preprocess((value) => {
    if (value === undefined || value === "") {
      return defaultValue;
    }
    return Number(value);
  }, z.number().int().min(1).max(max));

export const listScheduleQuerySchema = z.object({
  page: queryNumber(1, 10000).default(1),
  pageSize: queryNumber(10, 100).default(10),
  search: z.string().trim().max(120).optional(),
  status: z.enum(statusValues).optional(),
  importance: z.enum(importanceValues).optional(),
  urgency: z.enum(urgencyValues).optional(),
  tagId: z.string().min(1).optional(),
  completed: queryBoolean,
  overdue: queryBoolean,
  startFrom: optionalDateSchema,
  startTo: optionalDateSchema,
  dueFrom: optionalDateSchema,
  dueTo: optionalDateSchema,
  sortBy: z
    .enum(["createdAt", "updatedAt", "startTime", "dueTime", "importance", "urgency", "status"])
    .default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const completeScheduleSchema = z.object({
  completed: z.boolean().optional().default(true),
});
