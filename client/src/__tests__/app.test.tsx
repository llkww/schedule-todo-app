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
  title: "Ship project",
  description: "Finish the important work",
  startTime: null,
  endTime: null,
  dueTime: new Date().toISOString(),
  completed: false,
  importance: "high",
  urgency: "high",
  status: "pending",
  tags: [{ id: "tag-1", name: "Work", color: "#4F46E5" }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify({ success: status < 400, data, message: "success" }), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function mockFetch(handler: (url: string) => unknown) {
  vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = typeof input === "string" ? input : input.url;
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

    await userEvent.click(await screen.findByRole("button", { name: /log in/i }));

    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it("validates the register form", async () => {
    window.history.pushState({}, "", "/register");
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: /create account/i }));

    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/use at least 8 characters/i)).toBeInTheDocument();
  });

  it("redirects unauthenticated protected routes to login", async () => {
    window.history.pushState({}, "", "/schedules");
    render(<App />);

    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
  });

  it("renders the schedule list", async () => {
    mockFetch((url) => {
      if (url.includes("/tags")) return [{ id: "tag-1", name: "Work", color: "#4F46E5" }];
      return {
        items: [sampleSchedule],
        pagination: { page: 1, pageSize: 8, total: 1, totalPages: 1 },
      };
    });

    renderWithRouter(<ScheduleListPage />);

    expect(await screen.findByText("Ship project")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Complete$/i })).toBeInTheDocument();
  });

  it("renders the create schedule form", async () => {
    mockFetch(() => []);

    renderWithRouter(<ScheduleFormPage />);

    expect(await screen.findByRole("heading", { name: /new schedule/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/importance/i)).toBeInTheDocument();
  });

  it("renders the tag management page", async () => {
    mockFetch(() => []);

    renderWithRouter(<TagsPage />);

    expect(await screen.findByRole("heading", { name: /tags/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/tag name/i)).toBeInTheDocument();
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
      tagStats: [{ id: "tag-1", name: "Work", color: "#4F46E5", scheduleCount: 1 }],
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

    expect(await screen.findByText(/Good planning/i)).toBeInTheDocument();
    expect((await screen.findAllByText("Ship project")).length).toBeGreaterThan(0);
  });

  it("renders the matrix page", async () => {
    const matrix: MatrixStats = {
      importantUrgent: { title: "Important + urgent", description: "Do first", count: 1, items: [sampleSchedule] },
      importantNotUrgent: { title: "Important + not urgent", description: "Schedule", count: 0, items: [] },
      notImportantUrgent: { title: "Not important + urgent", description: "Delegate", count: 0, items: [] },
      notImportantNotUrgent: { title: "Not important + not urgent", description: "Batch", count: 0, items: [] },
    };
    mockFetch(() => matrix);

    renderWithRouter(<MatrixPage />);

    await waitFor(() => expect(screen.getByText("Important + urgent")).toBeInTheDocument());
    expect(screen.getByText("Ship project")).toBeInTheDocument();
  });
});
