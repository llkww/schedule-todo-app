import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ImportanceBadge, UrgencyBadge } from "../../components/ui/PriorityBadge";
import { LoadingSpinner } from "../../components/ui/Loading";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TagPill } from "../../components/ui/TagPill";
import type { Schedule } from "../../types/domain";
import { deleteSchedule, fetchSchedule, setScheduleCompleted } from "../../services/schedules";
import { formatDateTime, isOverdue } from "../../utils/date";

export function ScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      setSchedule(await fetchSchedule(id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "日程加载失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleCompleted() {
    if (!schedule) return;
    setBusy(true);
    try {
      const updated = await setScheduleCompleted(schedule.id, !schedule.completed);
      setSchedule(updated);
      toast.success(updated.completed ? "日程已完成" : "日程已重新打开");
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "更新失败");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!schedule) return;
    setBusy(true);
    try {
      await deleteSchedule(schedule.id);
      toast.success("日程已删除");
      navigate("/schedules", { replace: true });
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "删除失败");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingSpinner label="正在加载日程" />;
  if (error || !schedule) {
    return (
      <EmptyState
        title="日程不可用"
        description={error || "未找到此日程。"}
        action={<Button onClick={() => void load()}>重试</Button>}
      />
    );
  }

  const overdue = isOverdue(schedule.dueTime, schedule.completed);

  return (
    <>
      <PageHeader
        title={schedule.title}
        actions={
          <>
            <Button variant="secondary" loading={busy} onClick={() => void toggleCompleted()}>
              <CheckCircle2 aria-hidden="true" />
              {schedule.completed ? "重新打开" : "完成"}
            </Button>
            <Link className="button button--primary" to={`/schedules/${schedule.id}/edit`}>
              <Pencil aria-hidden="true" />
              编辑
            </Link>
          </>
        }
      />

      <div className="detail-grid">
        <Card title="概览">
          <div className="detail-stack">
            {overdue ? <div className="form-alert">此日程已逾期。</div> : null}
            <p className="detail-description">
              {schedule.description || "尚未添加描述。"}
            </p>
            <div className="task-card__badges">
              <StatusBadge value={schedule.status} />
              <ImportanceBadge value={schedule.importance} />
              <UrgencyBadge value={schedule.urgency} />
            </div>
            <div className="task-card__tags">
              {schedule.tags.length > 0 ? (
                schedule.tags.map((tag) => <TagPill key={tag.id} color={tag.color} name={tag.name} />)
              ) : (
                <span className="muted-text">无标签</span>
              )}
            </div>
          </div>
        </Card>

        <Card title="时间">
          <dl className="detail-list">
            <div>
              <dt>开始</dt>
              <dd>{formatDateTime(schedule.startTime)}</dd>
            </div>
            <div>
              <dt>结束</dt>
              <dd>{formatDateTime(schedule.endTime)}</dd>
            </div>
            <div>
              <dt>截止</dt>
              <dd>{formatDateTime(schedule.dueTime)}</dd>
            </div>
            <div>
              <dt>创建</dt>
              <dd>{formatDateTime(schedule.createdAt)}</dd>
            </div>
            <div>
              <dt>更新</dt>
              <dd>{formatDateTime(schedule.updatedAt)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="danger-zone" title="删除日程">
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 aria-hidden="true" />
          删除
        </Button>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        title="删除日程"
        description={`确定删除“${schedule.title}”吗？此操作无法撤销。`}
        confirmLabel="删除"
        loading={busy}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
