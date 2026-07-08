import bcrypt from "bcryptjs";

import { prisma } from "../config/prisma.js";
import { notFound, unauthorized } from "../utils/errors.js";

function presentUser(user: {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw notFound("用户不存在");
  }

  return presentUser(user);
}

export async function updateUserProfile(userId: string, input: { username: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { username: input.username },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return presentUser(user);
}

export async function updateUserPassword(
  userId: string,
  input: { currentPassword: string; newPassword: string },
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw unauthorized("请先登录");
  }

  const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!isValid) {
    throw unauthorized("当前密码不正确");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { changed: true };
}
