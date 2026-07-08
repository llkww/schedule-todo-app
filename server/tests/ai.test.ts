import request from "supertest";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { resetDatabase } from "./db.js";

type DeepSeekBody = {
  messages: Array<{ role: string; content: string }>;
};

const originalDeepSeekKey = process.env.DEEPSEEK_API_KEY;

async function registerUser(email = "ai-user@example.com") {
  const response = await request(app).post("/api/auth/register").send({
    username: "测试用户",
    email,
    password: "Password123",
    confirmPassword: "Password123",
  });

  return response.body.data as { token: string; user: { id: string; email: string } };
}

async function createTag(token: string, name = "工作") {
  const response = await request(app)
    .post("/api/tags")
    .set("Authorization", `Bearer ${token}`)
    .send({ name, color: "#4F46E5" });

  return response.body.data as { id: string; name: string };
}

async function createSchedule(
  token: string,
  payload: {
    title: string;
    description?: string;
    tagIds?: string[];
    startTime?: string;
    endTime?: string;
    dueTime?: string;
    completed?: boolean;
    importance?: string;
    urgency?: string;
    status?: string;
  },
) {
  const response = await request(app)
    .post("/api/schedules")
    .set("Authorization", `Bearer ${token}`)
    .send({
      description: "测试描述",
      importance: "high",
      urgency: "high",
      status: "pending",
      tagIds: [],
      ...payload,
    });

  return response.body.data as { id: string; title: string };
}

function mockDeepSeek(content: unknown, inspectBody?: (body: DeepSeekBody) => void) {
  const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as DeepSeekBody;
    inspectBody?.(body);

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: typeof content === "string" ? content : JSON.stringify(content),
            },
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function mockDeepSeekSequence(contents: unknown[]) {
  const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
    JSON.parse(String(init?.body)) as DeepSeekBody;
    const next = contents[Math.min(fetchMock.mock.calls.length - 1, contents.length - 1)];

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: typeof next === "string" ? next : JSON.stringify(next),
            },
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function userPrompt(body: DeepSeekBody) {
  return body.messages.find((message) => message.role === "user")?.content ?? "";
}

