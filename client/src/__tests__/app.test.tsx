import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "../App";
import { MatrixPage } from "../pages/matrix/MatrixPage";
import { ScheduleFormPage } from "../pages/schedules/ScheduleFormPage";
import { ScheduleListPage } from "../pages/schedules/ScheduleListPage";
import { TagsPage } from "../pages/tags/TagsPage";
import type { DashboardStats, MatrixStats, Schedule } from "../types/domain";

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
});
