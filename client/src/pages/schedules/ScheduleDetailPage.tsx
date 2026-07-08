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
      setError(requestError instanceof Error ? requestError.message : "Failed to load schedule");
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
      toast.success(updated.completed ? "Schedule completed" : "Schedule reopened");
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!schedule) return;
    setBusy(true);
    try {
      await deleteSchedule(schedule.id);
      toast.success("Schedule deleted");
      navigate("/schedules", { replace: true });
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading schedule" />;
  if (error || !schedule) {
    return (
      <EmptyState
        title="Schedule not available"
        description={error || "This schedule could not be found."}
        action={<Button onClick={() => void load()}>Retry</Button>}
      />
    );
  }

  const overdue = isOverdue(schedule.dueTime, schedule.completed);

  return (
    <>
      <PageHeader
        title={schedule.title}
        description="Review the full schedule record and update its state."
        actions={
          <>
            <Button variant="secondary" loading={busy} onClick={() => void toggleCompleted()}>
              <CheckCircle2 aria-hidden="true" />
              {schedule.completed ? "Reopen" : "Complete"}
            </Button>
            <Link className="button button--primary" to={`/schedules/${schedule.id}/edit`}>
              <Pencil aria-hidden="true" />
              Edit
            </Link>
          </>
        }
      />

      <div className="detail-grid">
        <Card title="Overview">
          <div className="detail-stack">
            {overdue ? <div className="form-alert">This schedule is overdue.</div> : null}
            <p className="detail-description">
              {schedule.description || "No description has been added."}
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
                <span className="muted-text">No tags</span>
              )}
            </div>
          </div>
        </Card>

        <Card title="Timing">
          <dl className="detail-list">
            <div>
              <dt>Start</dt>
              <dd>{formatDateTime(schedule.startTime)}</dd>
            </div>
            <div>
              <dt>End</dt>
              <dd>{formatDateTime(schedule.endTime)}</dd>
            </div>
            <div>
              <dt>Due</dt>
              <dd>{formatDateTime(schedule.dueTime)}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDateTime(schedule.createdAt)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDateTime(schedule.updatedAt)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="danger-zone" title="Danger zone" description="Delete this schedule only if it is no longer needed.">
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 aria-hidden="true" />
          Delete schedule
        </Button>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete schedule"
        description={`Delete "${schedule.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={busy}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
