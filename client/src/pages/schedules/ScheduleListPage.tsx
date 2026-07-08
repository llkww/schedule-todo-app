import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { FilterBar } from "../../components/ui/FilterBar";
import { Input, Select } from "../../components/ui/Field";
import { PageHeader } from "../../components/ui/PageHeader";
import { SkeletonList } from "../../components/ui/Loading";
import { TaskCard } from "../../components/ui/TaskCard";
import type { PaginatedSchedules, Schedule, Tag } from "../../types/domain";
import {
  deleteSchedule,
  fetchSchedules,
  fetchTags,
  setScheduleCompleted,
  type ScheduleQuery,
} from "../../services/schedules";

const defaultQuery: ScheduleQuery = {
  page: 1,
  pageSize: 8,
  search: "",
  status: "",
  importance: "",
  urgency: "",
  tagId: "",
  completed: "",
  overdue: "",
  sortBy: "createdAt",
  sortDir: "desc",
};

export function ScheduleListPage() {
  const [query, setQuery] = useState<ScheduleQuery>(defaultQuery);
  const [data, setData] = useState<PaginatedSchedules | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [scheduleData, tagData] = await Promise.all([fetchSchedules(query), fetchTags()]);
      setData(scheduleData);
      setTags(tagData);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateQuery(key: keyof Omit<ScheduleQuery, "page" | "pageSize">, value: string) {
    setQuery((current) => ({ ...current, [key]: value, page: 1 }));
  }

  function updatePage(page: number) {
    setQuery((current) => ({ ...current, page }));
  }

  async function toggleCompleted(schedule: Schedule) {
    try {
      await setScheduleCompleted(schedule.id, !schedule.completed);
      toast.success(schedule.completed ? "Schedule reopened" : "Schedule completed");
      await load();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Update failed");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSchedule(deleteTarget.id);
      toast.success("Schedule deleted");
      setDeleteTarget(null);
      await load();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const schedules = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Schedules"
        description="Search, filter, and keep every commitment scoped to your account."
        actions={
          <Link className="button button--primary" to="/schedules/new">
            <Plus aria-hidden="true" />
            New schedule
          </Link>
        }
      />

      <FilterBar>
        <Input
          label="Search"
          name="search"
          value={query.search ?? ""}
          onChange={(event) => updateQuery("search", event.target.value)}
        />
        <Select
          label="Status"
          name="status"
          value={query.status ?? ""}
          onChange={(event) => updateQuery("status", event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select
          label="Importance"
          name="importance"
          value={query.importance ?? ""}
          onChange={(event) => updateQuery("importance", event.target.value)}
        >
          <option value="">Any importance</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Select
          label="Urgency"
          name="urgency"
          value={query.urgency ?? ""}
          onChange={(event) => updateQuery("urgency", event.target.value)}
        >
          <option value="">Any urgency</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Select
          label="Tag"
          name="tagId"
          value={query.tagId ?? ""}
          onChange={(event) => updateQuery("tagId", event.target.value)}
        >
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </Select>
        <Select
          label="Sort"
          name="sortBy"
          value={query.sortBy ?? "createdAt"}
          onChange={(event) => updateQuery("sortBy", event.target.value)}
        >
          <option value="createdAt">Created</option>
          <option value="updatedAt">Updated</option>
          <option value="dueTime">Due time</option>
          <option value="startTime">Start time</option>
          <option value="importance">Importance</option>
          <option value="urgency">Urgency</option>
        </Select>
        <Button variant="secondary" type="button" onClick={() => setQuery(defaultQuery)}>
          <RotateCcw aria-hidden="true" />
          Clear
        </Button>
      </FilterBar>

      {loading ? <SkeletonList rows={4} /> : null}
      {!loading && error ? (
        <EmptyState
          title="Schedules could not load"
          description={error}
          action={<Button onClick={() => void load()}>Retry</Button>}
        />
      ) : null}
      {!loading && !error && schedules.length === 0 ? (
        <EmptyState
          title="No schedules found"
          description="Create a schedule or clear filters to see more results."
          action={
            <Link className="button button--primary" to="/schedules/new">
              <Plus aria-hidden="true" />
              New schedule
            </Link>
          }
        />
      ) : null}
      {!loading && !error && schedules.length > 0 ? (
        <div className="task-list">
          {schedules.map((schedule) => (
            <div className="task-list__item" key={schedule.id}>
              <TaskCard schedule={schedule} />
              <div className="task-list__actions">
                <Button variant="secondary" size="sm" onClick={() => void toggleCompleted(schedule)}>
                  <Check aria-hidden="true" />
                  {schedule.completed ? "Reopen" : "Complete"}
                </Button>
                <Link className="button button--ghost button--sm" to={`/schedules/${schedule.id}/edit`}>
                  Edit
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(schedule)}>
                  <Trash2 aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {data ? (
        <div className="pagination">
          <Button
            variant="secondary"
            disabled={data.pagination.page <= 1}
            onClick={() => updatePage(Math.max(1, data.pagination.page - 1))}
          >
            Previous
          </Button>
          <span>
            Page {data.pagination.page} of {Math.max(data.pagination.totalPages, 1)}
          </span>
          <Button
            variant="secondary"
            disabled={data.pagination.page >= data.pagination.totalPages}
            onClick={() => updatePage(data.pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete schedule"
        description={`Delete "${deleteTarget?.title ?? "this schedule"}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
