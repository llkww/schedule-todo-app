import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "../App";
import { AiPlannerPage } from "../pages/ai/AiPlannerPage";
import { MatrixPage } from "../pages/matrix/MatrixPage";
import { ScheduleFormPage } from "../pages/schedules/ScheduleFormPage";
import { ScheduleListPage } from "../pages/schedules/ScheduleListPage";
import { TagsPage } from "../pages/tags/TagsPage";
import type { AiTaskDraft, DashboardStats, MatrixStats, Schedule } from "../types/domain";

const sampleSchedule: Schedule = {
  id: "schedule-1",
  title: "交付项目",
  description: "完成重要工作",
  startTime: null,
  endTime: null,
  dueTime: new Date().toISOString(),
  completed: false,
  importance: "high",
  urgency: "high",
  status: "pending",
  tags: [{ id: "tag-1", name: "工作", color: "#4F46E5" }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify({ success: status < 400, data, message: "操作成功" }), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function jsonErrorResponse(message: string, code = "REQUEST_FAILED", status = 500) {
  return Promise.resolve(
    new Response(JSON.stringify({ success: false, error: { code, message } }), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function mockFetch(handler: (url: string) => unknown) {
  vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    return jsonResponse(handler(url));
  });
}

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("frontend app", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  it("validates the login form", async () => {
    window.history.pushState({}, "", "/login");
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "登录" }));

    expect(screen.getByText("请输入有效的邮箱地址")).toBeInTheDocument();
    expect(screen.getByText("请输入密码")).toBeInTheDocument();
  });

  it("validates the register form", async () => {
    window.history.pushState({}, "", "/register");
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "创建账号" }));

    expect(screen.getByText("请输入用户名")).toBeInTheDocument();
    expect(screen.getByText("请输入有效的邮箱地址")).toBeInTheDocument();
    expect(screen.getByText("请至少输入 8 个字符")).toBeInTheDocument();
  });

  it("redirects unauthenticated protected routes to login", async () => {
    window.history.pushState({}, "", "/schedules");
    render(<App />);

    expect(await screen.findByRole("heading", { name: "欢迎回来" })).toBeInTheDocument();
  });

  it("renders the schedule list", async () => {
    mockFetch((url) => {
      if (url.includes("/tags")) return [{ id: "tag-1", name: "工作", color: "#4F46E5" }];
      return {
        items: [sampleSchedule],
        pagination: { page: 1, pageSize: 8, total: 1, totalPages: 1 },
      };
    });

    renderWithRouter(<ScheduleListPage />);

    expect(await screen.findByText("交付项目")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "完成" })).toBeInTheDocument();
  });

  it("renders the create schedule form", async () => {
    mockFetch(() => []);

    renderWithRouter(<ScheduleFormPage />);

    expect(await screen.findByRole("heading", { name: "新建日程" })).toBeInTheDocument();
    expect(screen.getByLabelText(/标题/)).toBeInTheDocument();
    expect(screen.getByLabelText(/重要程度/)).toBeInTheDocument();
  });

  it("renders the tag management page", async () => {
    mockFetch(() => []);

    renderWithRouter(<TagsPage />);

    expect(await screen.findByRole("heading", { name: "标签" })).toBeInTheDocument();
    expect(screen.getByLabelText(/标签名称/)).toBeInTheDocument();
  });

  it("renders the dashboard page", async () => {
    const dashboard: DashboardStats = {
      counts: {
        total: 1,
        completed: 0,
        incomplete: 1,
        overdue: 0,
        importantUrgent: 1,
        recentSevenDays: 1,
        today: 1,
      },
      todayTasks: [sampleSchedule],
      upcomingTasks: [sampleSchedule],
      recentTasks: [sampleSchedule],
      tagStats: [{ id: "tag-1", name: "工作", color: "#4F46E5", scheduleCount: 1 }],
    };
    localStorage.setItem("schedule.todo.token", "token");
    mockFetch((url) => {
      if (url.includes("/auth/me")) {
        return {
          user: {
            id: "user-1",
            username: "Ada",
            email: "ada@example.com",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return dashboard;
    });

    render(<App />);

    expect(await screen.findByText(/规划顺利/)).toBeInTheDocument();
    expect((await screen.findAllByText("交付项目")).length).toBeGreaterThan(0);
  });

  it("renders the matrix page", async () => {
    const matrix: MatrixStats = {
      importantUrgent: { title: "重要且紧急", description: "立即处理", count: 1, items: [sampleSchedule] },
      importantNotUrgent: { title: "重要不紧急", description: "安排推进", count: 0, items: [] },
      notImportantUrgent: { title: "不重要但紧急", description: "委派或压缩处理", count: 0, items: [] },
      notImportantNotUrgent: { title: "不重要不紧急", description: "批量处理或舍弃", count: 0, items: [] },
    };
    mockFetch(() => matrix);

    renderWithRouter(<MatrixPage />);

    await waitFor(() => expect(screen.getByText("重要且紧急")).toBeInTheDocument());
    expect(screen.getByText("交付项目")).toBeInTheDocument();
  });

  it("renders the AI Planner page with unconfigured status", async () => {
    mockFetch((url) => {
      if (url.includes("/ai/status")) {
        return { provider: "deepseek", configured: false, model: "deepseek-v4-flash" };
      }
      if (url.includes("/tags")) return [];
      return {};
    });

    renderWithRouter(<AiPlannerPage />);

    expect(await screen.findByRole("heading", { name: "智能日程助理" })).toBeInTheDocument();
    expect(await screen.findByText(/智能日程助理未配置/)).toBeInTheDocument();
  });

  it("shows loading while generating today plan", async () => {
    let resolvePlan: (() => void) | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/ai/status")) {
        return jsonResponse({ provider: "deepseek", configured: true, model: "deepseek-v4-flash" });
      }
      if (url.includes("/tags")) return jsonResponse([]);
      if (url.includes("/ai/plan/today")) {
        return new Promise<Response>((resolve) => {
          resolvePlan = () => {
            resolve(
              new Response(
                JSON.stringify({
                  success: true,
                  data: {
                    overview: "今天先处理高优先级任务。",
                    recommendedTasks: [],
                    warnings: [],
                    productivityTip: "先完成最关键的一件事。",
                  },
                  message: "操作成功",
                }),
                { status: 200, headers: { "Content-Type": "application/json" } },
              ),
            );
          };
        });
      }
      return jsonResponse({});
    });

    renderWithRouter(<AiPlannerPage />);

    const button = await screen.findByRole("button", { name: /生成今日计划/ });
    await userEvent.click(button);
    expect(button).toBeDisabled();
    resolvePlan?.();
    expect(await screen.findByText("今天先处理高优先级任务。")).toBeInTheDocument();
  });

  it("shows parsed task draft and creates schedule only after confirmation", async () => {
    const draft: AiTaskDraft = {
      title: "完成数据库实验报告",
      description: "根据自然语言解析。",
      startTime: null,
      endTime: null,
      dueTime: new Date().toISOString(),
      importance: "high",
      urgency: "high",
      status: "pending",
      suggestedTags: ["课程"],
      confidence: 0.91,
      clarifyingQuestions: [],
    };
    const createdBodies: unknown[] = [];

    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/ai/status")) {
        return jsonResponse({ provider: "deepseek", configured: true, model: "deepseek-v4-flash" });
      }
      if (url.includes("/tags")) return jsonResponse([{ id: "tag-course", name: "课程", color: "#2563EB" }]);
      if (url.includes("/ai/parse-task")) return jsonResponse(draft);
      if (url.includes("/schedules")) {
        createdBodies.push(JSON.parse(String(init?.body)));
        return jsonResponse({ ...sampleSchedule, title: draft.title });
      }
      return jsonResponse({});
    });

    renderWithRouter(<AiPlannerPage />);

    await userEvent.type(await screen.findByLabelText("任务描述"), "明天下午三点完成数据库实验报告");
    await userEvent.click(screen.getByRole("button", { name: /解析草稿/ }));
    expect(await screen.findByText("完成数据库实验报告")).toBeInTheDocument();
    expect(createdBodies).toHaveLength(0);

    await userEvent.click(screen.getByRole("button", { name: "确认创建日程" }));
    await waitFor(() => expect(createdBodies).toHaveLength(1));
    expect(createdBodies[0]).toMatchObject({
      title: "完成数据库实验报告",
      tagIds: ["tag-course"],
    });
  });

  it("shows AI error state when generation fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/ai/status")) {
        return jsonResponse({ provider: "deepseek", configured: true, model: "deepseek-v4-flash" });
      }
      if (url.includes("/tags")) return jsonResponse([]);
      if (url.includes("/ai/plan/today")) {
        return jsonErrorResponse("AI 服务调用失败", "AI_PROVIDER_ERROR", 502);
      }
      return jsonResponse({});
    });

    renderWithRouter(<AiPlannerPage />);

    await userEvent.click(await screen.findByRole("button", { name: /生成今日计划/ }));
    expect(await screen.findByText("AI 服务调用失败")).toBeInTheDocument();
  });
});
