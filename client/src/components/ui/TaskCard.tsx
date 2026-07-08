import { CalendarClock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { Schedule } from "../../types/domain";
import { formatDateTime, isOverdue } from "../../utils/date";
import { cn } from "../../lib/cn";
import { ImportanceBadge, UrgencyBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { TagPill } from "./TagPill";

export function TaskCard({ schedule, compact = false }: { schedule: Schedule; compact?: boolean }) {
  const overdue = isOverdue(schedule.dueTime, schedule.completed);
  return (
    <Link
      to={`/schedules/${schedule.id}`}
      className={cn(
        "task-card",
        compact && "task-card--compact",
        schedule.completed && "task-card--completed",
        overdue && "task-card--overdue",
      )}
    >
      <div className="task-card__main">
        <div>
          <h3>{schedule.title}</h3>
          {schedule.description && !compact ? <p>{schedule.description}</p> : null}
        </div>
        {schedule.completed ? <CheckCircle2 aria-label="Completed" /> : null}
      </div>
      <div className="task-card__meta">
        <span>
          <CalendarClock aria-hidden="true" />
          {formatDateTime(schedule.dueTime ?? schedule.startTime)}
        </span>
        {overdue ? <span className="task-card__overdue">Overdue</span> : null}
      </div>
      {!compact ? (
        <div className="task-card__badges">
          <StatusBadge value={schedule.status} />
          <ImportanceBadge value={schedule.importance} />
          <UrgencyBadge value={schedule.urgency} />
        </div>
      ) : null}
      {schedule.tags.length > 0 ? (
        <div className="task-card__tags">
          {schedule.tags.slice(0, compact ? 2 : 5).map((tag) => (
            <TagPill key={tag.id} color={tag.color} name={tag.name} />
          ))}
        </div>
      ) : null}
    </Link>
  );
}
