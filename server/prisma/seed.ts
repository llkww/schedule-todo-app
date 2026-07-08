import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Demo123456", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      username: "演示用户",
      passwordHash,
    },
    create: {
      username: "演示用户",
      email: "demo@example.com",
      passwordHash,
    },
  });

  await prisma.schedule.deleteMany({ where: { userId: user.id } });
  await prisma.tag.deleteMany({ where: { userId: user.id } });

  const tagData = [
    { name: "工作", color: "#4F46E5" },
    { name: "个人", color: "#0F766E" },
    { name: "学习", color: "#2563EB" },
    { name: "健康", color: "#16A34A" },
    { name: "家庭", color: "#B45309" },
    { name: "财务", color: "#9333EA" },
    { name: "专注", color: "#DC2626" },
    { name: "灵感", color: "#64748B" },
  ];

  const tags = await Promise.all(tagData.map((tag) => prisma.tag.create({ data: { ...tag, userId: user.id } })));
  const tagByName = Object.fromEntries(tags.map((tag) => [tag.name, tag]));

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(9, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(10, 0, 0, 0);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(17, 30, 0, 0);
  const inThreeDays = new Date(now);
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  inThreeDays.setHours(15, 0, 0, 0);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(11, 0, 0, 0);
  const laterThisMonth = new Date(now);
  laterThisMonth.setDate(laterThisMonth.getDate() + 14);
  laterThisMonth.setHours(18, 0, 0, 0);

  const scheduleData = [
    {
      title: "今日项目站会",
      description: "同步接口进度、前端联调状态和当天阻塞事项。",
      startTime: todayStart,
      endTime: todayEnd,
      dueTime: todayEnd,
      importance: "HIGH",
      urgency: "HIGH",
      status: "IN_PROGRESS",
      tags: ["工作", "专注"],
    },
    {
      title: "完成课程项目演示稿",
      description: "补齐功能截图、安全设计说明和运行命令页。",
      dueTime: tomorrow,
      importance: "HIGH",
      urgency: "HIGH",
      status: "PENDING",
      tags: ["工作", "学习"],
    },
    {
      title: "复盘本周目标",
      description: "整理已经完成的事项，标记下周需要延续推进的重点。",
      dueTime: inThreeDays,
      importance: "HIGH",
      urgency: "MEDIUM",
      status: "PENDING",
      tags: ["专注"],
    },
    {
      title: "阅读 TypeScript 进阶文章",
      description: "关注类型收窄、泛型约束和工程实践案例。",
      dueTime: nextWeek,
      importance: "MEDIUM",
      urgency: "LOW",
      status: "PENDING",
      tags: ["学习"],
    },
    {
      title: "预约年度体检",
      description: "选择合适时间段，并确认需要携带的材料。",
      dueTime: nextWeek,
      importance: "HIGH",
      urgency: "LOW",
      status: "PENDING",
      tags: ["健康", "个人"],
    },
    {
      title: "整理月度账单",
      description: "核对固定支出、订阅服务和本月预算剩余额度。",
      dueTime: laterThisMonth,
      importance: "MEDIUM",
      urgency: "MEDIUM",
      status: "PENDING",
      tags: ["财务", "个人"],
    },
    {
      title: "家庭采购清单",
      description: "补充厨房用品、清洁用品和周末做饭食材。",
      dueTime: tomorrow,
      importance: "LOW",
      urgency: "MEDIUM",
      status: "PENDING",
      tags: ["家庭"],
    },
    {
      title: "备份重要文件",
      description: "将项目文档、证件扫描件和照片同步到安全位置。",
      dueTime: inThreeDays,
      importance: "MEDIUM",
      urgency: "LOW",
      status: "PENDING",
      tags: ["个人", "财务"],
    },
    {
      title: "记录产品改进想法",
      description: "收集日历视图、四象限筛选和快捷录入相关灵感。",
      dueTime: null,
      importance: "LOW",
      urgency: "LOW",
      status: "PENDING",
      tags: ["灵感"],
    },
    {
      title: "完成晨间整理",
      description: "清理桌面、归档昨天记录，并确认今日前三件事。",
      dueTime: now,
      completed: true,
      importance: "MEDIUM",
      urgency: "MEDIUM",
      status: "COMPLETED",
      tags: ["个人", "专注"],
    },
    {
      title: "取消重复会议",
      description: "该会议内容已合并到项目站会，无需单独保留。",
      dueTime: tomorrow,
      importance: "LOW",
      urgency: "LOW",
      status: "CANCELLED",
      tags: ["工作"],
    },
    {
      title: "给家人视频通话",
      description: "确认周末安排，顺便沟通家庭采购计划。",
      dueTime: laterThisMonth,
      importance: "MEDIUM",
      urgency: "LOW",
      status: "PENDING",
      tags: ["家庭", "个人"],
    },
  ] as const;

  await Promise.all(
    scheduleData.map((schedule) =>
      prisma.schedule.create({
        data: {
          userId: user.id,
          title: schedule.title,
          description: schedule.description,
          startTime: "startTime" in schedule ? schedule.startTime : undefined,
          endTime: "endTime" in schedule ? schedule.endTime : undefined,
          dueTime: schedule.dueTime,
          completed: "completed" in schedule ? schedule.completed : false,
          importance: schedule.importance,
          urgency: schedule.urgency,
          status: schedule.status,
          tags: {
            create: schedule.tags.map((tagName) => ({ tagId: tagByName[tagName]!.id })),
          },
        },
      }),
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
