import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, Grid2X2, Plus, Tags, TriangleAlert } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/Loading";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { TagPill } from "../../components/ui/TagPill";
import { TaskCard } from "../../components/ui/TaskCard";
import { useAuth } from "../../context/AuthContext";
import { fetchDashboardStats } from "../../services/stats";
import type { DashboardStats } from "../../types/domain";

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchDashboardStats());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "仪表盘加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeader
        title={`规划顺利，${user?.username ?? "你好"}`}
        description="集中查看今日安排、近期事项和高优先级承诺。"
        actions={
          <>
            <Link className="button button--secondary" to="/tags">
              <Tags aria-hidden="true" />
              管理标签
            </Link>
            <Link className="button button--primary" to="/schedules/new">
              <Plus aria-hidden="true" />
              新建日程
            </Link>
          </>
        }
      />

      {loading ? <SkeletonList rows={4} /> : null}
      {!loading && error ? (
        <EmptyState title="仪表盘无法加载" description={error} action={<Button onClick={() => void load()}>重试</Button>} />
      ) : null}
      {!loading && data ? (
        <div className="dashboard-grid">
          <div className="stat-grid">
            <StatCard label="今日" value={data.counts.today} icon={<CalendarDays aria-hidden="true" />} />
            <StatCard label="未完成" value={data.counts.incomplete} icon={<Clock3 aria-hidden="true" />} />
            <StatCard label="已完成" value={data.counts.completed} icon={<CheckCircle2 aria-hidden="true" />} />
            <StatCard label="已逾期" value={data.counts.overdue} icon={<TriangleAlert aria-hidden="true" />} />
          </div>

          <Card title="今日安排" description="开始时间或截止时间在今天的日程。">
            <TaskListPreview items={data.todayTasks} empty="今天还没有安排日程。" />
          </Card>

          <Card title="近期截止" description="未来七天内到期且未完成的日程。">
            <TaskListPreview items={data.upcomingTasks} empty="近期没有截止事项。" />
          </Card>

          <Card
            title="优先级概览"
            description={`${data.counts.importantUrgent} 个重要且紧急事项需要关注。`}
            actions={
              <Link className="button button--ghost button--sm" to="/matrix">
                <Grid2X2 aria-hidden="true" />
                打开四象限
              </Link>
            }
          >
            <div className="matrix-preview">
              <span className="matrix-preview__hot">立即处理</span>
              <span>安排推进</span>
              <span>委派处理</span>
              <span>批量处理</span>
            </div>
          </Card>

          <Card title="标签统计" description="查看当前日程按标签的分组情况。">
            <div className="tag-stat-list">
              {data.tagStats.length === 0 ? <p className="muted-text">还没有标签。</p> : null}
              {data.tagStats.map((tag) => (
                <div className="tag-stat-row" key={tag.id}>
                  <TagPill color={tag.color} name={tag.name} />
                  <strong>{tag.scheduleCount ?? 0}</strong>
                </div>
              ))}
            </div>
          </Card>

          <Card title="最近创建" description="工作区中最新创建的日程。">
            <TaskListPreview items={data.recentTasks} empty="还没有创建日程。" />
          </Card>
        </div>
      ) : null}
    </>
  );
}

function TaskListPreview({ items, empty }: { items: DashboardStats["todayTasks"]; empty: string }) {
  if (items.length === 0) {
    return <p className="muted-text">{empty}</p>;
  }

  return (
    <div className="preview-list">
      {items.map((item) => (
        <TaskCard compact key={item.id} schedule={item} />
      ))}
    </div>
  );
}
