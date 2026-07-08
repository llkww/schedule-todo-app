import { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";
import { conflict, notFound } from "../utils/errors.js";

type TagInput = {
  name?: string;
  color?: string;
};

const tagWithCount = {
  _count: {
    select: {
      schedules: true,
    },
  },
} satisfies Prisma.TagInclude;

type TagWithCount = Prisma.TagGetPayload<{ include: typeof tagWithCount }>;

function presentTag(tag: TagWithCount) {
  return {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    scheduleCount: tag._count.schedules,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt,
  };
}

async function assertUniqueName(userId: string, name: string, excludeId?: string) {
  const existing = await prisma.tag.findFirst({
    where: {
      userId,
      name,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw conflict("标签名称已存在");
  }
}

export async function listTags(userId: string) {
  const tags = await prisma.tag.findMany({
    where: { userId },
    include: tagWithCount,
    orderBy: [{ name: "asc" }],
  });

  return tags.map(presentTag);
}

export async function createTag(userId: string, input: Required<TagInput>) {
  await assertUniqueName(userId, input.name);

  const tag = await prisma.tag.create({
    data: {
      userId,
      name: input.name,
      color: input.color,
    },
    include: tagWithCount,
  });

  return presentTag(tag);
}

export async function updateTag(userId: string, id: string, input: TagInput) {
  const existing = await prisma.tag.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw notFound("标签不存在");
  }

  if (input.name) {
    await assertUniqueName(userId, input.name, id);
  }

  const tag = await prisma.tag.update({
    where: { id },
    data: input,
    include: tagWithCount,
  });

  return presentTag(tag);
}

export async function deleteTag(userId: string, id: string) {
  const existing = await prisma.tag.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw notFound("标签不存在");
  }

  await prisma.tag.delete({ where: { id } });
  return { id };
}
