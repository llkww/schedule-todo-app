import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Demo123456", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      username: "演示用户",
      email: "demo@example.com",
      passwordHash,
    },
  });

  const tagData = [
    { name: "工作", color: "#4F46E5" },
    { name: "个人", color: "#0F766E" },
    { name: "专注", color: "#B45309" },
  ];

  const tags = await Promise.all(
    tagData.map((tag) =>
      prisma.tag.upsert({
        where: { userId_name: { userId: user.id, name: tag.name } },
        update: { color: tag.color },
        create: { ...tag, userId: user.id },
      }),
    ),
  );

  const existing = await prisma.schedule.count({ where: { userId: user.id } });
  if (existing > 0) {
    return;
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.schedule.create({
    data: {
      userId: user.id,
      title: "规划本周优先事项",
      description: "回顾当前任务，并确定本周最重要的三个产出。",
      dueTime: tomorrow,
      importance: "HIGH",
      urgency: "HIGH",
      status: "IN_PROGRESS",
      tags: {
        create: [{ tagId: tags[0].id }, { tagId: tags[2].id }],
      },
    },
  });

  await prisma.schedule.create({
    data: {
      userId: user.id,
      title: "预约健康检查",
      description: "预约合适的上午时段，并准备需要的材料。",
      dueTime: nextWeek,
      importance: "HIGH",
      urgency: "LOW",
      status: "PENDING",
      tags: {
        create: [{ tagId: tags[1].id }],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
