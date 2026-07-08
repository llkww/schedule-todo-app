export type Importance = "low" | "medium" | "high";
export type Urgency = "low" | "medium" | "high";
export type ScheduleStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type User = {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  scheduleCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Schedule = {
  id: string;
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  dueTime: string | null;
  completed: boolean;
  importance: Importance;
  urgency: Urgency;
  status: ScheduleStatus;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
};

export type PaginatedSchedules = {
  items: Schedule[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type DashboardStats = {
  counts: {
    total: number;
    completed: number;
    incomplete: number;
    overdue: number;
    importantUrgent: number;
    recentSevenDays: number;
    today: number;
  };
  todayTasks: Schedule[];
  upcomingTasks: Schedule[];
  recentTasks: Schedule[];
  tagStats: Tag[];
};

export type MatrixQuadrant = {
  title: string;
  description: string;
  count: number;
  items: Schedule[];
};

export type MatrixStats = Record<
  "importantUrgent" | "importantNotUrgent" | "notImportantUrgent" | "notImportantNotUrgent",
  MatrixQuadrant
>;