describe("AI Planner API", () => {
  beforeEach(async () => {
    process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
    process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";
    vi.unstubAllGlobals();
    await resetDatabase();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.DEEPSEEK_API_KEY = originalDeepSeekKey;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("requires authentication for AI routes", async () => {
    const status = await request(app).get("/api/ai/status");
    const plan = await request(app).post("/api/ai/plan/today");

    expect(status.status).toBe(401);
    expect(plan.status).toBe(401);
  });

  it("returns AI_NOT_CONFIGURED without exposing any key when DeepSeek key is missing", async () => {
    const { token } = await registerUser();
    process.env.DEEPSEEK_API_KEY = "";

    const status = await request(app).get("/api/ai/status").set("Authorization", `Bearer ${token}`);
    expect(status.status).toBe(200);
    expect(status.body.data.configured).toBe(false);
    expect(JSON.stringify(status.body)).not.toContain("test-deepseek-key");

    const plan = await request(app)
      .post("/api/ai/plan/today")
      .set("Authorization", `Bearer ${token}`);
    expect(plan.status).toBe(503);
    expect(plan.body.error.code).toBe("AI_NOT_CONFIGURED");
    expect(JSON.stringify(plan.body)).not.toContain("test-deepseek-key");
  });

  it("generates today plan with only the current user's minimized schedule data", async () => {
    const userA = await registerUser("aiplan-a@example.com");
    const userB = await registerUser("aiplan-b@example.com");
    const tag = await createTag(userA.token, "课程");
    const userSchedule = await createSchedule(userA.token, {
      title: "完成中文课程报告",
      description: "只发送必要摘要",
      tagIds: [tag.id],
    });
    await createSchedule(userB.token, { title: "其他用户的私有任务" });

    let capturedPrompt = "";
    mockDeepSeek(
      {
        overview: "今天优先处理课程报告。",
        recommendedTasks: [
          {
            taskId: userSchedule.id,
            title: userSchedule.title,
            suggestedTimeRange: "09:00-10:00",
            priorityReason: "重要且紧急。",
            riskLevel: "high",
            actionSuggestion: "先完成主体内容。",
          },
        ],
        warnings: [],
        productivityTip: "先完成最关键的交付。",
      },
      (body) => {
        capturedPrompt = userPrompt(body);
      },
    );

    const response = await request(app)
      .post("/api/ai/plan/today")
      .set("Authorization", `Bearer ${userA.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.recommendedTasks[0].taskId).toBe(userSchedule.id);
    expect(capturedPrompt).toContain("完成中文课程报告");
    expect(capturedPrompt).not.toContain("其他用户的私有任务");
    expect(capturedPrompt).not.toContain("passwordHash");
    expect(capturedPrompt).not.toContain("Authorization");
    expect(capturedPrompt).not.toContain("test-deepseek-key");
  });

  it("does not explain another user's schedule", async () => {
    const userA = await registerUser("explain-a@example.com");
    const userB = await registerUser("explain-b@example.com");
    const schedule = await createSchedule(userA.token, { title: "用户 A 的任务" });
    const fetchMock = mockDeepSeek({
      taskId: schedule.id,
      title: schedule.title,
      explanation: "不应调用",
      factors: ["不应调用"],
      suggestedAction: "不应调用",
      riskLevel: "low",
    });

    const response = await request(app)
      .post(`/api/ai/explain/${schedule.id}`)
      .set("Authorization", `Bearer ${userB.token}`);

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("safely handles invalid AI JSON and invalid AI schema", async () => {
    const { token } = await registerUser("invalid-ai@example.com");
    await createSchedule(token, { title: "需要计划的任务" });

    mockDeepSeek("not-json");
    const invalidJson = await request(app)
      .post("/api/ai/plan/today")
      .set("Authorization", `Bearer ${token}`);
    expect(invalidJson.status).toBe(502);
    expect(invalidJson.body.error.code).toBe("AI_RESPONSE_INVALID");

    mockDeepSeek({ overview: "缺少字段", recommendedTasks: [null] });
    const invalidSchema = await request(app)
      .post("/api/ai/plan/today")
      .set("Authorization", `Bearer ${token}`);
    expect(invalidSchema.status).toBe(502);
    expect(invalidSchema.body.error.code).toBe("AI_RESPONSE_INVALID");
  });

  it("accepts recoverable Chinese AI fields for today plan", async () => {
    const { token } = await registerUser("loose-plan-ai@example.com");
    const schedule = await createSchedule(token, { title: "整理今日计划返回兼容性" });
    mockDeepSeek({
      overview: "今天先处理关键事项。",
      recommendedTasks: [
        {
          taskId: schedule.id,
          title: schedule.title,
          riskLevel: "中等风险",
          priorityReason: "需要优先推进。",
          actionSuggestion: "先完成最小可交付部分。",
        },
      ],
      warnings: {
        type: "提醒",
        message: "注意截止时间。",
        relatedTaskIds: schedule.id,
      },
      productivityTip: "先做一件最重要的小事。",
    });

    const response = await request(app)
      .post("/api/ai/plan/today")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.recommendedTasks[0].riskLevel).toBe("medium");
    expect(response.body.data.recommendedTasks[0].suggestedTimeRange).toBe("今天");
    expect(response.body.data.warnings[0].type).toBe("deadline");
    expect(response.body.data.warnings[0].relatedTaskIds).toEqual([schedule.id]);
  });

  it("retries once to repair invalid AI JSON before returning an error", async () => {
    const { token } = await registerUser("repair-ai@example.com");
    const schedule = await createSchedule(token, { title: "需要修复返回格式的任务" });
    const fetchMock = mockDeepSeekSequence([
      "这不是 JSON",
      {
        overview: "修复后返回合法计划。",
        recommendedTasks: [
          {
            taskId: schedule.id,
            title: schedule.title,
            suggestedTimeRange: "09:00-10:00",
            priorityReason: "重要且紧急。",
            riskLevel: "高风险",
            actionSuggestion: "优先完成。",
          },
        ],
        warnings: [{ type: "截止时间", message: "注意截止时间。", relatedTaskIds: [schedule.id] }],
        productivityTip: "先处理最重要的事项。",
      },
    ]);

    const response = await request(app)
      .post("/api/ai/plan/today")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(response.body.data.recommendedTasks[0].riskLevel).toBe("high");
    expect(response.body.data.warnings[0].type).toBe("deadline");
  });

  it("parses a task draft without writing to the database", async () => {
    const { token } = await registerUser("parse-ai@example.com");
    const beforeCount = await prisma.schedule.count();
    mockDeepSeek({
      title: "完成数据库实验报告",
      description: "根据自然语言解析的草稿。",
      startTime: null,
      endTime: null,
      dueTime: new Date().toISOString(),
      importance: "high",
      urgency: "high",
      status: "pending",
      suggestedTags: ["课程"],
      confidence: 0.88,
      clarifyingQuestions: [],
      missingFields: [],
    });

    const response = await request(app)
      .post("/api/ai/parse-task")
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "明天下午三点提醒我完成数据库实验报告，很重要很紧急。" });

    const afterCount = await prisma.schedule.count();
    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("完成数据库实验报告");
    expect(response.body.data.missingFields).toEqual([]);
    expect(afterCount).toBe(beforeCount);
  });

  it("summarizes only the current user's schedules and keeps backend computed counts", async () => {
    const userA = await registerUser("summary-a@example.com");
    const userB = await registerUser("summary-b@example.com");
    await createSchedule(userA.token, {
      title: "用户 A 今日总结任务",
      completed: true,
      status: "completed",
      dueTime: new Date().toISOString(),
    });
    await createSchedule(userB.token, {
      title: "用户 B 不应进入总结",
      dueTime: new Date().toISOString(),
    });

    let capturedPrompt = "";
    mockDeepSeek(
      {
        range: "today",
        summary: "今天已经完成关键任务。",
        completedCount: 99,
        pendingCount: 99,
        overdueCount: 99,
        highPriorityCount: 99,
        tagInsights: ["课程任务集中。"],
        suggestions: ["保持节奏。"],
        nextFocus: "继续推进下一项。",
      },
      (body) => {
        capturedPrompt = userPrompt(body);
      },
    );

    const response = await request(app)
      .post("/api/ai/summary")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ range: "today" });

    expect(response.status).toBe(200);
    expect(response.body.data.completedCount).toBe(1);
    expect(response.body.data.pendingCount).toBe(0);
    expect(capturedPrompt).toContain("用户 A 今日总结任务");
    expect(capturedPrompt).not.toContain("用户 B 不应进入总结");
  });

  it("generates conflict advice only for the current user's overlapping schedules", async () => {
    const userA = await registerUser("conflict-a@example.com");
    const userB = await registerUser("conflict-b@example.com");
    const start = new Date();
    start.setHours(14, 0, 0, 0);
    const overlapStart = new Date(start);
    overlapStart.setMinutes(30);
    const end = new Date(start);
    end.setHours(15, 0, 0, 0);
    const overlapEnd = new Date(start);
    overlapEnd.setHours(15, 30, 0, 0);
    const first = await createSchedule(userA.token, {
      title: "用户 A 冲突任务一",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
    const second = await createSchedule(userA.token, {
      title: "用户 A 冲突任务二",
      startTime: overlapStart.toISOString(),
      endTime: overlapEnd.toISOString(),
    });
    await createSchedule(userB.token, {
      title: "用户 B 冲突任务",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });

    let capturedPrompt = "";
    mockDeepSeek(
      {
        conflictCount: 1,
        conflicts: [
          {
            taskIds: [first.id, second.id],
            conflictTimeRange: "14:30-15:00",
            explanation: "两个任务时间重叠。",
            adjustmentSuggestion: "将其中一个任务后移。",
            priorityRecommendation: "优先处理更紧急的任务。",
          },
        ],
      },
      (body) => {
        capturedPrompt = userPrompt(body);
      },
    );

    const response = await request(app)
      .post("/api/ai/conflict-advice")
      .set("Authorization", `Bearer ${userA.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.conflictCount).toBe(1);
    expect(capturedPrompt).toContain("用户 A 冲突任务一");
    expect(capturedPrompt).toContain("用户 A 冲突任务二");
    expect(capturedPrompt).not.toContain("用户 B 冲突任务");
  });
});
