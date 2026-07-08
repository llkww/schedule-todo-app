import { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";
import type { ImportanceValue, StatusValue, UrgencyValue } from "../constants/scheduleEnums.js";
import {
  fromDbValue,
  toDbImportance,
  toDbStatus,
  toDbUrgency,
} from "../constants/scheduleEnums.js";
import { badRequest, notFound } from "../utils/errors.js";

export const scheduleInclude = {
  tags: {
    include: {
      tag: true,
    },
  },
} satisfies Prisma.ScheduleInclude;

type ScheduleWithTags = Prisma.ScheduleGetPayload<{ include: typeof scheduleInclude }>;

type ScheduleInput = {
  title: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  dueTime?: Date;
  completed?: boolean;
  importance?: ImportanceValue;
  urgency?: UrgencyValue;
  status?: StatusValue;
  tagIds?: string[];
};

type ListSchedulesInput = {
  page: number;
  pageSize: number;
  search?: string;
  status?: StatusValue;
  importance?: ImportanceValue;
  urgency?: UrgencyValue;
  tagId?: string;
  completed?: boolean;
  overdue?: boolean;
  startFrom?: Date;
  startTo?: Date;
  dueFrom?: Date;
  dueTo?: Date;
  sortBy: "createdAt" | "updatedAt" | "startTime" | "dueTime" | "importance" | "urgency" | "status";
  sortDir: "asc" | "desc";
};

function uniqueIds(ids: string[] = []) {
  return [...new Set(ids.filter(Boolean))];
}

async function assertTagsBelongToUser(userId: string, tagIds: string[]) {
  const ids = uniqueIds(tagIds);
  if (ids.length === 0) {
    return ids;
  }

  const count = await prisma.tag.count({
    where: {
      userId,
      id: { in: ids },
    },
  });

  if (count !== ids.length) {
    throw badRequest("One or more tags are invalid");
  }

  return ids;
}

function normalizeState(input: Pick<ScheduleInput, "completed" | "status">) {
  const status = input.status ?? "pending";
  const completed = input.completed ?? status === "completed";

  if (completed) {
    return { completed: true, status: "COMPLETED" };
  }

  return {
    completed: false,
    status: status === "completed" ? "PENDING" : toDbStatus(status),
  };
}

export function presentSchedule(schedule: ScheduleWithTags) {
  return {
    id: schedule.id,
    title: schedule.title,
    description: schedule.description ?? "",
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    dueTime: schedule.dueTime,
    completed: schedule.completed,
    importance: fromDbValue<"LOW" | "MEDIUM" | "HIGH">(schedule.importance),
    urgency: fromDbValue<"LOW" | "MEDIUM" | "HIGH">(schedule.urgency),
    status: fromDbValue<"PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED">(
      schedule.status,
    ),
    tags: schedule.tags.map(({ tag }) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
    })),
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
  };
}

export async function listSchedules(userId: string, input: ListSchedulesInput) {
  const where: Prisma.ScheduleWhereInput = {
    userId,
  };
  const andFilters: Prisma.ScheduleWhereInput[] = [];

  if (input.search) {
    andFilters.push({
      OR: [{ title: { contains: input.search } }, { description: { contains: input.search } }],
    });
  }

  if (input.status) {
    where.status = toDbStatus(input.status);
  }

  if (input.importance) {
    where.importance = toDbImportance(input.importance);
  }

  if (input.urgency) {
    where.urgency = toDbUrgency(input.urgency);
  }

  if (input.completed !== undefined) {
    where.completed = input.completed;
  }

  if (input.overdue === true) {
    where.dueTime = {
      ...(typeof where.dueTime === "object" && where.dueTime !== null ? where.dueTime : {}),
      lt: new Date(),
    };
    where.completed = false;
  }

  if (input.overdue === false) {
    andFilters.push({
      OR: [{ dueTime: null }, { dueTime: { gte: new Date() } }, { completed: true }],
    });
  }

  if (input.tagId) {
    where.tags = {
      some: {
        tagId: input.tagId,
        tag: { userId },
      },
    };
  }

  if (input.startFrom || input.startTo) {
    where.startTime = {
      gte: input.startFrom,
      lte: input.startTo,
    };
  }

  if (input.dueFrom || input.dueTo) {
    where.dueTime = {
      ...(typeof where.dueTime === "object" && where.dueTime !== null ? where.dueTime : {}),
      gte: input.dueFrom,
      lte: input.dueTo,
    };
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  const [total, schedules] = await prisma.$transaction([
    prisma.schedule.count({ where }),
    prisma.schedule.findMany({
      where,
      include: scheduleInclude,
      orderBy: { [input.sortBy]: input.sortDir },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
  ]);

  return {
    items: schedules.map(presentSchedule),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    },
  };
}

export async function getScheduleById(userId: string, id: string) {
  const schedule = await prisma.schedule.findFirst({
    where: { id, userId },
    include: scheduleInclude,
  });

  if (!schedule) {
    throw notFound("Schedule not found");
  }

  return presentSchedule(schedule);
}

export async function createSchedule(userId: string, input: ScheduleInput) {
  const tagIds = await assertTagsBelongToUser(userId, input.tagIds ?? []);
  const state = normalizeState(input);

  const schedule = await prisma.schedule.create({
    data: {
      userId,
      title: input.title,
      description: input.description || null,
      startTime: input.startTime,
      endTime: input.endTime,
      dueTime: input.dueTime,
      importance: toDbImportance(input.importance ?? "medium"),
      urgency: toDbUrgency(input.urgency ?? "medium"),
      completed: state.completed,
      status: state.status,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
    include: scheduleInclude,
  });

  return presentSchedule(schedule);
}

export async function updateSchedule(userId: string, id: string, input: ScheduleInput) {
  const existing = await prisma.schedule.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw notFound("Schedule not found");
  }

  const data: Prisma.ScheduleUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description || null;
  if (input.startTime !== undefined) data.startTime = input.startTime;
  if (input.endTime !== undefined) data.endTime = input.endTime;
  if (input.dueTime !== undefined) data.dueTime = input.dueTime;
  if (input.importance !== undefined) data.importance = toDbImportance(input.importance);
  if (input.urgency !== undefined) data.urgency = toDbUrgency(input.urgency);

  if (input.status !== undefined || input.completed !== undefined) {
    const state = normalizeState(input);
    data.status = state.status;
    data.completed = state.completed;
  }

  if (input.tagIds !== undefined) {
    const tagIds = await assertTagsBelongToUser(userId, input.tagIds);
    data.tags = {
      deleteMany: {},
      create: tagIds.map((tagId) => ({ tagId })),
    };
  }

  const schedule = await prisma.schedule.update({
    where: { id },
    data,
    include: scheduleInclude,
  });

  return presentSchedule(schedule);
}

export async function setScheduleCompletion(userId: string, id: string, completed: boolean) {
  const existing = await prisma.schedule.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw notFound("Schedule not found");
  }

  const schedule = await prisma.schedule.update({
    where: { id },
    data: {
      completed,
      status: completed ? "COMPLETED" : "PENDING",
    },
    include: scheduleInclude,
  });

  return presentSchedule(schedule);
}

export async function deleteSchedule(userId: string, id: string) {
  const existing = await prisma.schedule.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw notFound("Schedule not found");
  }

  await prisma.schedule.delete({ where: { id } });
  return { id };
}

export async function deleteCompletedSchedules(userId: string) {
  const result = await prisma.schedule.deleteMany({
    where: {
      userId,
      completed: true,
    },
  });

  return { deletedCount: result.count };
}
