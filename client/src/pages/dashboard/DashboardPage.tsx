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
      setError(requestError instanceof Error ? requestError.message : "Dashboard failed to load");
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
        title={`Good planning, ${user?.username ?? "there"}`}
        description="A compact view of today, upcoming work, and high-priority commitments."
        actions={
          <>
            <Link className="button button--secondary" to="/tags">
              <Tags aria-hidden="true" />
              Manage tags
            </Link>
            <Link className="button button--primary" to="/schedules/new">
              <Plus aria-hidden="true" />
              New schedule
            </Link>
          </>
        }
      />

      {loading ? <SkeletonList rows={4} /> : null}
      {!loading && error ? (
        <EmptyState title="Dashboard could not load" description={error} action={<Button onClick={() => void load()}>Retry</Button>} />
      ) : null}
      {!loading && data ? (
        <div className="dashboard-grid">
          <div className="stat-grid">
            <StatCard label="Today" value={data.counts.today} icon={<CalendarDays aria-hidden="true" />} />
            <StatCard label="Incomplete" value={data.counts.incomplete} icon={<Clock3 aria-hidden="true" />} />
            <StatCard label="Completed" value={data.counts.completed} icon={<CheckCircle2 aria-hidden="true" />} />
            <StatCard label="Overdue" value={data.counts.overdue} icon={<TriangleAlert aria-hidden="true" />} />
          </div>

          <Card title="Today" description="Tasks with a start or due date today.">
            <TaskListPreview items={data.todayTasks} empty="No tasks scheduled for today." />
          </Card>

          <Card title="Upcoming" description="Incomplete schedules due in the next seven days.">
            <TaskListPreview items={data.upcomingTasks} empty="No upcoming deadlines." />
          </Card>

          <Card
            title="Priority snapshot"
            description={`${data.counts.importantUrgent} important and urgent items need attention.`}
            actions={
              <Link className="button button--ghost button--sm" to="/matrix">
                <Grid2X2 aria-hidden="true" />
                Open matrix
              </Link>
            }
          >
            <div className="matrix-preview">
              <span className="matrix-preview__hot">Do first</span>
              <span>Schedule</span>
              <span>Delegate</span>
              <span>Batch</span>
            </div>
          </Card>

          <Card title="Tag statistics" description="How your schedules are currently grouped.">
            <div className="tag-stat-list">
              {data.tagStats.length === 0 ? <p className="muted-text">No tags yet.</p> : null}
              {data.tagStats.map((tag) => (
                <div className="tag-stat-row" key={tag.id}>
                  <TagPill color={tag.color} name={tag.name} />
                  <strong>{tag.scheduleCount ?? 0}</strong>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Recently created" description="The newest schedules in your workspace.">
            <TaskListPreview items={data.recentTasks} empty="No schedules created yet." />
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
