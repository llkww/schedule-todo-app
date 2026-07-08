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

export type RiskLevel = "low" | "medium" | "high";

export type AiStatus = {
  provider: "deepseek";
  configured: boolean;
  model: string;
};

export type AiRecommendedTask = {
  taskId: string;
  title: string;
  suggestedTimeRange: string;
  priorityReason: string;
  riskLevel: RiskLevel;
  actionSuggestion: string;
};

export type AiWarning = {
  type: "overdue" | "conflict" | "workload" | "deadline";
  message: string;
  relatedTaskIds: string[];
};

export type AiTodayPlan = {
  overview: string;
  recommendedTasks: AiRecommendedTask[];
  warnings: AiWarning[];
  productivityTip: string;
};

export type AiTaskDraft = {
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  dueTime: string | null;
  importance: Importance;
  urgency: Urgency;
  status: ScheduleStatus;
  suggestedTags: string[];
  confidence: number;
  clarifyingQuestions: string[];
};

export type AiSummary = {
  range: "today" | "week";
  summary: string;
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
  highPriorityCount: number;
  tagInsights: string[];
  suggestions: string[];
  nextFocus: string;
};

export type AiConflict = {
  taskIds: string[];
  conflictTimeRange: string;
  explanation: string;
  adjustmentSuggestion: string;
  priorityRecommendation: string;
};

export type AiConflictAdvice = {
  conflictCount: number;
  conflicts: AiConflict[];
};
