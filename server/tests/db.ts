import { prisma } from "../src/config/prisma.js";

const statements = [
  "PRAGMA foreign_keys = OFF",
  'DROP INDEX IF EXISTS "User_email_key"',
  'DROP INDEX IF EXISTS "Schedule_userId_idx"',
  'DROP INDEX IF EXISTS "Schedule_dueTime_idx"',
  'DROP INDEX IF EXISTS "Schedule_status_idx"',
  'DROP INDEX IF EXISTS "Schedule_importance_urgency_idx"',
  'DROP INDEX IF EXISTS "Tag_userId_idx"',
  'DROP INDEX IF EXISTS "Tag_userId_name_key"',
  'DROP INDEX IF EXISTS "ScheduleTag_tagId_idx"',
  'DROP TABLE IF EXISTS "ScheduleTag"',
  'DROP TABLE IF EXISTS "Schedule"',
  'DROP TABLE IF EXISTS "Tag"',
  'DROP TABLE IF EXISTS "User"',
  `CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "dueTime" DATETIME,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "importance" TEXT NOT NULL DEFAULT 'MEDIUM',
    "urgency" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE "ScheduleTag" (
    "scheduleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    PRIMARY KEY ("scheduleId", "tagId"),
    CONSTRAINT "ScheduleTag_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScheduleTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  'CREATE UNIQUE INDEX "User_email_key" ON "User"("email")',
  'CREATE INDEX "Schedule_userId_idx" ON "Schedule"("userId")',
  'CREATE INDEX "Schedule_dueTime_idx" ON "Schedule"("dueTime")',
  'CREATE INDEX "Schedule_status_idx" ON "Schedule"("status")',
  'CREATE INDEX "Schedule_importance_urgency_idx" ON "Schedule"("importance", "urgency")',
  'CREATE INDEX "Tag_userId_idx" ON "Tag"("userId")',
  'CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name")',
  'CREATE INDEX "ScheduleTag_tagId_idx" ON "ScheduleTag"("tagId")',
  "PRAGMA foreign_keys = ON",
];

export async function resetDatabase() {
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
}
