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
      setError(requestError instanceof Error ? requestError.message : "日程加载失败");
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
      toast.success(schedule.completed ? "日程已重新打开" : "日程已完成");
      await load();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "更新失败");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSchedule(deleteTarget.id);
      toast.success("日程已删除");
      setDeleteTarget(null);
      await load();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "删除失败");
    } finally {
      setDeleting(false);
    }
  }

  const schedules = data?.items ?? [];
  const hasActiveFilters = Boolean(
    query.search || query.status || query.importance || query.urgency || query.tagId || query.completed || query.overdue,
  );

  return (
    <>
      <PageHeader
        title="日程"
        description="快速找到接下来要做的事。"
        actions={
          <Link className="button button--primary" to="/schedules/new">
            <Plus aria-hidden="true" />
            新建日程
          </Link>
        }
      />

      <FilterBar>
        <Input
          label="搜索"
          name="search"
          placeholder="搜索日程"
          value={query.search ?? ""}
          onChange={(event) => updateQuery("search", event.target.value)}
        />
        <Select
          label="状态"
          name="status"
          value={query.status ?? ""}
          onChange={(event) => updateQuery("status", event.target.value)}
        >
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </Select>
        <Select
          label="重要程度"
          name="importance"
          value={query.importance ?? ""}
          onChange={(event) => updateQuery("importance", event.target.value)}
        >
          <option value="">全部重要程度</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </Select>
        <Select
          label="紧急程度"
          name="urgency"
          value={query.urgency ?? ""}
          onChange={(event) => updateQuery("urgency", event.target.value)}
        >
          <option value="">全部紧急程度</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </Select>
        <Select
          label="标签"
          name="tagId"
          value={query.tagId ?? ""}
          onChange={(event) => updateQuery("tagId", event.target.value)}
        >
          <option value="">全部标签</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </Select>
        <Select
          label="排序"
          name="sortBy"
          value={query.sortBy ?? "createdAt"}
          onChange={(event) => updateQuery("sortBy", event.target.value)}
        >
          <option value="createdAt">创建时间</option>
          <option value="updatedAt">更新时间</option>
          <option value="dueTime">截止时间</option>
          <option value="startTime">开始时间</option>
          <option value="importance">重要程度</option>
          <option value="urgency">紧急程度</option>
        </Select>
        <Button variant="secondary" type="button" onClick={() => setQuery(defaultQuery)}>
          <RotateCcw aria-hidden="true" />
          清空
        </Button>
      </FilterBar>

      {loading ? <SkeletonList rows={4} /> : null}
      {!loading && error ? (
        <EmptyState
          title="日程无法加载"
          description={error}
          action={<Button onClick={() => void load()}>重试</Button>}
        />
      ) : null}
      {!loading && !error && schedules.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "没有匹配结果" : "还没有日程"}
          description={hasActiveFilters ? "换个条件试试。" : "先添加一个吧。"}
          action={
            <Link className="button button--primary" to="/schedules/new">
              <Plus aria-hidden="true" />
              新建日程
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
                  {schedule.completed ? "重新打开" : "完成"}
                </Button>
                <Link className="button button--ghost button--sm" to={`/schedules/${schedule.id}/edit`}>
                  编辑
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(schedule)}>
                  <Trash2 aria-hidden="true" />
                  删除
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
            上一页
          </Button>
          <span>
            第 {data.pagination.page} 页 / 共 {Math.max(data.pagination.totalPages, 1)} 页
          </span>
          <Button
            variant="secondary"
            disabled={data.pagination.page >= data.pagination.totalPages}
            onClick={() => updatePage(data.pagination.page + 1)}
          >
            下一页
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除日程"
        description={`确定删除“${deleteTarget?.title ?? "此日程"}”吗？此操作无法撤销。`}
        confirmLabel="删除"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
