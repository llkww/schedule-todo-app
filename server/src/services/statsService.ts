import { prisma } from "../config/prisma.js";
import { scheduleInclude, presentSchedule } from "./scheduleService.js";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const sevenDaysAgo = addDays(now, -7);
  const nextSevenDays = addDays(now, 7);

  const [
    total,
    completed,
    incomplete,
    overdue,
    importantUrgent,
    recentSevenDays,
    todayTasks,
    upcomingTasks,
    recentTasks,
    tags,
  ] = await prisma.$transaction([
    prisma.schedule.count({ where: { userId } }),
    prisma.schedule.count({ where: { userId, completed: true } }),
    prisma.schedule.count({ where: { userId, completed: false } }),
    prisma.schedule.count({
      where: { userId, completed: false, dueTime: { lt: now } },
    }),
    prisma.schedule.count({
      where: { userId, completed: false, importance: "HIGH", urgency: "HIGH" },
    }),
    prisma.schedule.count({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.schedule.findMany({
      where: {
        userId,
        OR: [
          { dueTime: { gte: todayStart, lte: todayEnd } },
          { startTime: { gte: todayStart, lte: todayEnd } },
        ],
      },
      include: scheduleInclude,
      orderBy: [{ completed: "asc" }, { dueTime: "asc" }],
      take: 6,
    }),
    prisma.schedule.findMany({
      where: {
        userId,
        completed: false,
        dueTime: { gte: now, lte: nextSevenDays },
      },
      include: scheduleInclude,
      orderBy: { dueTime: "asc" },
      take: 6,
    }),
    prisma.schedule.findMany({
      where: { userId },
      include: scheduleInclude,
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.tag.findMany({
      where: { userId },
      include: { _count: { select: { schedules: true } } },
      orderBy: { name: "asc" },
      take: 8,
    }),
  ]);

  return {
    counts: {
      total,
      completed,
      incomplete,
      overdue,
      importantUrgent,
      recentSevenDays,
      today: todayTasks.length,
    },
    todayTasks: todayTasks.map(presentSchedule),
    upcomingTasks: upcomingTasks.map(presentSchedule),
    recentTasks: recentTasks.map(presentSchedule),
    tagStats: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      scheduleCount: tag._count.schedules,
    })),
  };
}

export async function getMatrixStats(userId: string) {
  const schedules = await prisma.schedule.findMany({
    where: {
      userId,
      completed: false,
      status: { not: "CANCELLED" },
    },
    include: scheduleInclude,
    orderBy: [{ dueTime: "asc" }, { createdAt: "desc" }],
  });

  const quadrants = {
    importantUrgent: {
      title: "重要且紧急",
      description: "立即处理",
      items: schedules.filter((item) => item.importance === "HIGH" && item.urgency === "HIGH"),
    },
    importantNotUrgent: {
      title: "重要不紧急",
      description: "安排推进",
      items: schedules.filter((item) => item.importance === "HIGH" && item.urgency !== "HIGH"),
    },
    notImportantUrgent: {
      title: "不重要但紧急",
      description: "委派或压缩处理",
      items: schedules.filter((item) => item.importance !== "HIGH" && item.urgency === "HIGH"),
    },
    notImportantNotUrgent: {
      title: "不重要不紧急",
      description: "批量处理或舍弃",
      items: schedules.filter((item) => item.importance !== "HIGH" && item.urgency !== "HIGH"),
    },
  };

  return Object.fromEntries(
    Object.entries(quadrants).map(([key, quadrant]) => [
      key,
      {
        title: quadrant.title,
        description: quadrant.description,
        count: quadrant.items.length,
        items: quadrant.items.slice(0, 8).map(presentSchedule),
      },
    ]),
  );
}

export async function getTagStats(userId: string) {
  const tags = await prisma.tag.findMany({
    where: { userId },
    include: { _count: { select: { schedules: true } } },
    orderBy: [{ name: "asc" }],
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    scheduleCount: tag._count.schedules,
  }));
}
